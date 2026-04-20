import * as fs from 'node:fs'
import * as path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const OUTPUT_DIR = 'rise_content_pipeline/output'
const ENV_CANDIDATES = ['.env.local', 'apps/web/.env.local']

function loadEnvFile(filePath: string): void {
  if (!fs.existsSync(filePath)) return
  const content = fs.readFileSync(filePath, 'utf8')
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (!match) continue
    let value = match[2].trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[match[1]] === undefined) {
      process.env[match[1]] = value
    }
  }
}

function loadEnv(): void {
  for (const candidate of ENV_CANDIDATES) {
    loadEnvFile(path.resolve(process.cwd(), candidate))
  }
}

function findJsonFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  const out: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...findJsonFiles(full))
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      out.push(full)
    }
  }
  return out.sort()
}

interface LessonJson {
  topic: string
  subtopic: string
  lesson_type: string
  [key: string]: unknown
}

function validateLessonJson(json: unknown, file: string): LessonJson {
  if (!json || typeof json !== 'object') {
    throw new Error('JSON root is not an object')
  }
  const obj = json as Record<string, unknown>
  const missing: string[] = []
  for (const key of ['topic', 'subtopic', 'lesson_type']) {
    if (typeof obj[key] !== 'string' || !obj[key]) missing.push(key)
  }
  if (missing.length > 0) {
    throw new Error(`Missing or non-string fields: ${missing.join(', ')} (in ${file})`)
  }
  return obj as LessonJson
}

async function main(): Promise<void> {
  loadEnv()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
        `Checked: ${ENV_CANDIDATES.join(', ')}`,
    )
    process.exit(1)
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const rootDir = path.resolve(process.cwd(), OUTPUT_DIR)
  const files = findJsonFiles(rootDir)

  if (files.length === 0) {
    console.error(`No JSON files found under ${OUTPUT_DIR}/`)
    process.exit(1)
  }

  console.log(`Found ${files.length} JSON lesson file(s) under ${OUTPUT_DIR}/\n`)

  let ok = 0
  const failures: Array<{ file: string; error: string }> = []

  for (const file of files) {
    const rel = path.relative(process.cwd(), file)
    try {
      const raw = fs.readFileSync(file, 'utf8')
      const parsed = JSON.parse(raw) as unknown
      const lesson = validateLessonJson(parsed, rel)

      const row = {
        title: lesson.subtopic,
        topic: lesson.topic,
        subject: 'maths',
        lesson_type: lesson.lesson_type,
        content: lesson,
        is_published: true,
      }

      const { error } = await supabase
        .from('lessons')
        .upsert(row, { onConflict: 'subject,topic,title,lesson_type' })

      if (error) {
        console.log(`  ✗ ${rel} — ${error.message}`)
        failures.push({ file: rel, error: error.message })
      } else {
        console.log(`  ✓ ${rel}`)
        ok++
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.log(`  ✗ ${rel} — ${message}`)
      failures.push({ file: rel, error: message })
    }
  }

  console.log('\n── Summary ──')
  console.log(`Processed: ${files.length}`)
  console.log(`Success:   ${ok}`)
  console.log(`Failed:    ${failures.length}`)

  if (failures.length > 0) {
    console.log('\nFailures:')
    for (const f of failures) console.log(`  - ${f.file}: ${f.error}`)
  }

  process.exit(failures.length > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
