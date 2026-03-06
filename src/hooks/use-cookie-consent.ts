'use client'

import { useState, useEffect } from 'react'

type ConsentState = 'pending' | 'accepted' | 'rejected'

const STORAGE_KEY = 'cookie_consent'

export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentState>('pending')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentState | null
    if (stored === 'accepted' || stored === 'rejected') {
      setConsent(stored)
    }
    setIsLoaded(true)
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setConsent('accepted')
  }

  function reject() {
    localStorage.setItem(STORAGE_KEY, 'rejected')
    setConsent('rejected')
  }

  return {
    consent,
    isLoaded,
    hasConsented: consent === 'accepted',
    hasPending: isLoaded && consent === 'pending',
    accept,
    reject,
  }
}
