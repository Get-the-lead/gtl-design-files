#!/usr/bin/env node
import { readFile } from 'node:fs/promises'

const [command, positional, ...rest] = process.argv.slice(2)
const args = positional?.startsWith('--') ? [positional, ...rest] : rest
const id = positional?.startsWith('--') ? null : positional
const flag = (name) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}

if (!['list', 'get', 'create', 'update'].includes(command ?? '')) usage()
const project = flag('--project')
if (!project) fail('Missing --project')
if (['get', 'update'].includes(command) && !id) fail('Missing document id')

const payload = await readPayload(flag('--json'), flag('--file'))
const itemPath = id ? `/api/operator/documents/${encodeURIComponent(id)}` : '/api/operator/documents'
const query = ['list', 'get'].includes(command)
  ? `?project_slug=${encodeURIComponent(project)}`
  : ''
const method = ['list', 'get'].includes(command) ? 'GET' : command === 'create' ? 'POST' : 'PATCH'
const body = method === 'GET' ? undefined : JSON.stringify({ project_slug: project, ...payload })
await request(itemPath + query, { method, body })

async function readPayload(inline, file) {
  if (inline && file) fail('Use one of --json or --file')
  if (file) return JSON.parse(await readFile(file, 'utf8'))
  if (inline) return JSON.parse(inline)
  return {}
}
async function request(path, init) {
  const token = process.env.FORGE_OPERATOR_API_TOKEN
  if (!token) fail('FORGE_OPERATOR_API_TOKEN is not set')
  const base = (process.env.FORGE_URL || 'http://localhost:3000').replace(/\/$/, '')
  const response = await fetch(base + path, {
    ...init,
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
  })
  const text = await response.text()
  if (!response.ok) fail(`${response.status} ${text}`)
  process.stdout.write(`${text}\n`)
}
function usage() {
  fail('Usage: forge-document.mjs list|get|create|update [id] --project SLUG [--json JSON|--file PATH]')
}
function fail(message) {
  process.stderr.write(`${message}\n`)
  process.exit(1)
}
