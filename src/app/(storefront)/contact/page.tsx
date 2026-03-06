'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Loader2, CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  subject: z.string().min(4, 'Subject must be at least 4 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
})

type ContactForm = z.infer<typeof contactSchema>

const CONTACT_INFO = [
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@ukstore.co.uk',
    href: 'mailto:hello@ukstore.co.uk',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+44 (0) 20 0000 0000',
    href: 'tel:+442000000000',
  },
  {
    icon: MapPin,
    label: 'Address',
    value: '123 High Street, London, EC1A 1BB',
    href: null,
  },
  {
    icon: Clock,
    label: 'Hours',
    value: 'Mon–Fri: 9am–5pm GMT',
    href: null,
  },
]

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', subject: '', message: '' },
  })

  async function onSubmit() {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setIsLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Get in Touch</h1>
          <p className="mt-2 text-muted-foreground">
            We&apos;d love to hear from you. Send us a message and we&apos;ll get back to you
            within one business day.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-4">
            {CONTACT_INFO.map((info) => (
              <Card key={info.label}>
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <info.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {info.label}
                    </p>
                    {info.href ? (
                      <a
                        href={info.href}
                        className="mt-0.5 text-sm font-medium hover:text-primary hover:underline"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="mt-0.5 text-sm font-medium">{info.value}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              {submitted ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <CheckCircle2 className="mb-4 h-12 w-12 text-green-600" />
                  <h2 className="text-xl font-semibold">Message Sent!</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Thanks for reaching out. We&apos;ll reply within one business day.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => {
                      setSubmitted(false)
                      form.reset()
                    }}
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Jane Smith" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="jane@example.co.uk" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="Order enquiry, product question, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us how we can help..."
                              rows={5}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
