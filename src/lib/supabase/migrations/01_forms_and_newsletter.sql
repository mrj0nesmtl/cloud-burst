-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active, unsubscribed
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_form_submissions table
CREATE TABLE IF NOT EXISTS contact_form_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new', -- new, in_progress, resolved
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  registration_type TEXT NOT NULL, -- attendee, photographer, organizer
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, cancelled
  payment_status TEXT, -- paid, unpaid, refunded
  payment_amount DECIMAL(10, 2),
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Create pricing_plan_subscriptions table
CREATE TABLE IF NOT EXISTS pricing_plan_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL, -- free, basic, pro
  status TEXT NOT NULL DEFAULT 'active', -- active, cancelled, past_due
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  payment_method TEXT,
  subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plan_subscriptions ENABLE ROW LEVEL SECURITY;

-- Newsletter subscribers policies
CREATE POLICY "Allow admins to manage newsletter subscribers"
  ON newsletter_subscribers
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('super_admin', 'admin')
  ));

-- Contact form submissions policies
CREATE POLICY "Allow admins to manage contact form submissions"
  ON contact_form_submissions
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('super_admin', 'admin')
  ));

-- Event registrations policies
CREATE POLICY "Allow users to view their own event registrations"
  ON event_registrations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow event hosts to view registrations for their events"
  ON event_registrations
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT user_id FROM events WHERE id = event_registrations.event_id
  ));

CREATE POLICY "Allow admins to manage all event registrations"
  ON event_registrations
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('super_admin', 'admin')
  ));

-- Pricing plan subscriptions policies
CREATE POLICY "Allow users to view their own subscriptions"
  ON pricing_plan_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow admins to manage all subscriptions"
  ON pricing_plan_subscriptions
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('super_admin', 'admin')
  ));

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_newsletter_subscribers_updated_at
BEFORE UPDATE ON newsletter_subscribers
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_contact_form_submissions_updated_at
BEFORE UPDATE ON contact_form_submissions
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_event_registrations_updated_at
BEFORE UPDATE ON event_registrations
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_pricing_plan_subscriptions_updated_at
BEFORE UPDATE ON pricing_plan_subscriptions
FOR EACH ROW EXECUTE FUNCTION update_modified_column(); 