import { createClient } from '@supabase/supabase-js'

export interface AuditLogParams {
  admin_id: string
  admin_email: string
  action: string
  entity_type: string
  entity_id?: string
  changes?: Record<string, { old: unknown; new: unknown }> | null
  ip_address?: string
  user_agent?: string
}

export async function logAdminAction(params: AuditLogParams, request?: Request): Promise<void> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const ip_address = request
      ? (request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        request.headers.get('x-real-ip') ??
        undefined)
      : params.ip_address

    const user_agent = request
      ? (request.headers.get('user-agent') ?? undefined)
      : params.user_agent

    await supabase.from('admin_audit_log').insert({
      admin_id: params.admin_id,
      admin_email: params.admin_email,
      action: params.action,
      entity_type: params.entity_type,
      entity_id: params.entity_id ?? null,
      changes: params.changes ?? null,
      ip_address: ip_address ?? null,
      user_agent: user_agent ?? null,
    })
  } catch (error) {
    console.error('[AuditLogger] Failed to log admin action:', error)
  }
}
