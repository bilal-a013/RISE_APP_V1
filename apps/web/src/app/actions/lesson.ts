'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { DifficultyLevel } from '@rise/shared'

export async function completelesson(
  lessonId: string,
  difficultyLevel: DifficultyLevel,
  score: number
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('lesson_progress')
    .upsert(
      {
        student_id: user.id,
        lesson_id: lessonId,
        difficulty_level: difficultyLevel,
        lesson_1_score: score,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'student_id,lesson_id' }
    )

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/subjects')
  revalidatePath('/progress')

  return { success: true }
}
