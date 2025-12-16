// app/page.tsx
// Root page - redirects to signin

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to signin page
    router.push('/signin')
  }, [router])

  return null
}
