import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

const productLinks = [
  { href: '/products', label: 'All Products' },
  { href: '/products?featured=true', label: 'Featured' },
  { href: '/products?sort=newest', label: 'New Arrivals' },
]

const helpLinks = [
  { href: '/pages/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/pages/shipping-returns', label: 'Shipping & Returns' },
]

const legalLinks = [
  { href: '/pages/privacy-policy', label: 'Privacy Policy' },
  { href: '/pages/terms-conditions', label: 'Terms & Conditions' },
  { href: '/pages/cookie-policy', label: 'Cookie Policy' },
]

export function Footer() {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? 'UK Store'
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="text-lg font-bold">
              {storeName}
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Quality products delivered across the UK.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Products</h3>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Help</h3>
            <ul className="space-y-2">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <p>
            &copy; {currentYear} {storeName}. All rights reserved.
          </p>
          <div className="text-center text-xs">
            <p>Registered in England &amp; Wales</p>
            <p>VAT Registration No: GB000000000</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
