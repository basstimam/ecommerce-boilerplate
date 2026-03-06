import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ slug: string }>
}

const CMS_PAGES: Record<string, { title: string; body: string }> = {
  'about': {
    title: 'About Us',
    body: `
      <h2>Who We Are</h2>
      <p>We are a UK-based online retailer committed to bringing you quality products at fair prices. Founded in London, we ship across the United Kingdom and pride ourselves on excellent customer service.</p>

      <h2>Our Mission</h2>
      <p>To make quality products accessible to everyone in the UK, with fast delivery, transparent pricing, and hassle-free returns.</p>

      <h2>Why Shop With Us</h2>
      <ul>
        <li>Free delivery on orders over £50</li>
        <li>30-day returns policy</li>
        <li>Secure checkout powered by Stripe</li>
        <li>UK-based customer support</li>
      </ul>
    `,
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    body: `
      <p><em>Last updated: January 2025</em></p>

      <h2>1. Who We Are</h2>
      <p>This Privacy Policy applies to UK Store Ltd ("we", "our", "us"). Our registered address is 123 High Street, London, EC1A 1BB.</p>

      <h2>2. Data We Collect</h2>
      <p>We collect personal data you provide when creating an account, placing an order, or contacting us. This includes your name, email address, postal address, and payment information (processed by Stripe — we never store card details).</p>

      <h2>3. How We Use Your Data</h2>
      <ul>
        <li>To process and fulfil your orders</li>
        <li>To send transactional emails (order confirmation, shipping updates)</li>
        <li>To provide customer support</li>
        <li>To comply with our legal obligations</li>
      </ul>

      <h2>4. Legal Basis (UK GDPR)</h2>
      <p>We process your data on the basis of contract performance (to fulfil orders), legal obligation, and — where applicable — legitimate interests or consent (for marketing).</p>

      <h2>5. Your Rights</h2>
      <p>Under UK GDPR you have the right to access, rectify, erase, restrict, or port your data. Contact us at privacy@ukstore.co.uk to exercise these rights.</p>

      <h2>6. Cookies</h2>
      <p>We use essential cookies for the shopping cart and authentication. We request your consent before setting analytics or marketing cookies.</p>

      <h2>7. Contact</h2>
      <p>For data-related enquiries: privacy@ukstore.co.uk</p>
    `,
  },
  'terms-of-service': {
    title: 'Terms of Service',
    body: `
      <p><em>Last updated: January 2025</em></p>

      <h2>1. Acceptance</h2>
      <p>By accessing our website or placing an order, you agree to be bound by these Terms of Service and our Privacy Policy.</p>

      <h2>2. Products & Pricing</h2>
      <p>All prices are displayed in GBP and include VAT unless otherwise stated. We reserve the right to change prices at any time without notice.</p>

      <h2>3. Orders</h2>
      <p>An order acknowledgement email does not constitute acceptance of your order. A contract is formed when we dispatch your goods.</p>

      <h2>4. Delivery</h2>
      <p>We deliver to addresses within the United Kingdom only. Delivery timescales are estimates and not guaranteed.</p>

      <h2>5. Returns & Refunds</h2>
      <p>Under the Consumer Contracts Regulations 2013, you have 14 days to cancel an order and 14 further days to return goods. We offer an extended 30-day returns policy.</p>

      <h2>6. Governing Law</h2>
      <p>These terms are governed by the laws of England and Wales.</p>
    `,
  },
  'returns-policy': {
    title: 'Returns Policy',
    body: `
      <h2>Our 30-Day Returns Guarantee</h2>
      <p>We want you to be completely happy with your purchase. If you are not satisfied for any reason, you may return most items within 30 days of delivery.</p>

      <h2>Conditions for Returns</h2>
      <ul>
        <li>Items must be unused and in their original packaging</li>
        <li>Include your order number with the return</li>
        <li>Certain items (e.g. hygiene products, digital downloads) are non-returnable</li>
      </ul>

      <h2>How to Return</h2>
      <ol>
        <li>Contact us at returns@ukstore.co.uk with your order number</li>
        <li>We will provide a prepaid returns label for faulty items</li>
        <li>Package your item securely and drop off at your nearest post office</li>
      </ol>

      <h2>Refunds</h2>
      <p>Refunds are processed within 5 business days of receiving your return, back to your original payment method.</p>
    `,
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    body: `
      <h2>What Are Cookies?</h2>
      <p>Cookies are small text files stored on your device when you visit our website.</p>

      <h2>Cookies We Use</h2>

      <h3>Essential Cookies</h3>
      <p>Required for the website to function. These cannot be disabled. They include your shopping cart and session tokens.</p>

      <h3>Analytics Cookies</h3>
      <p>Help us understand how visitors use our website (e.g. page views, traffic sources). Only set with your consent.</p>

      <h3>Marketing Cookies</h3>
      <p>Used to show you relevant adverts. Only set with your consent.</p>

      <h2>Managing Cookies</h2>
      <p>You can update your preferences at any time via the cookie settings banner at the bottom of the page, or through your browser settings.</p>
    `,
  },
}

export async function generateStaticParams() {
  return Object.keys(CMS_PAGES).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = CMS_PAGES[slug]
  if (!page) return { title: 'Page Not Found' }
  return { title: page.title }
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params
  const page = CMS_PAGES[slug]

  if (!page) notFound()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">{page.title}</h1>
        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: page.body }}
        />
      </div>
    </div>
  )
}
