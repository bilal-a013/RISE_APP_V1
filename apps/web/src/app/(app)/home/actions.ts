'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getStudentSession } from '@/lib/student-session'
import { isHomeworkStatus, updateStudentHomeworkStatus } from '@/lib/homework'

function redirectWithHomeworkMessage(kind: 'success' | 'error', message: string): never {
  const params = new URLSearchParams({
    [`homework_${kind}`]: message,
  })

  redirect(`/home?${params.toString()}`)
}

export async function updateHomeworkStatus(formData: FormData) {
  const homeworkTaskId = formData.get('homework_task_id')
  const status = formData.get('status')

  if (typeof homeworkTaskId !== 'string' || !homeworkTaskId) {
    redirectWithHomeworkMessage('error', 'RISE could not find that homework task.')
  }

  if (typeof status !== 'string' || !isHomeworkStatus(status)) {
    redirectWithHomeworkMessage('error', 'Choose a valid homework status.')
  }

  const session = await getStudentSession()
  if (!session) {
    redirect('/?message=Enter your tutor code to continue.')
  }

  try {
    await updateStudentHomeworkStatus(session, {
      homeworkTaskId,
      status,
    })
  } catch (error) {
    console.error('[homework] Failed to update homework status', error)
    redirectWithHomeworkMessage('error', 'RISE could not update homework right now.')
  }

  revalidatePath('/home')
  redirectWithHomeworkMessage('success', 'Homework updated.')
}
