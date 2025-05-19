-- Create a table for stream recordings
CREATE TABLE IF NOT EXISTS stream_recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  dj_id UUID NOT NULL REFERENCES dj_profiles(id) ON DELETE CASCADE,
  recording_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stream_recordings_stream_id ON stream_recordings(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_recordings_dj_id ON stream_recordings(dj_id);
