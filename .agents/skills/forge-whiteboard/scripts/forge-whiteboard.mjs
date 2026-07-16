#!/usr/bin/env node
import { readFile } from 'node:fs/promises'

const [command, positional, ...rest] = process.argv.slice(2)
const args = positional?.startsWith('--') ? [positional, ...rest] : rest
const id = positional?.startsWith('--') ? null : positional
const flag = (name) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}

if (!['list', 'get', 'create', 'update', 'validate'].includes(command ?? '')) usage()
const project = flag('--project')
if (command !== 'validate' && !project) fail('Missing --project')
if (['get', 'update'].includes(command) && !id) fail('Missing whiteboard id')

const payload = await readPayload(flag('--json'), flag('--file'))
if (command === 'validate') {
  const result = validateBoard(payload)
  for (const warning of result.warnings) process.stderr.write(`warning: ${warning}\n`)
  if (result.errors.length > 0) fail(result.errors.map((error) => `error: ${error}`).join('\n'))
  process.stdout.write(`Valid board payload (${result.nodes} nodes, ${result.edges} edges)\n`)
  process.exit(0)
}
if (['create', 'update'].includes(command)) {
  const result = validateBoard(payload)
  for (const warning of result.warnings) process.stderr.write(`warning: ${warning}\n`)
  if (result.errors.length > 0) fail(result.errors.map((error) => `error: ${error}`).join('\n'))
}
const itemPath = id ? `/api/operator/whiteboards/${encodeURIComponent(id)}` : '/api/operator/whiteboards'
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
  fail('Usage: forge-whiteboard.mjs list|get|create|update|validate [id] --project SLUG [--json JSON|--file PATH]')
}

function validateBoard(payload) {
  const errors = []
  const warnings = []
  const nodes = Array.isArray(payload?.nodes_json) ? payload.nodes_json : null
  const edges = Array.isArray(payload?.edges_json) ? payload.edges_json : null
  if (!nodes) errors.push('nodes_json must be an array')
  if (!edges) errors.push('edges_json must be an array')
  if (!nodes || !edges) return { errors, warnings, nodes: nodes?.length ?? 0, edges: edges?.length ?? 0 }

  const nodeById = new Map()
  for (const node of nodes) {
    if (!node?.id || typeof node.id !== 'string') {
      errors.push('every node must have a string id')
      continue
    }
    if (nodeById.has(node.id)) errors.push(`duplicate node id: ${node.id}`)
    nodeById.set(node.id, node)
    if (!node.kind || !node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
      errors.push(`node ${node.id} must have kind and numeric position.x/position.y`)
    }
    const label = node.data?.label
    if (typeof label !== 'string' || !label.trim()) {
      errors.push(`node ${node.id} must have a non-empty data.label`)
    } else {
      const expectedLabel = toTitleCase(label)
      if (label !== expectedLabel) errors.push(`node ${node.id} title must use Title Case: ${JSON.stringify(expectedLabel)}`)
      if (/^Mandatory Notifications?$/i.test(label.trim())) {
        errors.push(`node ${node.id} uses a generic notification title; split it into specifically named notification actions`)
      }
    }
  }

  const edgeIds = new Set()
  const connected = new Set()
  const validHandles = new Set(['top', 'right', 'bottom', 'left'])
  for (const edge of edges) {
    if (!edge?.id || typeof edge.id !== 'string') {
      errors.push('every edge must have a string id')
      continue
    }
    if (edgeIds.has(edge.id)) errors.push(`duplicate edge id: ${edge.id}`)
    edgeIds.add(edge.id)
    const source = nodeById.get(edge.source)
    const target = nodeById.get(edge.target)
    if (!source) errors.push(`edge ${edge.id} references missing source ${edge.source}`)
    if (!target) errors.push(`edge ${edge.id} references missing target ${edge.target}`)
    if (!validHandles.has(edge.sourceHandle)) errors.push(`edge ${edge.id} needs explicit sourceHandle: top|right|bottom|left`)
    if (!validHandles.has(edge.targetHandle)) errors.push(`edge ${edge.id} needs explicit targetHandle: top|right|bottom|left`)
    connected.add(edge.source)
    connected.add(edge.target)

    if (source && target) {
      const blockedKinds = new Set(['title', 'paragraph', 'text_label', 'image', 'section'])
      if (blockedKinds.has(source.kind) || blockedKinds.has(target.kind)) {
        errors.push(`edge ${edge.id} connects annotation node ${blockedKinds.has(source.kind) ? source.id : target.id}`)
      }
      const sourceRole = source.data?.role
      const targetRole = target.data?.role
      if (['annotation', 'discussion'].includes(sourceRole) || ['annotation', 'discussion'].includes(targetRole)) {
        errors.push(`edge ${edge.id} connects a ${['annotation', 'discussion'].includes(sourceRole) ? sourceRole : targetRole} node`)
      }
      if (target.position.x > source.position.x && Math.abs(target.position.y - source.position.y) < 100 && (edge.sourceHandle !== 'right' || edge.targetHandle !== 'left')) {
        warnings.push(`edge ${edge.id} is a forward horizontal edge; prefer right -> left handles`)
      }
      if (target.position.x < source.position.x - 100 && !/retry|return|resubmit|replace/i.test(edge.label ?? '')) {
        warnings.push(`edge ${edge.id} moves backward; confirm it is an intentional retry loop`)
      }
    }
  }

  for (const node of nodes) {
    if (node.kind === 'decision') {
      const outgoing = edges.filter((edge) => edge.source === node.id)
      if (outgoing.length < 2) warnings.push(`decision ${node.id} has fewer than two outgoing branches`)
      for (const edge of outgoing) if (!edge.label) errors.push(`decision edge ${edge.id} needs an outcome label`)
    }
    if (node.data?.role === 'discussion' && connected.has(node.id)) errors.push(`discussion node ${node.id} must be disconnected`)
    if (node.data?.role === 'annotation' && connected.has(node.id)) errors.push(`annotation node ${node.id} must be disconnected`)
  }
  return { errors, warnings, nodes: nodes.length, edges: edges.length }
}
function toTitleCase(value) {
  const minorWords = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in', 'into', 'nor', 'of', 'on', 'or', 'over', 'per', 'the', 'to', 'via', 'with', 'without'])
  const preferredCase = new Map([
    ['abn', 'ABN'],
    ['ahpra', 'AHPRA'],
    ['api', 'API'],
    ['auspost', 'AusPost'],
    ['mvp', 'MVP'],
    ['pdf', 'PDF'],
    ['stripe', 'Stripe'],
    ['tga', 'TGA'],
    ['xero', 'Xero'],
  ])
  const matches = [...value.matchAll(/[A-Za-z][A-Za-z0-9]*(?:['’][A-Za-z]+)?/g)]
  return value.replace(/[A-Za-z][A-Za-z0-9]*(?:['’][A-Za-z]+)?/g, (word, offset) => {
    const matchIndex = matches.findIndex((match) => match.index === offset)
    const lower = word.toLowerCase()
    const before = value.slice(0, offset).trimEnd()
    const isFirst = matchIndex === 0
    const isLast = matchIndex === matches.length - 1
    const beginsClause = isFirst || /[:—–]\s*$/.test(before)
    if (preferredCase.has(lower)) return preferredCase.get(lower)
    if (/^[A-Z0-9]{2,}$/.test(word)) return word
    if (minorWords.has(lower) && !beginsClause && !isLast) return lower
    return lower.charAt(0).toUpperCase() + lower.slice(1)
  })
}
function fail(message) {
  process.stderr.write(`${message}\n`)
  process.exit(1)
}
