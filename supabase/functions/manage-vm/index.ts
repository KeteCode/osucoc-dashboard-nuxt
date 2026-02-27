import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { InstancesClient } from "npm:@google-cloud/compute"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const projectId = Deno.env.get('GCP_PROJECT_ID')
    const zone = Deno.env.get('GCP_VM_ZONE')
    const instanceName = Deno.env.get('GCP_VM_NAME')
    const clientEmail = Deno.env.get('GCP_CLIENT_EMAIL')
    const privateKey = Deno.env.get('GCP_PRIVATE_KEY')?.replace(/\\n/g, '\n')

    if (!projectId || !zone || !instanceName || !clientEmail || !privateKey) {
      throw new Error('Missing GCP configuration environment variables')
    }

    const client = new InstancesClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      projectId,
    })

    const { method } = req
    if (method === 'GET') {
      const url = new URL(req.url)
      const fetchLogs = url.searchParams.get('logs') === 'true'

      const [instance] = await client.get({
        project: projectId,
        zone,
        instance: instanceName,
      })

      const metadata = instance.metadata?.items || []
      const startTimeItem = metadata.find((item: any) => item.key === 'restreamer-start-time')
      const startTime = startTimeItem ? new Date(startTimeItem.value) : null
      
      let uptimeRemaining = 0
      if (startTime && instance.status === 'RUNNING') {
        const sixHoursInMs = 6 * 60 * 60 * 1000
        const elapsed = Date.now() - startTime.getTime()
        uptimeRemaining = Math.max(0, sixHoursInMs - elapsed)
      }

      let logs = ''
      if (fetchLogs) {
        try {
          const [output] = await client.getSerialPortOutput({
            project: projectId,
            zone,
            instance: instanceName,
            port: 1,
          })
          logs = output.contents || ''
          if (logs.length > 5000) {
            logs = logs.substring(logs.length - 5000)
          }
        } catch (logErr) {
          console.error('Error fetching logs:', logErr)
          logs = `Could not fetch serial port logs: ${logErr.message}`
        }
      }

      return new Response(JSON.stringify({
        status: instance.status,
        startTime,
        uptimeRemaining,
        logs,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (method === 'POST') {
      const { action } = await req.json()
      let operation

      try {
        if (action === 'start') {
          [operation] = await client.start({
            project: projectId,
            zone,
            instance: instanceName,
          })
        } else if (action === 'stop') {
          [operation] = await client.stop({
            project: projectId,
            zone,
            instance: instanceName,
          })
        } else {
          return new Response(JSON.stringify({ error: 'Invalid action' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
      } catch (gcpError) {
        console.error('GCP Operation Error:', gcpError)
        return new Response(JSON.stringify({ 
          error: 'GCP Operation Failed', 
          details: gcpError.message,
          code: gcpError.code 
        }), {
          status: 500, // Return 500 so client sees error, but with details body
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ message: `Action ${action} initiated`, operation }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('Global Error:', err)
    return new Response(JSON.stringify({ error: err.message, stack: err.stack }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
