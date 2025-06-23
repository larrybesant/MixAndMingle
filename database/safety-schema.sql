-- Safety & Community Protection System Schema
-- Add these tables to your existing database

-- Community reports table
CREATE TABLE IF NOT EXISTS community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_content_id UUID, -- Room, message, profile content
  content_type TEXT, -- 'room', 'message', 'profile', 'stream'
  report_type TEXT NOT NULL CHECK (report_type IN ('harassment', 'hate_speech', 'bullying', 'threats', 'inappropriate_content', 'spam', 'fake_profile', 'underage', 'copyright', 'other')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  evidence_urls TEXT[], -- Screenshots, recordings
  is_anonymous BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'escalated', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Moderation actions table
CREATE TABLE IF NOT EXISTS moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES community_reports(id) ON DELETE CASCADE,
  moderator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('warning', 'mute', 'suspend', 'ban', 'content_removal', 'strike', 'appeal_approved', 'appeal_denied')),
  duration_hours INTEGER, -- For temporary actions
  reason TEXT NOT NULL,
  internal_notes TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User blocks/mutes table
CREATE TABLE IF NOT EXISTS user_moderation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('block', 'mute')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_user_id, action_type)
);

-- Community guidelines acceptance
CREATE TABLE IF NOT EXISTS guidelines_acceptance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guidelines_version TEXT NOT NULL DEFAULT '1.0',
  accepted_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Age verification
CREATE TABLE IF NOT EXISTS age_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  birth_date DATE,
  verification_method TEXT CHECK (verification_method IN ('self_reported', 'parental_consent', 'id_verification')),
  is_verified BOOLEAN DEFAULT false,
  requires_parental_consent BOOLEAN DEFAULT false,
  parent_email TEXT,
  verification_document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trust scores (for automated moderation)
CREATE TABLE IF NOT EXISTS user_trust_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  score INTEGER DEFAULT 100 CHECK (score >= 0 AND score <= 100),
  reports_received INTEGER DEFAULT 0,
  reports_upheld INTEGER DEFAULT 0,
  strikes INTEGER DEFAULT 0,
  last_violation TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safety incidents (for tracking patterns)
CREATE TABLE IF NOT EXISTS safety_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  incident_type TEXT NOT NULL,
  description TEXT,
  automatic_detection BOOLEAN DEFAULT false,
  confidence_score DECIMAL(3,2), -- For ML-based detection
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  relationship TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_reports_reporter ON community_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_community_reports_reported_user ON community_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_community_reports_status ON community_reports(status);
CREATE INDEX IF NOT EXISTS idx_community_reports_created_at ON community_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_target_user ON moderation_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_active ON moderation_actions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_moderation_user ON user_moderation(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trust_scores_user ON user_trust_scores(user_id);

-- Enable Row Level Security
ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_moderation ENABLE ROW LEVEL SECURITY;
ALTER TABLE guidelines_acceptance ENABLE ROW LEVEL SECURITY;
ALTER TABLE age_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_trust_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Community reports: Users can see their own reports and what they've been reported for
CREATE POLICY "Users can view their own reports" ON community_reports
  FOR SELECT USING (auth.uid() = reporter_id OR auth.uid() = reported_user_id);

CREATE POLICY "Users can create reports" ON community_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- User moderation: Users can manage their own blocks/mutes
CREATE POLICY "Users can manage their moderation actions" ON user_moderation
  FOR ALL USING (auth.uid() = user_id);

-- Guidelines acceptance: Users can view their own acceptance
CREATE POLICY "Users can view their guidelines acceptance" ON guidelines_acceptance
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can accept guidelines" ON guidelines_acceptance
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Age verification: Users can manage their own verification
CREATE POLICY "Users can manage their age verification" ON age_verification
  FOR ALL USING (auth.uid() = user_id);

-- Trust scores: Users can view their own score
CREATE POLICY "Users can view their trust score" ON user_trust_scores
  FOR SELECT USING (auth.uid() = user_id);

-- Emergency contacts: Users can manage their own contacts
CREATE POLICY "Users can manage emergency contacts" ON emergency_contacts
  FOR ALL USING (auth.uid() = user_id);

-- Functions for automatic trust score updates
CREATE OR REPLACE FUNCTION update_trust_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Update trust score when moderation action is taken
  IF TG_OP = 'INSERT' AND NEW.action_type IN ('warning', 'mute', 'suspend', 'ban', 'strike') THEN
    INSERT INTO user_trust_scores (user_id, score, strikes, last_violation)
    VALUES (NEW.target_user_id, 100, 1, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      score = GREATEST(user_trust_scores.score - 
        CASE NEW.action_type
          WHEN 'warning' THEN 5
          WHEN 'mute' THEN 10
          WHEN 'suspend' THEN 20
          WHEN 'ban' THEN 50
          WHEN 'strike' THEN 15
          ELSE 0
        END, 0),
      strikes = user_trust_scores.strikes + 1,
      last_violation = NOW(),
      updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic trust score updates
CREATE TRIGGER trigger_update_trust_score
  AFTER INSERT ON moderation_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_trust_score();
