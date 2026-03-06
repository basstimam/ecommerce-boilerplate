import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 50,
    color: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  storeName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 9,
    color: '#6B7280',
    lineHeight: 1.5,
  },
  invoiceTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    textAlign: 'right',
    marginBottom: 8,
  },
  invoiceMeta: {
    fontSize: 9,
    color: '#6B7280',
    textAlign: 'right',
    lineHeight: 1.6,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginVertical: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  addressText: {
    fontSize: 10,
    color: '#111827',
    lineHeight: 1.6,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  tableHeaderText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  colDescription: { flex: 4 },
  colQty: { flex: 1, textAlign: 'right' },
  colUnit: { flex: 1.5, textAlign: 'right' },
  colTotal: { flex: 1.5, textAlign: 'right' },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  totalsLabel: { width: 100, fontSize: 10, color: '#6B7280', textAlign: 'right' },
  totalsValue: { width: 80, fontSize: 10, textAlign: 'right' },
  totalsBold: {
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    fontSize: 8,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  vatNotice: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F9FAFB',
  },
})

function formatPence(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`
}

interface OrderItem {
  product_name: string
  variant_options?: Record<string, string>
  quantity: number
  unit_price_pence: number
  total_price_pence?: number
}

interface ShippingAddress {
  full_name: string
  line1: string
  line2?: string
  city: string
  county?: string
  postcode: string
  country: string
}

interface OrderData {
  id: string
  order_number?: string | null
  created_at: string
  items?: OrderItem[]
  shipping_address?: unknown
  subtotal_pence?: number
  vat_pence?: number
  shipping_pence?: number
  discount_pence?: number
  total_pence?: number
  stripe_payment_intent_id?: string | null
}

export function InvoiceDocument({ order }: { order: OrderData }) {
  const items = (order.items ?? []) as OrderItem[]
  const address = order.shipping_address as ShippingAddress | undefined
  const orderRef = order.order_number ?? order.id.slice(0, 8).toUpperCase()

  return (
    <Document title={`Invoice - ${orderRef}`} author="My Store">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.storeName}>My Store</Text>
            <Text style={styles.storeAddress}>
              123 High Street{'\n'}
              London, SW1A 1AA{'\n'}
              United Kingdom{'\n'}
              VAT No: GB123456789
            </Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
            <Text style={styles.invoiceMeta}>
              Invoice #: INV-{orderRef}{'\n'}
              Order #: {orderRef}{'\n'}
              Date: {new Date(order.created_at).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {address && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bill To / Ship To</Text>
            <Text style={styles.addressText}>
              {address.full_name}{'\n'}
              {address.line1}
              {address.line2 ? `\n${address.line2}` : ''}
              {'\n'}{address.city}
              {address.county ? `, ${address.county}` : ''}
              {'\n'}{address.postcode}{'\n'}
              {address.country}
            </Text>
          </View>
        )}

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDescription]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colUnit]}>Unit Price</Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
          </View>

          {items.map((item, idx) => {
            const lineTotal = item.total_price_pence ?? item.unit_price_pence * item.quantity
            const variantStr = item.variant_options
              ? Object.entries(item.variant_options).map(([k, v]) => `${k}: ${v}`).join(', ')
              : ''
            return (
              <View key={idx} style={styles.tableRow}>
                <View style={styles.colDescription}>
                  <Text style={{ fontSize: 10, color: '#111827' }}>{item.product_name}</Text>
                  {variantStr ? <Text style={{ fontSize: 8, color: '#9CA3AF', marginTop: 2 }}>{variantStr}</Text> : null}
                </View>
                <Text style={[{ fontSize: 10 }, styles.colQty]}>{item.quantity}</Text>
                <Text style={[{ fontSize: 10 }, styles.colUnit]}>{formatPence(item.unit_price_pence)}</Text>
                <Text style={[{ fontSize: 10 }, styles.colTotal]}>{formatPence(lineTotal)}</Text>
              </View>
            )
          })}
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal (ex. VAT)</Text>
            <Text style={styles.totalsValue}>{formatPence(order.subtotal_pence ?? 0)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>VAT (20%)</Text>
            <Text style={styles.totalsValue}>{formatPence(order.vat_pence ?? 0)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Shipping</Text>
            <Text style={styles.totalsValue}>
              {(order.shipping_pence ?? 0) === 0 ? 'FREE' : formatPence(order.shipping_pence ?? 0)}
            </Text>
          </View>
          {(order.discount_pence ?? 0) > 0 && (
            <View style={styles.totalsRow}>
              <Text style={[styles.totalsLabel, { color: '#16A34A' }]}>Discount</Text>
              <Text style={[styles.totalsValue, { color: '#16A34A' }]}>-{formatPence(order.discount_pence!)}</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.totalsRow}>
            <Text style={[styles.totalsLabel, styles.totalsBold]}>Total (incl. VAT)</Text>
            <Text style={[styles.totalsValue, styles.totalsBold]}>{formatPence(order.total_pence ?? 0)}</Text>
          </View>
        </View>

        <View style={styles.vatNotice}>
          <Text>This invoice confirms that VAT has been applied at the applicable UK rate(s). VAT Reg No: GB123456789.</Text>
        </View>

        <Text style={styles.footer}>
          My Store · 123 High Street, London SW1A 1AA · hello@mystore.co.uk · VAT GB123456789
          {'\n'}Thank you for your order!
        </Text>
      </Page>
    </Document>
  )
}
