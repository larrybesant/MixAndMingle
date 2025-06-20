"use client"
import { Card } from "../ui/card"
import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase/client"
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar"
import { useRouter, useParams } from "next/navigation"
import { LiveStream } from "@/components/streaming/live-stream"
import { DailyVideoRoom } from "@/components/streaming/DailyVideoRoom"

export const RoomView = () => {
  const router = useRouter();
  const params = useParams();
  const roomId = params?.id as string;
  const [reported, setReported] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [participantsLoading, setParticipantsLoading] = useState(true);
  const [participantsError, setParticipantsError] = useState<string | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [roomSettings, setRoomSettings] = useState<any>(null);
  const [isModerator, setIsModerator] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sending, setSending] = useState(false);
  const [lastSent, setLastSent] = useState<number>(0);
  const RATE_LIMIT_MS = 1500;

  // Live stream status for room
  const [streamStatus, setStreamStatus] = useState<'offline' | 'live' | 'error' | 'loading'>("loading");
  const [streamError, setStreamError] = useState<string | null>(null);
  const [dailyRoomUrl, setDailyRoomUrl] = useState<string | null>(null);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailyError, setDailyError] = useState<string | null>(null);

  // Room privacy state
  const [privacy, setPrivacy] = useState<string>(roomSettings?.privacy || "public");
  const [privacySaving, setPrivacySaving] = useState(false);

  // Track viewers in real time
  const [viewers, setViewers] = useState<any[]>([]);
  const [viewersLoading, setViewersLoading] = useState(true);
  const [viewersError, setViewersError] = useState<string | null>(null);

  // Moderation state
  const [bannedUsers, setBannedUsers] = useState<string[]>([]);
  const [mutedUsers, setMutedUsers] = useState<string[]>([]);

  // Helper: check if current user is a follower of the host
  async function userIsFollower(userId: string | null, hostId: string | null) {
    if (!userId || !hostId) return false;
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', userId)
      .eq('following_id', hostId)
      .single();
    return !!data;
  }

  // Helper: check if current user is invited to this room
  async function userIsInvited(userId: string | null, roomId: string | null) {
    if (!userId || !roomId) return false;
    const { data, error } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'room_invite')
      .eq('data->>room_id', roomId)
      .single();
    return !!data;
  }

  // State for privacy access
  const [hasAccess, setHasAccess] = useState(false);
  const [accessLoading, setAccessLoading] = useState(true);

  useEffect(() => {
    async function joinRoom() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
        await supabase.from('room_participants').upsert({ room_id: roomId, user_id: data.user.id });
      }
    }
    async function fetchRoomSettings() {
      // Example: room_settings table with { room_id, host_id, moderators (array), chat_filter_enabled, chat_rules (text) }
      const { data } = await supabase.from('room_settings').select('*').eq('room_id', roomId).single();
      setRoomSettings(data);
      if (data) {
        setIsModerator(
          userId && (data.host_id === userId || (Array.isArray(data.moderators) && data.moderators.includes(userId)))
        );
      }
    }
    joinRoom();
    fetchRoomSettings();
    // Subscribe to room participants
    const participantSub = supabase
      .channel('room_participants')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_participants', filter: `room_id=eq.${roomId}` }, (payload: any) => {
        fetchParticipants();
      })
      .subscribe();
    // Subscribe to chat messages
    const messageSub = supabase
      .channel('chat_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` }, (payload: any) => {
        setMessages(msgs => [...msgs, payload.new]);
      })
      .subscribe();
    // Subscribe to changes in viewers
    const viewerSub = supabase
      .channel('room_viewers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_viewers', filter: `room_id=eq.${roomId}` }, (payload: any) => {
        fetchViewers();
      })
      .subscribe();
    fetchParticipants();
    fetchMessages();
    fetchViewers();
    return () => {
      supabase.removeChannel(participantSub);
      supabase.removeChannel(messageSub);
      supabase.removeChannel(viewerSub);
    };
    async function fetchParticipants() {
      setParticipantsLoading(true);
      setParticipantsError(null);
      const { data, error } = await supabase.from('room_participants').select('user_id, profiles(username, avatar_url)').eq('room_id', roomId);
      if (error) setParticipantsError('Failed to load participants.');
      setParticipants(data || []);
      // Build userId to username map
      const map: Record<string, string> = {};
      (data || []).forEach((p: any) => {
        if (p.user_id && p.profiles?.username) map[p.user_id] = p.profiles.username;
      });
      setUserMap(map);
      setParticipantsLoading(false);
    }
    async function fetchMessages() {
      setMessagesLoading(true);
      setMessagesError(null);
      const { data, error } = await supabase.from('chat_messages').select('*').eq('room_id', roomId).order('created_at', { ascending: true });
      if (error) setMessagesError('Failed to load messages.');
      setMessages(data || []);
      setMessagesLoading(false);
    }
    async function fetchViewers() {
      setViewersLoading(true);
      setViewersError(null);
      // Fetch all users currently viewing this room (excluding self)
      const { data, error } = await supabase
        .from('room_viewers')
        .select('user_id, profiles(username, avatar_url, gender)')
        .eq('room_id', roomId);
      if (error) setViewersError('Failed to load viewers.');
      setViewers(data?.filter((v: any) => v.user_id !== userId) || []);
      setViewersLoading(false);
    }
  }, [roomId, userId]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen for stream status (simulate for now)
  useEffect(() => {
    setStreamStatus("loading");
    setStreamError(null);
    // TODO: Replace with real status from backend/WebRTC
    const timeout = setTimeout(() => {
      setStreamStatus("live"); // or "offline" if not live
    }, 1000);
    return () => clearTimeout(timeout);
  }, [roomId]);

  // Fetch Daily.co room URL for this room
  useEffect(() => {
    async function fetchDailyRoom() {
      setDailyLoading(true);
      setDailyError(null);
      try {
        const resp = await fetch("/api/daily-room", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId }),
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || "Failed to get Daily room");
        setDailyRoomUrl(data.url);
      } catch (err: any) {
        setDailyError(err.message || "Failed to get Daily room");
      } finally {
        setDailyLoading(false);
      }
    }
    if (roomId) fetchDailyRoom();
  }, [roomId]);

  // Helper to sanitize chat input (remove HTML tags, trim, limit length)
  function sanitizeInput(input: string, maxLength: number = 300): string {
    return input.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim().slice(0, maxLength);
  }

  // Simple profanity filter (expand as needed)
  const PROFANITY_LIST = [
    "fuck", "shit", "bitch", "asshole", "cunt", "nigger", "fag", "dick", "pussy", "bastard", "slut", "whore"
  ];
  function containsProfanity(text: string): boolean {
    const lower = text.toLowerCase();
    return PROFANITY_LIST.some(word => lower.includes(word));
  }

  // Only apply profanity filter if enabled in room settings
  function shouldFilterProfanity() {
    return !!roomSettings?.chat_filter_enabled;
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bannedUsers.includes(userId!)) {
      alert("You are banned from this room.");
      return;
    }
    if (mutedUsers.includes(userId!)) {
      alert("You are muted and cannot send messages in this room.");
      return;
    }
    const now = Date.now();
    if (now - lastSent < RATE_LIMIT_MS) return;
    const cleanMsg = sanitizeInput(message);
    if (!cleanMsg || !userId) return;
    if (shouldFilterProfanity() && containsProfanity(cleanMsg)) {
      alert("This room has chat filtering enabled. Please avoid offensive language.");
      return;
    }
    setSending(true);
    await supabase.from('chat_messages').insert({ room_id: roomId, user_id: userId, message: cleanMsg });
    setMessage("");
    setSending(false);
    setLastSent(now);
  };

  const handleReport = () => {
    setReported(true);
    alert("User reported. Thank you for your feedback.");
  };

  const handleBlock = () => {
    setBlocked(true);
    alert("User blocked. You will no longer see this user.");
  };

  // Update privacy in room_settings (host/mod only)
  async function updatePrivacy(newPrivacy: string) {
    setPrivacySaving(true);
    await supabase.from('room_settings').update({ privacy: newPrivacy }).eq('room_id', roomId);
    setPrivacy(newPrivacy);
    setPrivacySaving(false);
  }

  // Check access to stream/chat based on privacy settings
  useEffect(() => {
    async function checkAccess() {
      setAccessLoading(true);
      if (privacy === 'public') {
        setHasAccess(true);
      } else if (privacy === 'followers' && userId && roomSettings?.host_id) {
        setHasAccess(await userIsFollower(userId, roomSettings.host_id));
      } else if (privacy === 'invite' && userId && roomId) {
        setHasAccess(await userIsInvited(userId, roomId));
      } else {
        setHasAccess(false);
      }
      setAccessLoading(false);
    }
    if (userId && roomSettings) checkAccess();
  }, [privacy, userId, roomSettings, roomId]);

  // On mount, add self as viewer; on unmount, remove
  useEffect(() => {
    let active = true;
    async function addViewer() {
      if (userId && roomId) {
        await supabase.from('room_viewers').upsert({ room_id: roomId, user_id: userId });
      }
    }
    async function removeViewer() {
      if (userId && roomId) {
        await supabase.from('room_viewers').delete().eq('room_id', roomId).eq('user_id', userId);
      }
    }
    addViewer();
    return () => {
      active = false;
      removeViewer();
    };
  }, [roomId, userId]);

  // Helper to get gender symbol
  function getGenderSymbol(gender: string | undefined) {
    if (!gender) return "";
    switch (gender.toLowerCase()) {
      case "male": return "\u2642\uFE0F"; // ♂️
      case "female": return "\u2640\uFE0F"; // ♀️
      case "nonbinary": return "\u26A7\uFE0F"; // ⚧️
      case "transgender": return "\ud83d\udc68\u200d\u2695\ufe0f"; // 👨‍⚕️ (placeholder, no unicode for trans)
      case "other": return "\u2753"; // ❓
      default: return "";
    }
  }

  // Moderation actions
  async function banUser(user_id: string) {
    await supabase.from('room_bans').upsert({ room_id: roomId, user_id });
    setBannedUsers(b => [...b, user_id]);
  }
  async function unbanUser(user_id: string) {
    await supabase.from('room_bans').delete().eq('room_id', roomId).eq('user_id', user_id);
    setBannedUsers(b => b.filter(id => id !== user_id));
  }
  async function muteUser(user_id: string) {
    await supabase.from('room_mutes').upsert({ room_id: roomId, user_id });
    setMutedUsers(m => [...m, user_id]);
  }
  async function unmuteUser(user_id: string) {
    await supabase.from('room_mutes').delete().eq('room_id', roomId).eq('user_id', user_id);
    setMutedUsers(m => m.filter(id => id !== user_id));
  }

  // Fetch banned/muted users for this room
  useEffect(() => {
    async function fetchModeration() {
      const { data: bans } = await supabase.from('room_bans').select('user_id').eq('room_id', roomId);
      setBannedUsers((bans || []).map((b: any) => b.user_id));
      const { data: mutes } = await supabase.from('room_mutes').select('user_id').eq('room_id', roomId);
      setMutedUsers((mutes || []).map((m: any) => m.user_id));
    }
    if (isModerator && roomId) fetchModeration();
  }, [isModerator, roomId]);

  // On join, check if banned and auto-leave if so
  useEffect(() => {
    if (!userId || !roomId) return;
    if (bannedUsers.includes(userId)) {
      alert("You have been banned from this room.");
      router.push("/discover");
    }
  }, [userId, roomId, bannedUsers]);

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-2">Live User Room</h2>
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${streamStatus === "live" ? "bg-red-600 text-white animate-pulse" : "bg-gray-700 text-gray-300"}`}>
            {streamStatus === "live" ? "LIVE" : streamStatus === "offline" ? "OFFLINE" : "Loading..."}
          </span>
          {/* Show viewer count if live */}
          {streamStatus === "live" && (
            <span className="text-xs text-white bg-black/40 px-2 py-1 rounded flex items-center gap-1">
              <svg width="16" height="16" fill="currentColor" className="inline-block"><circle cx="8" cy="8" r="7" stroke="white" strokeWidth="2" fill="none" /></svg>
              Live viewers
            </span>
          )}
          {/* Show error if stream failed */}
          {streamStatus === "error" && (
            <span className="text-xs text-red-400 ml-2">Stream error. <button className="underline" onClick={() => setStreamStatus("loading")}>Retry</button></span>
          )}
        </div>
        {/* Host/moderator privacy control */}
        {isModerator && (
          <div className="mb-2 flex items-center gap-2">
            <label className="text-xs text-white">Stream privacy:</label>
            <select
              value={privacy}
              onChange={e => updatePrivacy(e.target.value)}
              className="bg-gray-800 text-white rounded px-2 py-1 text-xs"
              disabled={privacySaving}
            >
              <option value="public">Public (anyone can view)</option>
              <option value="followers">Followers only</option>
              <option value="invite">Invite-only</option>
            </select>
            {privacySaving && <span className="text-xs text-gray-400 ml-2">Saving...</span>}
          </div>
        )}
        {/* Privacy notice for viewers */}
        {privacy !== "public" && (
          <div className="text-xs text-yellow-300 mb-2">This stream is {privacy === "followers" ? "restricted to followers" : "invite-only"}.</div>
        )}
        {dailyLoading && <div className="text-gray-400">Loading video room...</div>}
        {dailyError && <div className="text-red-400">{dailyError}</div>}
        {/* Only show video if allowed by privacy */}
        {dailyRoomUrl && accessLoading && (
          <div className="text-gray-400 text-center p-4">Checking access...</div>
        )}
        {dailyRoomUrl && !accessLoading && hasAccess && (
          <DailyVideoRoom roomUrl={dailyRoomUrl} isHost={isModerator} />
        )}
        {dailyRoomUrl && !accessLoading && !hasAccess && (
          <div className="text-red-400 text-center p-4">You do not have permission to view this stream.</div>
        )}
      </div>
      <div className="mb-4">
        <h3 className="font-semibold text-white mb-2">Live Users</h3>
        {isModerator && (
          <div className="mb-2 text-xs text-yellow-300">You are a host/moderator. Click a user to ban/mute/unban/unmute.</div>
        )}
        {participantsLoading ? (
          <div className="text-gray-400">Loading participants...</div>
        ) : participantsError ? (
          <div className="text-red-400">{participantsError}</div>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {participants.map((p, i) => (
              <div key={i} className="flex flex-col items-center">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={p.profiles?.avatar_url || undefined} alt={p.profiles?.username || "User"} />
                  <AvatarFallback>{(p.profiles?.username || "U").charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-white mt-1 flex items-center gap-1">
                  {p.profiles?.username || "User"}
                  {p.profiles?.gender && (
                    <span title={p.profiles.gender} className="ml-1">
                      {getGenderSymbol(p.profiles.gender)}
                    </span>
                  )}
                </span>
                {isModerator && userId !== p.user_id && (
                  <div className="flex gap-1 mt-1">
                    {bannedUsers.includes(p.user_id) ? (
                      <button className="text-xs bg-green-700 text-white rounded px-2 py-1" onClick={() => unbanUser(p.user_id)}>Unban</button>
                    ) : (
                      <button className="text-xs bg-red-700 text-white rounded px-2 py-1" onClick={() => banUser(p.user_id)}>Ban</button>
                    )}
                    {mutedUsers.includes(p.user_id) ? (
                      <button className="text-xs bg-green-700 text-white rounded px-2 py-1" onClick={() => unmuteUser(p.user_id)}>Unmute</button>
                    ) : (
                      <button className="text-xs bg-yellow-700 text-white rounded px-2 py-1" onClick={() => muteUser(p.user_id)}>Mute</button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mb-4">
        <h3 className="font-semibold text-white mb-2">Chat</h3>
        {(!accessLoading && !hasAccess) ? (
          <div className="text-red-400 text-center p-4">You do not have permission to view or participate in chat.</div>
        ) : (
          <>
            {roomSettings?.chat_rules && (
              <div className="text-xs text-yellow-300 mb-2 bg-yellow-900/30 rounded p-2">
                <span className="font-bold">Room Rules:</span> {roomSettings.chat_rules}
              </div>
            )}
            {roomSettings?.chat_filter_enabled && (
              <div className="text-xs text-blue-300 mb-2">This room has chat filtering enabled by the host/moderators.</div>
            )}
            {messagesLoading ? (
              <div className="text-gray-400">Loading messages...</div>
            ) : messagesError ? (
              <div className="text-red-400">{messagesError}</div>
            ) : (
              <div className="bg-gray-900 rounded p-2 h-40 overflow-y-auto mb-2 flex flex-col gap-2">
                {messages.map((msg, i) => {
                  const participant = participants.find((p: any) => p.user_id === msg.user_id);
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={participant?.profiles?.avatar_url || undefined} alt={participant?.profiles?.username || "User"} />
                        <AvatarFallback>{(participant?.profiles?.username || "U").charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-bold text-purple-400 text-xs flex items-center gap-1">
                        {userMap[msg.user_id] || msg.user_id}
                        {participant?.profiles?.gender && (
                          <span title={participant.profiles.gender} className="ml-1">
                            {getGenderSymbol(participant.profiles.gender)}
                          </span>
                        )}
                      </span>
                      <span className="text-white text-sm break-words">{msg.message}</span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
            <form onSubmit={handleSendMessage} className="flex gap-2 mt-2" aria-label="Send a message">
              <input
                className="flex-1 p-2 rounded bg-gray-700 text-white"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={mutedUsers.includes(userId!) ? "You are muted" : "Type a message..."}
                aria-label="Message input"
                disabled={sending || mutedUsers.includes(userId!)}
                maxLength={300}
                required
              />
              <button type="submit" className="bg-blue-600 px-4 py-2 rounded text-white font-bold" disabled={!message.trim() || sending || mutedUsers.includes(userId!)} aria-label="Send message">
                {sending ? <span className="animate-spin">⏳</span> : "Send"}
              </button>
            </form>
            {/* Quick Reactions */}
            <div className="flex gap-2 mt-2">
              {["🔥", "💜", "🎵", "⚡", "👏", "🙌"].map((emoji) => (
                <button
                  key={emoji}
                  onClick={async () => {
                    if (!userId) return;
                    if (Date.now() - lastSent < RATE_LIMIT_MS) return;
                    setSending(true);
                    // No profanity check for emoji reactions
                    await supabase.from('chat_messages').insert({ room_id: roomId, user_id: userId, message: emoji });
                    setSending(false);
                    setLastSent(Date.now());
                  }}
                  className="text-2xl hover:scale-125 transition-transform duration-200"
                  aria-label={`Send ${emoji} reaction`}
                  disabled={sending}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="mb-4">
        <h3 className="font-semibold text-white mb-2">Who's Watching You</h3>
        {viewersLoading ? (
          <div className="text-gray-400">Loading viewers...</div>
        ) : viewersError ? (
          <div className="text-red-400">{viewersError}</div>
        ) : viewers.length === 0 ? (
          <div className="text-gray-400">No one is currently watching you.</div>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {viewers.map((v, i) => (
              <div key={i} className="flex flex-col items-center">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={v.profiles?.avatar_url || undefined} alt={v.profiles?.username || "User"} />
                  <AvatarFallback>{(v.profiles?.username || "U").charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-white mt-1 flex items-center gap-1">
                  {v.profiles?.username || "User"}
                  {v.profiles?.gender && (
                    <span title={v.profiles.gender} className="ml-1">
                      {getGenderSymbol(v.profiles.gender)}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Host/Mod Live Analytics */}
      {isModerator && (
        <div className="mb-4 p-3 bg-gray-800/80 rounded-lg flex flex-col gap-2">
          <div className="text-sm text-blue-300 font-bold">Live Analytics</div>
          <div className="flex gap-6">
            <div className="text-xs text-white">Viewers: <span className="font-bold">{viewers.length}</span></div>
            <div className="text-xs text-white">Chat Messages: <span className="font-bold">{messages.length}</span></div>
          </div>
        </div>
      )}
      <div className="mt-4 flex gap-2">
        <button
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          onClick={handleReport}
          disabled={reported}
        >
          {reported ? "Reported" : "Report User"}
        </button>
        <button
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
          onClick={handleBlock}
          disabled={blocked}
        >
          {blocked ? "Blocked" : "Block User"}
        </button>
      </div>
    </Card>
  );
};
