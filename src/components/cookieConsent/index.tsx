'use client'
// components/CookieConsentBanner.tsx
import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'

const CookieConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const existingConsent = Cookies.get('cookieConsent')
    if (!existingConsent) {
      setShowBanner(true)
    }
  }, [])

  const handleConsent = (choice: 'accept' | 'reject') => {
    Cookies.set('cookieConsent', choice, { expires: 365 })
    setShowBanner(false)

    // Update GTM consent settings via dataLayer push
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'gtm.consentUpdate',
        'gtm.consent': {
          analytics_storage: choice === 'accept' ? 'granted' : 'denied',
          ad_storage: choice === 'accept' ? 'granted' : 'denied',
        },
      })
    }
  }

  return (
    showBanner ? (
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white px-4 py-3 flex flex-col md:flex-row items-center justify-between z-50">
        <span className="text-sm">
          We use cookies to enhance your experience and analyze site traffic. By clicking &ldquo;Accept,&rdquo; you agree to the use of non-essential cookies. For more details, please see our{' '}
          <a href="/cookie-policy" target="_blank" className="text-blue-300 hover:underline">
            Cookie Policy
          </a>.
        </span>
        <div className="flex space-x-2 mt-2 md:mt-0">
          <button onClick={() => handleConsent('reject')} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
            Reject
          </button>
          <button onClick={() => handleConsent('accept')} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
            Accept
          </button>
        </div>
      </div>
    ) : null
  )
}

export default CookieConsentBanner
