import { createClient } from '@/lib/supabase/server'
import type { StudentSession } from '@/lib/student-session'

export type HomeworkStatus = 'not_started' | 'in_progress' | 'completed' | 'need_help'

export interface HomeworkTask {
  id: string
  child_profile_id: string
  title: string
  instructions?: string | null
  status: HomeworkStatus
  student_note?: string | null
  due_date?: string | null
  completed_at?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export function isHomeworkStatus(value: string): value is Exclude<HomeworkStatus, 'not_started'> {
  return value === 'in_progress' || value === 'completed' || value === 'need_help'
}

export async function getStudentHomeworkTask(
  session: StudentSession
): Promise<HomeworkTask | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_student_homework_task', {
    lookup_child_profile_id: session.childProfileId,
    lookup_tutor_key_id: session.tutorKeyId,
  })

  if (error) {
    throw error
  }

  return data as HomeworkTask | null
}

export async function updateStudentHomeworkStatus(
  session: StudentSession,
  input: {
    homeworkTaskId: string
    status: Exclude<HomeworkStatus, 'not_started'>
  }
): Promise<HomeworkTask | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('update_student_homework_status', {
    lookup_child_profile_id: session.childProfileId,
    lookup_tutor_key_id: session.tutorKeyId,
    input_homework_task_id: input.homeworkTaskId,
    input_status: input.status,
  })

  if (error) {
    throw error
  }

  return data as HomeworkTask | null
}
