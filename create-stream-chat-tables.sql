-- Check if stream_chat_messages table exists, if not create it
CREATE TABLE IF NOT EXISTS stream_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_stream_chat_messages_stream_id ON stream_chat_messages(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_chat_messages_created_at ON stream_chat_messages(created_at);

-- Create a function to clean up old chat messages (optional, for very active streams)
CREATE OR REPLACE FUNCTION cleanup_old_stream_chat_messages()
RETURNS TRIGGER AS $$
BEGIN
  -- Keep only the last 1000 messages per stream
  DELETE FROM stream_chat_messages
  WHERE id IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY stream_id ORDER BY created_at DESC) as row_num
      FROM stream_chat_messages
      WHERE stream_id = NEW.stream_id
    ) as ranked
    WHERE row_num > 1000
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to clean up old chat messages
DROP TRIGGER IF EXISTS trigger_cleanup_old_stream_chat_messages ON stream_chat_messages;
CREATE TRIGGER trigger_cleanup_old_stream_chat_messages
AFTER INSERT ON stream_chat_messages
EXECUTE PROCEDURE cleanup_old_stream_chat_messages();
