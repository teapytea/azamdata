import { type FormEvent, type PropsWithChildren, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/providers/auth-context'

export function AuthGate({ children }: PropsWithChildren) {
  const { status } = useAuth()

  if (status === 'unconfigured') return <ConfigurationRequired />
  if (status === 'loading') return <AuthLoading />
  if (status === 'anonymous') return <SignInScreen />
  return children
}

function AuthLoading() {
  return (
    <main className="auth-screen">
      <div className="auth-panel auth-loading" role="status">
        <img alt="Personal OS" src="/assets/personal-os.png" />
        <div className="loading-spinner" />
        <p>Checking your session…</p>
      </div>
    </main>
  )
}

function ConfigurationRequired() {
  return (
    <main className="auth-screen">
      <section className="auth-panel configuration-panel">
        <img alt="Personal OS" src="/assets/personal-os.png" />
        <p className="eyebrow">Backend setup required</p>
        <h1>Connect Personal OS to Supabase</h1>
        <p>The interface no longer falls back to mock data. Add your project URL and publishable key to a local <code>.env</code> file, then apply the included database migration.</p>
        <div className="config-code">
          <code>VITE_SUPABASE_URL=…</code>
          <code>VITE_SUPABASE_PUBLISHABLE_KEY=…</code>
        </div>
        <p className="auth-note"><Icon name="lock" size={17} /> Never put the service-role key in frontend environment variables.</p>
      </section>
    </main>
  )
}

function SignInScreen() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signIn(email, password)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Sign in failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-panel sign-in-panel">
        <img alt="Personal OS" src="/assets/personal-os.png" />
        <p className="eyebrow">Private workspace</p>
        <h1>Sign in to Personal OS</h1>
        <p>Use the account created in your Supabase dashboard. Public registration is disabled.</p>
        <form onSubmit={handleSubmit}>
          <label>Email<input autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
          <label>Password<input autoComplete="current-password" minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></label>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button className="primary-action" disabled={submitting} type="submit">{submitting ? 'Signing in…' : 'Sign in'} <Icon name="arrow_forward" size={19} /></button>
        </form>
      </section>
    </main>
  )
}
