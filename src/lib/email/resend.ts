import { sendEmail } from '@/lib/email/mailer'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

const formatPence = (p: number) => `£${(p / 100).toFixed(2)}`

export async function sendOrderConfirmationEmail({
  to,
  orderNumber,
  customerName,
  items,
  totalPence,
  orderId,
}: {
  to: string
  orderNumber: string
  customerName: string
  items: Array<{ name: string; quantity: number; totalPence: number }>
  totalPence: number
  orderId: string
}) {
  const itemRows = items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6">${i.name}</td><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:center">${i.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:right">${formatPence(i.totalPence)}</td></tr>`,
    )
    .join('')

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order Confirmation</title></head>
<body style="font-family:Arial,sans-serif;background:#f9fafb;margin:0;padding:0">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="background:#111827;padding:24px 32px">
      <h1 style="color:#fff;margin:0;font-size:20px">My Store</h1>
    </div>
    <div style="padding:32px">
      <h2 style="font-size:22px;color:#111827;margin-top:0">Order Confirmed!</h2>
      <p style="color:#6b7280">Hi ${customerName},</p>
      <p style="color:#6b7280">Thank you for your order. We've received your order and will start processing it shortly.</p>
      <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:24px 0">
        <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px">Order Reference</p>
        <p style="margin:0;font-size:16px;font-weight:bold;color:#111827">#${orderNumber}</p>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="border-bottom:2px solid #e5e7eb">
            <th style="text-align:left;padding:8px 0;font-size:11px;color:#9ca3af;text-transform:uppercase">Item</th>
            <th style="text-align:center;padding:8px 0;font-size:11px;color:#9ca3af;text-transform:uppercase">Qty</th>
            <th style="text-align:right;padding:8px 0;font-size:11px;color:#9ca3af;text-transform:uppercase">Price</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:12px 0 0;font-weight:bold;color:#111827">Total</td>
            <td style="padding:12px 0 0;text-align:right;font-weight:bold;color:#111827">${formatPence(totalPence)}</td>
          </tr>
        </tfoot>
      </table>
      <div style="margin-top:32px;text-align:center">
        <a href="${APP_URL}/account/orders/${orderId}"
           style="background:#111827;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
          View Order
        </a>
      </div>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0">
      <p style="font-size:12px;color:#9ca3af;text-align:center;margin:0">
        My Store · 123 High Street, London SW1A 1AA<br>
        Questions? Email <a href="mailto:support@mystore.co.uk" style="color:#6b7280">support@mystore.co.uk</a>
      </p>
    </div>
  </div>
</body>
</html>`

  return sendEmail({ to, subject: `Order Confirmed: #${orderNumber}`, html })
}

export async function sendShippingConfirmationEmail({
  to,
  orderNumber,
  customerName,
  trackingNumber,
  trackingUrl,
}: {
  to: string
  orderNumber: string
  customerName: string
  trackingNumber?: string
  trackingUrl?: string
}) {
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f9fafb;margin:0;padding:0">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="background:#111827;padding:24px 32px">
      <h1 style="color:#fff;margin:0;font-size:20px">My Store</h1>
    </div>
    <div style="padding:32px">
      <h2 style="color:#111827;margin-top:0">Your Order Is On Its Way!</h2>
      <p style="color:#6b7280">Hi ${customerName},</p>
      <p style="color:#6b7280">Great news! Your order <strong>#${orderNumber}</strong> has been shipped and is on its way to you.</p>
      ${
        trackingNumber
          ? `<div style="background:#f9fafb;border-radius:8px;padding:16px;margin:24px 0">
        <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;text-transform:uppercase">Tracking Number</p>
        <p style="margin:0;font-size:16px;font-weight:bold;color:#111827">${trackingNumber}</p>
        ${trackingUrl ? `<a href="${trackingUrl}" style="color:#6b7280;font-size:13px">Track your parcel →</a>` : ''}
      </div>`
          : ''
      }
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0">
      <p style="font-size:12px;color:#9ca3af;text-align:center;margin:0">My Store · support@mystore.co.uk</p>
    </div>
  </div>
</body>
</html>`

  return sendEmail({ to, subject: `Shipped: Your Order #${orderNumber} Is On Its Way`, html })
}
