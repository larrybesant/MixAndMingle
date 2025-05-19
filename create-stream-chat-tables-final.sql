-- Create stream_chat_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS stream_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_stream_chat_messages_stream_id ON stream_chat_messages(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_chat_messages_user_id ON stream_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_stream_chat_messages_created_at ON stream_chat_messages(created_at);

-- Create stream_chat_banned_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS stream_chat_banned_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  banned_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(stream_id, user_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_stream_chat_banned_users_stream_id ON stream_chat_banned_users(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_chat_banned_users_user_id ON stream_chat_banned_users(user_id);

-- Create stream_chat_moderators table if it doesn't exist
CREATE TABLE IF NOT EXISTS stream_chat_moderators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(stream_id, user_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_stream_chat_moderators_stream_id ON stream_chat_moderators(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_chat_moderators_user_id ON stream_chat_moderators(user_id);

-- Create function to clean up old chat messages
CREATE OR REPLACE FUNCTION cleanup_old_stream_chat_messages()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete messages older than 7 days for ended streams
  DELETE FROM stream_chat_messages
  WHERE stream_id IN (
    SELECT id FROM live_streams
    WHERE status = 'ended' AND ended_at < NOW() - INTERVAL '7 days'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to clean up old chat messages
DROP TRIGGER IF EXISTS trigger_cleanup_old_stream_chat_messages ON live_streams;
CREATE TRIGGER trigger_cleanup_old_stream_chat_messages
AFTER UPDATE OF status ON live_streams
FOR EACH ROW
WHEN (NEW.status = 'ended')
EXECUTE PROCEDURE cleanup_old_stream_chat_messages();

-- Create stream_chat_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS stream_chat_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  slow_mode_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  slow_mode_interval INTEGER NOT NULL DEFAULT 5,
  subscribers_only_mode BOOLEAN NOT NULL DEFAULT FALSE,
  followers_only_mode BOOLEAN NOT NULL DEFAULT FALSE,
  emote_only_mode BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(stream_id)
);

-- Create stream_chat_banned_words table if it doesn't exist
CREATE TABLE IF NOT EXISTS stream_chat_banned_words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  added_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(stream_id, word)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stream_chat_banned_words_stream_id ON stream_chat_banned_words(stream_id);
