import { copyFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const cwd = process.cwd()
const envLocalPath = join(cwd, '.env.local')
const envLocalExamplePath = join(cwd, '.env.local.example')
const envExamplePath = join(cwd, '.env.example')

if (existsSync(envLocalPath)) {
  process.exit(0)
}

const sourcePath = existsSync(envLocalExamplePath) ? envLocalExamplePath : envExamplePath

if (!existsSync(sourcePath)) {
  console.warn('No env template found. Skipping .env.local bootstrap.')
  process.exit(0)
}

copyFileSync(sourcePath, envLocalPath)
console.log(`Created .env.local from ${sourcePath.endsWith('.env.local.example') ? '.env.local.example' : '.env.example'}`)
