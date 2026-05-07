'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function getField(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function buildSignupRedirect(formData: FormData, error: string) {
  const params = new URLSearchParams({
    error,
  })

  const path = getField(formData, 'onboarding_mode') === 'tutor_code' ? 'tutor-code' : ''
  if (path) params.set('path', path)

  const fields = [
    'full_name',
    'age_range',
    'working_level',
    'target_grade',
    'study_style',
    'tutor_code',
    'recommended_topic',
  ]

  for (const field of fields) {
    const value = getField(formData, field)
    if (value) params.set(field, value)
  }

  return `/auth/signup?${params.toString()}`
}

function getLoginErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes('NEXT_PUBLIC_SUPABASE_URL is missing')) {
      return 'RISE is missing its Supabase URL on this deployment.'
    }

    if (error.message.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing')) {
      return 'RISE is missing its Supabase anon key on this deployment.'
    }

    if (error.message.includes('must point at a Supabase project URL')) {
      return 'RISE is using an invalid Supabase URL on this deployment.'
    }

    if (error.message.includes('fetch failed')) {
      return 'RISE could not reach Supabase from this deployment.'
    }

    if (error.message) {
      return error.message
    }
  }

  return 'Something went wrong while signing you in.'
}

export async function login(formData: FormData) {
  try {
    const supabase = await createClient()

    const email = getField(formData, 'email')
    const password = getField(formData, 'password')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      const message =
        error.message === 'Invalid login credentials'
          ? 'Your email or password is incorrect.'
          : error.message

      redirect(`/auth/login?error=${encodeURIComponent(message)}`)
    }

    redirect('/home')
  } catch (error) {
    redirect(`/auth/login?error=${encodeURIComponent(getLoginErrorMessage(error))}`)
  }
}

export async function signup(formData: FormData) {
  try {
    const supabase = await createClient()

    const email = getField(formData, 'email')
    const password = getField(formData, 'password')
    const full_name = getField(formData, 'full_name')
    const age_range = getField(formData, 'age_range')
    const working_level = getField(formData, 'working_level')
    const target_grade = getField(formData, 'target_grade')
    const study_style = getField(formData, 'study_style')
    const preferred_subject = getField(formData, 'preferred_subject') || 'maths'
    const onboarding_mode = getField(formData, 'onboarding_mode') || 'new_student'
    const tutor_code = getField(formData, 'tutor_code')
    const recommended_topic = getField(formData, 'recommended_topic')

    if (!full_name || !email || password.length < 8) {
      redirect(buildSignupRedirect(formData, 'Please complete your name, email, and password.'))
    }

    if (!age_range || !working_level || !target_grade || !study_style) {
      redirect(
        buildSignupRedirect(
          formData,
          'Please finish the onboarding questions before creating the account.'
        )
      )
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          age_range,
          working_level,
          target_grade,
          study_style,
          preferred_subject,
          onboarding_mode,
          tutor_code: tutor_code || null,
          recommended_topic: recommended_topic || null,
          onboarding_complete: true,
        },
      },
    })

    if (error) {
      redirect(buildSignupRedirect(formData, error.message))
    }

    const successMessage =
      onboarding_mode === 'tutor_code'
        ? 'Account created. Check your email, then sign in to open your tutor-shaped maths path.'
        : 'Account created. Check your email, then sign in to open your maths dashboard.'

    redirect(`/auth/login?message=${encodeURIComponent(successMessage)}`)
  } catch (error) {
    redirect(buildSignupRedirect(formData, getLoginErrorMessage(error)))
  }
}

export async function logout() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } finally {
    redirect('/auth/login')
  }
}
