import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: false,
    flowType: 'pkce',
  },
})

export class OAuthNotConfiguredError extends Error {
  constructor(provider: string) {
    super(`${provider} OAuth is not configured in Supabase. Please enable it in the Supabase Dashboard.`)
    this.name = 'OAuthNotConfiguredError'
  }
}

async function signInWithOAuth(provider: 'google' | 'facebook'): Promise<void> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      ...(provider === 'google' ? { queryParams: { access_type: 'online', prompt: 'select_account' } } : {}),
    },
  })

  if (error) {
    // 400 means provider is not configured in Supabase Dashboard
    if (error.message?.includes('400') || error.status === 400 || error.message?.toLowerCase().includes('provider')) {
      throw new OAuthNotConfiguredError(provider)
    }
    throw new Error(error.message)
  }

  // signInWithOAuth returns a URL to redirect to — Supabase handles it automatically
  if (!data.url) {
    throw new OAuthNotConfiguredError(provider)
  }
}

export async function signInWithGoogle(): Promise<void> {
  return signInWithOAuth('google')
}

export async function signInWithFacebook(): Promise<void> {
  return signInWithOAuth('facebook')
}

export async function getOAuthSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session) return null
  return data.session
}

export async function signOutSupabase() {
  await supabase.auth.signOut()
}
