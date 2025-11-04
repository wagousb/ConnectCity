// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

// Local type definitions to satisfy the compiler outside Deno environment
declare namespace Deno {
  const env: {
    get(key: string): string | undefined;
  };
}

interface ProfileId {
    id: string;
}

interface NotificationPayload {
    post_id: string;
    actor_id: string;
    post_type: 'announcement' | 'speech';
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  const { post_id, actor_id, post_type } = await req.json() as NotificationPayload

  if (!post_id || !actor_id || !post_type) {
    return new Response(JSON.stringify({ error: 'Missing required fields: post_id, actor_id, post_type' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Create a Supabase client with the Service Role Key for elevated permissions
  const supabaseServiceRole = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    // 1. Fetch all user IDs from the profiles table
    const { data: profiles, error: profilesError } = await supabaseServiceRole
      .from('profiles')
      .select('id')
      .neq('id', actor_id) // Exclude the author (actor) from receiving the notification
      .returns<ProfileId[]>()

    if (profilesError) throw profilesError

    if (profiles.length === 0) {
        return new Response(JSON.stringify({ message: 'No other users to notify.' }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    // Determine notification type based on post_type
    const notificationType = post_type === 'announcement' ? 'announcement' : 'speech';

    // 2. Prepare notification inserts
    const notificationsToInsert = profiles.map((profile: ProfileId) => ({
      user_id: profile.id,
      actor_id: actor_id,
      type: notificationType,
      entity_id: post_id,
      is_read: false,
    }))

    // 3. Insert notifications in bulk
    const { error: insertError } = await supabaseServiceRole
      .from('notifications')
      .insert(notificationsToInsert)

    if (insertError) throw insertError

    return new Response(JSON.stringify({ message: `Successfully notified ${notificationsToInsert.length} users.` }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in notify-all-users function:', error)
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})