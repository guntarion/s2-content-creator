
'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome</h1>
        <p className="mb-8">Sign in to continue</p>
        <Button onClick={() => signIn('google', { callbackUrl: '/generate' })}>
          Sign in with Google
        </Button>
      </div>
    </div>
  )
}
