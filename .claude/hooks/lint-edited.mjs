#!/usr/bin/env node
// PostToolUse hook：Edit/Write 之后对改动的 .vue/.ts 文件自动运行 eslint --fix
// 始终退出 0，不阻塞工具调用；eslint 输出作为反馈呈现给 Claude。
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { extname } from 'node:path'

const LINT_EXT = new Set(['.vue', '.ts', '.tsx', '.js', '.mjs', '.cjs'])
const SKIP = [/\/node_modules\//, /\/\.nuxt\//, /\/\.output\//, /\/dist\//, /\/\.git\//]

let raw = ''
try {
  raw = readFileSync(0, 'utf8')
} catch {
  process.exit(0)
}
if (!raw) process.exit(0)

let data
try {
  data = JSON.parse(raw)
} catch {
  process.exit(0)
}

const file = data?.tool_input?.file_path
if (!file || typeof file !== 'string') process.exit(0)

if (!LINT_EXT.has(extname(file))) process.exit(0)
if (SKIP.some((re) => re.test(file))) process.exit(0)

const cwd = data?.cwd || process.cwd()
const r = spawnSync('pnpm', ['eslint', '--fix', file], { cwd, encoding: 'utf8' })

if (r.stdout && r.stdout.trim()) {
  process.stdout.write(`[lint-edited] ${r.stdout}`)
}
if (r.stderr && r.stderr.trim()) {
  process.stderr.write(`[lint-edited] ${r.stderr}`)
}
process.exit(0)
