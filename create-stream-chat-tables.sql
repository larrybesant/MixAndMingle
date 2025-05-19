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

-- Create stream_viewers table if it doesn't exist
CREATE TABLE IF NOT EXISTS stream_viewers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_stream_viewers_stream_id ON stream_viewers(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_viewers_user_id ON stream_viewers(user_id);
CREATE INDEX IF NOT EXISTS idx_stream_viewers_left_at ON stream_viewers(left_at);

-- Create a function to clean up old chat messages
CREATE OR REPLACE FUNCTION cleanup_old_chat_messages()
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

-- Create a trigger to clean up old chat messages
DROP TRIGGER IF EXISTS trigger_cleanup_old_chat_messages ON live_streams;
CREATE TRIGGER trigger_cleanup_old_chat_messages
AFTER UPDATE OF status ON live_streams
FOR EACH ROW
WHEN (NEW.status = 'ended')
EXECUTE PROCEDURE cleanup_old_chat_messages();

-- Create a unique constraint to prevent duplicate viewers
ALTER TABLE stream_viewers 
DROP CONSTRAINT IF EXISTS unique_stream_viewer;

ALTER TABLE stream_viewers 
ADD CONSTRAINT unique_stream_viewer 
UNIQUE (stream_id, user_id, (left_at IS NULL))
WHERE left_at IS NULL;
