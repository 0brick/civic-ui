// Human-readable and JSON output for runAudit() results.

const COLORS = { red: 31, yellow: 33, blue: 34, green: 32, gray: 90, bold: 1, dim: 2, cyan: 36 }

function painter(enabled) {
  const paint = (code, s) => (enabled ? `\u001b[${code}m${s}\u001b[0m` : s)
  return Object.fromEntries(Object.entries(COLORS).map(([k, v]) => [k, (s) => paint(v, s)]))
}

const LABEL = { error: 'error', warning: 'warning', info: 'info' }

export function formatReport(result, options = {}) {
  const c = painter(options.color ?? false)
  const sevColor = { error: c.red, warning: c.yellow, info: c.blue }
  const { findings, summary } = result
  const out = []

  out.push('')
  out.push(c.bold('civic-ui audit: accessibility (WCAG 2.2 AA) & security'))
  out.push(c.gray(`${summary.files} file(s) scanned in ${result.root} · ${result.durationMs} ms`))
  for (const note of result.notes || []) out.push(c.gray(`· ${note}`))
  out.push('')

  const byFile = new Map()
  for (const f of findings) {
    if (options.minSeverity === 'warning' && f.severity === 'info') continue
    if (options.minSeverity === 'error' && f.severity !== 'error') continue
    if (!byFile.has(f.file)) byFile.set(f.file, [])
    byFile.get(f.file).push(f)
  }

  for (const [file, list] of byFile) {
    out.push(c.bold(c.cyan(file)))
    for (const f of list) {
      const loc = f.line ? `${f.line}:${f.column}` : '-'
      const tag = f.category === 'accessibility' ? 'a11y' : 'sec'
      out.push(`  ${c.gray(loc.padEnd(8))} ${sevColor[f.severity](LABEL[f.severity].padEnd(7))} ${c.gray(tag.padEnd(4))} ${f.message}  ${c.dim(f.ruleId)}`)
      if (f.snippet) out.push(`  ${' '.repeat(8)}   ${c.gray('│')} ${c.dim(f.snippet)}`)
      const standard = f.wcag ? `WCAG ${f.wcag}` : f.ref
      out.push(`  ${' '.repeat(8)}   ${c.gray('└')} ${f.help}${standard ? c.gray(`  [${standard}]`) : ''}`)
    }
    out.push('')
  }

  if (summary.byRule.length) {
    out.push(c.bold('Findings by rule'))
    for (const r of summary.byRule) {
      out.push(`  ${String(r.count).padStart(4)}  ${sevColor[r.severity](r.severity.padEnd(7))} ${r.ruleId.padEnd(32)} ${c.gray(r.title)}`)
    }
    out.push('')
  }

  const cat = (name, s) => `${name}: ${s.errors} error(s), ${s.warnings} warning(s), ${s.infos} info`
  out.push(c.bold('Summary'))
  out.push(`  ${cat('Accessibility', summary.byCategory.accessibility)}`)
  out.push(`  ${cat('Security     ', summary.byCategory.security)}`)
  out.push('')
  if (summary.passed) {
    out.push(c.green(c.bold(`✔ No errors${summary.warnings ? `, ${summary.warnings} warning(s) worth a look` : ''}.`)))
  } else {
    out.push(c.red(c.bold(`✖ ${summary.errors} error(s), ${summary.warnings} warning(s), ${summary.infos} info.`)))
  }
  out.push(
    c.gray(
      'Static checks catch a lot, not everything: also test with a keyboard, a screen reader (NVDA/VoiceOver) and axe DevTools/Lighthouse on the running site.'
    )
  )
  out.push('')
  return out.join('\n')
}

export function formatJson(result) {
  return JSON.stringify(result, null, 2)
}
