CREATE TABLE IF NOT EXISTS webrtc_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_peer_id TEXT NOT NULL,
  to_peer_id TEXT NOT NULL,
  stream_id UUID NOT NULL REFERENCES live_streams(id),
  signal_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webrtc_signals_to_peer_id ON webrtc_signals(to_peer_id);
CREATE INDEX IF NOT EXISTS idx_webrtc_signals_stream_id ON webrtc_signals(stream_id);
