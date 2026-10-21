#!/usr/bin/env node
// `npm run build`: the library (plus type declarations) into dist/ and the
// playground into playground-dist/.
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

run('npm', ['run', 'build:lib'])
run('npx', ['vite', 'build'])

function run(cmd, args) {
  const res = spawnSync(cmd, args, { cwd: root, stdio: 'inherit' })
  if (res.status !== 0) process.exit(res.status ?? 1)
}
