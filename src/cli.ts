#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { mkdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { cancel, confirm, intro, isCancel, log, note, outro, select, spinner, text } from '@clack/prompts'
import { downloadTemplate } from 'giget'

const presets = [
  { label: 'Next.js + ESLint', value: 'github:StoryTW/nextjs-template-by-story#main' },
  { label: 'Vite + ESLint', value: 'github:StoryTW/vite-template-by-story#main' },
  // { label: 'Vite + Oxlint', value: 'github:StoryTW/vite-oxlint-template-by-story#main' },
]

async function main() {
  if (!process.stdin.isTTY) {
    log.error('Run create-story in an interactive terminal.')
    process.exitCode = 1
    return
  }

  intro('create-story')

  const template = await select({
    message: 'Template',
    options: presets,
  })

  if (isCancel(template)) {
    cancel('Project creation cancelled.')
    return
  }

  const name = await text({
    message: 'Project folder',
    placeholder: 'my-app',
    validate(value) {
      if (!value || !/^[a-z0-9][a-z0-9_-]*$/.test(value)) {
        return 'Use lowercase letters, numbers, hyphens, or underscores. Start with a letter or number.'
      }
    },
  })

  if (isCancel(name)) {
    cancel('Project creation cancelled.')
    return
  }

  const install = await confirm({
    message: 'Install dependencies?',
    active: 'Yes (pnpm)',
    inactive: 'No',
    initialValue: true,
  })

  if (isCancel(install)) {
    cancel('Project creation cancelled.')
    return
  }

  const directory = resolve(name)

  try {
    await mkdir(directory)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
      throw new Error(`"${name}" already exists. Choose a different folder name.`)
    }
    throw error
  }

  const progress = spinner()

  progress.start('Downloading template')

  try {
    await downloadTemplate(template, { dir: directory })
  } catch (error) {
    progress.error('Template download failed.')
    await rm(directory, { recursive: true, force: true })
    throw error
  }

  progress.stop('Template downloaded')

  const projectPath = `./${name}`
  const nextSteps = `cd ${projectPath}\npnpm install\npnpm dev`

  if (install) {
    log.step('Installing dependencies with pnpm')
    const options = { cwd: directory, stdio: 'inherit' } as const
    const result = process.platform === 'win32'
      ? spawnSync('cmd.exe', ['/d', '/c', 'pnpm install'], options)
      : spawnSync('pnpm', ['install'], options)

    if (result.status !== 0) {
      const reason = (result.error as NodeJS.ErrnoException | undefined)?.code === 'ENOENT'
        ? 'pnpm is not available. Install pnpm and retry.'
        : result.error?.message ?? `pnpm install ended with ${result.signal ?? `exit code ${result.status}`}.`
      log.error(reason)
      note(nextSteps, 'Finish setup')
      outro(`Project created in ${projectPath}`)
      process.exitCode = 1
      return
    }

    log.success('Dependencies installed')
  }

  note(install ? `cd ${projectPath}\npnpm dev` : nextSteps, 'Run locally')
  outro(install ? `Project ready in ${projectPath}` : `Project created in ${projectPath}`)
}

main().catch((error: unknown) => {
  log.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
