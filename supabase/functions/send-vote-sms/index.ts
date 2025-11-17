import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SmsRequest {
  phoneNumber: string;
  voterName: string;
  voterId?: string;
  templateType?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  let logId: string | null = null;

  try {
    const { phoneNumber, voterName, voterId, templateType = 'vote_confirmation' }: SmsRequest = await req.json();

    console.log('Sending SMS to:', phoneNumber, 'Template:', templateType);

    // Validate required environment variables
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio credentials not configured');
    }

    // Get template from database
    const { data: template, error: templateError } = await supabase
      .from('notification_templates')
      .select('message_template')
      .eq('template_type', templateType)
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      console.error('Template error:', templateError);
      throw new Error('Failed to load notification template');
    }

    // Replace template variables
    let messageBody = template.message_template
      .replace('{{voterName}}', voterName);

    // Format phone number (ensure it starts with +)
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

    // Create initial log entry
    const { data: logEntry, error: logError } = await supabase
      .from('sms_delivery_logs')
      .insert({
        voter_id: voterId || null,
        phone_number: formattedPhone,
        message_content: messageBody,
        template_type: templateType,
        status: 'pending'
      })
      .select()
      .single();

    if (logError) {
      console.error('Failed to create log entry:', logError);
    } else {
      logId = logEntry.id;
    }

    // Prepare Twilio API request
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    
    const body = new URLSearchParams({
      To: formattedPhone,
      From: TWILIO_PHONE_NUMBER,
      Body: messageBody
    });

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!twilioResponse.ok) {
      const error = await twilioResponse.text();
      console.error('Twilio API error:', error);
      
      // Update log with failure
      if (logId) {
        await supabase
          .from('sms_delivery_logs')
          .update({
            status: 'failed',
            error_message: error,
            updated_at: new Date().toISOString()
          })
          .eq('id', logId);
      }
      
      throw new Error(`Twilio API error: ${twilioResponse.status} - ${error}`);
    }

    const result = await twilioResponse.json();
    console.log('SMS sent successfully:', result.sid);

    // Update log with success
    if (logId) {
      await supabase
        .from('sms_delivery_logs')
        .update({
          status: 'sent',
          twilio_message_sid: result.sid,
          updated_at: new Date().toISOString()
        })
        .eq('id', logId);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageSid: result.sid,
        logId: logId,
        message: 'SMS sent successfully' 
      }), 
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in send-vote-sms function:', error);
    
    // Update log with failure if we created one
    if (logId) {
      await supabase
        .from('sms_delivery_logs')
        .update({
          status: 'failed',
          error_message: error.message,
          updated_at: new Date().toISOString()
        })
        .eq('id', logId);
    }
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
