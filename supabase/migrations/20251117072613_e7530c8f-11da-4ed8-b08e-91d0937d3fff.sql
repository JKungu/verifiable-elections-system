-- Create notification templates table
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  template_type text NOT NULL CHECK (template_type IN ('vote_confirmation', 'registration', 'election_reminder', 'results_announcement')),
  message_template text NOT NULL,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create SMS delivery logs table
CREATE TABLE IF NOT EXISTS public.sms_delivery_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id uuid REFERENCES public.voters(id),
  phone_number text NOT NULL,
  message_content text NOT NULL,
  template_type text,
  status text NOT NULL CHECK (status IN ('sent', 'delivered', 'failed', 'pending')),
  twilio_message_sid text,
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_delivery_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_templates
CREATE POLICY "Election authorities can manage templates"
  ON public.notification_templates
  FOR ALL
  USING (is_election_authority());

CREATE POLICY "System auditors can view templates"
  ON public.notification_templates
  FOR SELECT
  USING (is_system_auditor());

-- RLS Policies for sms_delivery_logs
CREATE POLICY "Election authorities can view delivery logs"
  ON public.sms_delivery_logs
  FOR SELECT
  USING (is_election_authority());

CREATE POLICY "System auditors can view delivery logs"
  ON public.sms_delivery_logs
  FOR SELECT
  USING (is_system_auditor());

CREATE POLICY "System can insert delivery logs"
  ON public.sms_delivery_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update delivery logs"
  ON public.sms_delivery_logs
  FOR UPDATE
  USING (true);

-- Insert default templates
INSERT INTO public.notification_templates (name, template_type, message_template, is_active) VALUES
  ('Vote Confirmation', 'vote_confirmation', 'Hello {{voterName}}, your vote has been successfully recorded. Thank you for participating in the election! Your vote matters.', true),
  ('Registration Confirmation', 'registration', 'Hello {{voterName}}, welcome! Your voter registration has been confirmed. You can now participate in upcoming elections.', true),
  ('Election Reminder', 'election_reminder', 'Hello {{voterName}}, reminder: Election day is {{electionDate}}. Make sure to cast your vote!', true),
  ('Results Announcement', 'results_announcement', 'Hello {{voterName}}, election results are now available. Thank you for your participation!', true);

-- Create indexes for better performance
CREATE INDEX idx_sms_delivery_logs_voter_id ON public.sms_delivery_logs(voter_id);
CREATE INDEX idx_sms_delivery_logs_status ON public.sms_delivery_logs(status);
CREATE INDEX idx_sms_delivery_logs_created_at ON public.sms_delivery_logs(created_at DESC);
CREATE INDEX idx_notification_templates_type ON public.notification_templates(template_type);
CREATE INDEX idx_notification_templates_active ON public.notification_templates(is_active);