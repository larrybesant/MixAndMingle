-- Create dj_followers table if it doesn't exist
CREATE TABLE IF NOT EXISTS dj_followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dj_id UUID NOT NULL REFERENCES dj_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, dj_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_dj_followers_user_id ON dj_followers(user_id);
CREATE INDEX IF NOT EXISTS idx_dj_followers_dj_id ON dj_followers(dj_id);

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content JSONB NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Create function to send notification when a followed DJ goes live
CREATE OR REPLACE FUNCTION notify_followers_on_stream_start()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'live' AND (OLD.status IS NULL OR OLD.status != 'live') THEN
    INSERT INTO notifications (user_id, type, content)
    SELECT 
      df.user_id,
      'stream_started',
      json_build_object(
        'stream_id', NEW.id,
        'stream_title', NEW.title,
        'dj_id', NEW.dj_id,
        'dj_name', (SELECT artist_name FROM dj_profiles WHERE id = NEW.dj_id)
      )
    FROM dj_followers df
    WHERE df.dj_id = NEW.dj_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for stream start notifications
DROP TRIGGER IF EXISTS trigger_notify_followers_on_stream_start ON live_streams;
CREATE TRIGGER trigger_notify_followers_on_stream_start
AFTER INSERT OR UPDATE OF status ON live_streams
FOR EACH ROW
EXECUTE PROCEDURE notify_followers_on_stream_start();

-- Create function to clean up old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '30 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to clean up old notifications
DROP TRIGGER IF EXISTS trigger_cleanup_old_notifications ON notifications;
CREATE TRIGGER trigger_cleanup_old_notifications
AFTER INSERT ON notifications
FOR EACH STATEMENT
EXECUTE PROCEDURE cleanup_old_notifications();
