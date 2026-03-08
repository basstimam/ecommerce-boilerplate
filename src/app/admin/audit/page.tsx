import { createClient } from '@/lib/supabase/server'
import { ClipboardList } from 'lucide-react'

export const metadata = { title: 'Audit Log' }

function getActionBadgeClass(action: string): string {
  const verb = (action.split('.').pop() ?? action).toLowerCase()
  if (/creat|add|insert/.test(verb)) return 'bg-green-100 text-green-800'
  if (/updat|edit|set|chang|status|assign|mov/.test(verb)) return 'bg-blue-100 text-blue-800'
  if (/delet|remov|cancel|refund|void/.test(verb)) return 'bg-red-100 text-red-800'
  if (/login|sign_in/.test(verb)) return 'bg-purple-100 text-purple-800'
  if (/logout|sign_out/.test(verb)) return 'bg-gray-100 text-gray-600'
  return 'bg-gray-100 text-gray-600'
}

function formatAction(action: string): string {
  return action.replace(/\./g, ' › ').replace(/_/g, ' ')
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string }>
}) {
  const { page, action } = await searchParams
  const supabase = await createClient()

  const pageNum = Math.max(1, parseInt(page ?? '1'))
  const pageSize = 50
  const from = (pageNum - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (action) query = query.eq('action', action)

  const { data: logs, count } = await query
  const totalPages = Math.ceil((count ?? 0) / pageSize)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <p className="mt-1 text-sm text-gray-500">{count ?? 0} events recorded</p>
      </div>

      <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        {!logs || logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ClipboardList className="h-10 w-10 text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-500">No audit events recorded yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Admin actions will be logged here automatically
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3 text-gray-600 truncate max-w-[150px]">
                    {log.user_id?.slice(0, 8) ?? 'system'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getActionBadgeClass(log.action)}`}
                    >
                      {formatAction(log.action)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <span className="font-medium">{log.table_name}</span>
                    {log.record_id && (
                      <span className="text-gray-400"> #{log.record_id.slice(0, 8)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 truncate max-w-[200px]">
                    {log.changes ? JSON.stringify(log.changes).slice(0, 80) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500">
            Page {pageNum} of {totalPages}
          </p>
          <div className="flex gap-2">
            {pageNum > 1 && (
              <a
                href={`?page=${pageNum - 1}${action ? `&action=${action}` : ''}`}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Previous
              </a>
            )}
            {pageNum < totalPages && (
              <a
                href={`?page=${pageNum + 1}${action ? `&action=${action}` : ''}`}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
