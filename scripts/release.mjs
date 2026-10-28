#!/usr/bin/env node
// `npm run release`: local part of a release, see CONTRIBUTING.md.
//   npm run release -- minor   bump version and CHANGELOG.md, push release/vX.Y.Z
//                              (also patch, major, prerelease, x.y.z)
//   npm run release -- tag     after merging the PR: tag main and push the tag
// Extra arguments go to `npm version`, e.g. `-- prerelease --preid beta`.
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const REPO = 'https://github.com/0brick/civic-ui'
const TOUCHED = ['package.json', 'package-lock.json', 'CHANGELOG.md']

const [command, ...rest] = process.argv.slice(2)
if (!command) fail('usage: npm run release -- <patch|minor|major|prerelease|x.y.z|tag>')
if (command === 'tag') tag()
else bump([command, ...rest])

function bump(versionArgs) {
  syncMain()
  const previous = readVersion()
  run('npm', ['version', ...versionArgs, '--no-git-tag-version'])
  const version = readVersion()
  try {
    if (tagExists(`v${version}`)) throw new Error(`tag v${version} already exists`)
    if (!version.includes('-')) updateChangelog(previous, version)
  } catch (err) {
    git('checkout', '--', ...TOUCHED)
    fail(err.message)
  }
  const branch = `release/v${version}`
  git('switch', '-c', branch)
  git('commit', '-m', `Release v${version}`, '--', ...TOUCHED)
  run('git', ['push', '-u', 'origin', branch])
  console.log(`\nOpen and merge the pull request:\n  ${REPO}/compare/main...${branch}?expand=1`)
  console.log('Then: npm run release -- tag')
}

function tag() {
  syncMain()
  const name = `v${readVersion()}`
  if (tagExists(name)) fail(`${name} already exists: merge the release pull request first`)
  git('tag', '-a', name, '-m', `Version ${readVersion()}`)
  run('git', ['push', 'origin', name])
  console.log(`\nPublishing ${name}: ${REPO}/actions/workflows/release.yml`)
}

// Clean main, same as origin/main.
function syncMain() {
  if (git('branch', '--show-current') !== 'main') fail('switch to main first')
  if (git('status', '--porcelain')) fail('the working tree is not clean')
  git('fetch', '--quiet', '--tags', 'origin', 'main')
  const local = git('rev-parse', 'HEAD')
  const remote = git('rev-parse', 'origin/main')
  if (local === remote) return
  if (!gitOk('merge-base', '--is-ancestor', local, remote)) fail('main has commits that are not on origin/main')
  git('merge', '--ff-only', '--quiet', remote)
}

function updateChangelog(previous, version) {
  const file = join(root, 'CHANGELOG.md')
  const text = readFileSync(file, 'utf8')
  const section = text.match(/^## \[Unreleased\]\n([\s\S]*?)(?=^## \[|^\[Unreleased\]:|(?![\s\S]))/m)
  if (!section) throw new Error('CHANGELOG.md has no "## [Unreleased]" section')
  if (!section[1].trim()) throw new Error('the Unreleased section in CHANGELOG.md is empty')
  const date = new Date().toISOString().slice(0, 10)
  const next = text
    .replace(section[0], `## [Unreleased]\n\n## [${version}] - ${date}\n${section[1]}`)
    .replace(/^\[Unreleased\]: .*$/m, `[Unreleased]: ${REPO}/compare/v${version}...HEAD\n[${version}]: ${REPO}/compare/v${previous}...v${version}`)
  writeFileSync(file, next)
}

function tagExists(name) {
  return gitOk('rev-parse', '--verify', '--quiet', `refs/tags/${name}`) || git('ls-remote', '--tags', 'origin', `refs/tags/${name}`) !== ''
}

function readVersion() {
  return JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version
}

function git(...args) {
  const res = spawnSync('git', args, { cwd: root, encoding: 'utf8' })
  if (res.status !== 0) fail(`git ${args.join(' ')}\n${res.stderr.trim()}`)
  return res.stdout.trim()
}

function gitOk(...args) {
  return spawnSync('git', args, { cwd: root, stdio: 'ignore' }).status === 0
}

function run(cmd, args) {
  const res = spawnSync(cmd, args, { cwd: root, stdio: 'inherit' })
  if (res.status !== 0) fail(`${cmd} ${args.join(' ')} failed`)
}

function fail(message) {
  console.error(`release: ${message}`)
  process.exit(1)
}
