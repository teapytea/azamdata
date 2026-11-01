import type { Session } from '@supabase/supabase-js'
import { type PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { AuthContext, type AuthContextValue, type AuthStatus } from '@/providers/auth-context'

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<AuthStatus>(isSupabaseConfigured ? 'loading' : 'unconfigured')

  useEffect(() => {
    if (!supabase) return undefined

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setStatus(nextSession ? 'authenticated' : 'anonymous')
    })

    return () => data.subscription.unsubscribe()
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    status,
    session,
    user: session?.user ?? null,
    async signIn(email, password) {
      if (!supabase) throw new Error('Supabase is not configured')
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    },
    async signOut() {
      if (!supabase) return
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
  }), [session, status])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
