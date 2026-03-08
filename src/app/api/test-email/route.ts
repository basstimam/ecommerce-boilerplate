import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/mailer'
import { sendOrderConfirmationEmail, sendShippingConfirmationEmail } from '@/lib/email/resend'

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? 'basic'

  try {
    if (type === 'order-confirmation') {
      await sendOrderConfirmationEmail({
        to: 'customer@ukstore.dev',
        orderNumber: 'ORD-010000',
        customerName: 'Test Customer',
        items: [{ name: 'Classic White Oxford Shirt', quantity: 1, totalPence: 4999 }],
        totalPence: 5394,
        orderId: 'eb1c68eb-9ee4-4e29-9d68-0dd69c9d816b',
      })
      return NextResponse.json({ success: true, message: 'Order confirmation email sent to Mailpit' })
    }

    if (type === 'shipping') {
      await sendShippingConfirmationEmail({
        to: 'customer@ukstore.dev',
        orderNumber: 'ORD-010000',
        customerName: 'Test Customer',
        trackingNumber: 'JD0002393456789012',
        trackingUrl: 'https://track.royalmail.com/tracking/JD0002393456789012',
      })
      return NextResponse.json({ success: true, message: 'Shipping confirmation email sent to Mailpit' })
    }

    await sendEmail({
      to: 'test@example.com',
      subject: 'Test Email from My Store',
      html: '<h1>It works!</h1><p>This is a test email from your e-commerce boilerplate.</p><p>If you see this in Mailpit, email is working correctly.</p>',
    })
    return NextResponse.json({
      success: true,
      message: 'Test email sent. Check Mailpit at http://localhost:8025',
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
