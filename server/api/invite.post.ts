import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  const user = await serverSupabaseUser(event)
  const client = await serverSupabaseClient(event)

  // Only authenticated users should be able to invite
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const { email, role } = await readBody(event)

  if (!email || !role) {
    throw createError({ statusCode: 400, message: 'Email and role are required.' })
  }

  // Use the admin client to invite a user
  const { data, error } = await client.auth.admin.inviteUserByEmail(email, {
    data: { role: role }, // You can pass additional user metadata here
  })

  if (error) {
    console.error('Error inviting user:', error.message)
    throw createError({ statusCode: 500, message: `Failed to invite user: ${error.message}` })
  }

  return { status: 200, message: `Successfully sent invitation to ${email}.` , user: data.user }
})
