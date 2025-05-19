-- Create a table for WebRTC signaling
CREATE TABLE IF NOT EXISTS webrtc_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  signal JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Add an index to speed up queries
  INDEX idx_webrtc_signals_receiver (receiver_id, stream_id, created_at DESC)
);

-- Create a function to clean up old signals
CREATE OR REPLACE FUNCTION cleanup_old_signals()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete signals older than 5 minutes
  DELETE FROM webrtc_signals
  WHERE created_at < NOW() - INTERVAL '5 minutes';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to run the cleanup function
CREATE TRIGGER trigger_cleanup_old_signals
AFTER INSERT ON webrtc_signals
EXECUTE FUNCTION cleanup_old_signals();
