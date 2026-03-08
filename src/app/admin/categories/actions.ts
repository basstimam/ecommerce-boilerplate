'use server'

import { logAdminAction, type AuditLogParams } from '@/lib/audit/logger'

export async function auditCategoryAction(params: AuditLogParams): Promise<void> {
  await logAdminAction(params)
}
