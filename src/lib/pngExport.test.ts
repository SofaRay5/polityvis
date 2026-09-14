import { describe, expect, it } from 'vitest'
import { safeExportFilename } from './pngExport'

describe('safeExportFilename', () => {
  it('creates a safe dated dashboard filename', () => {
    expect(safeExportFilename('France / Test', 'overview', '2026-09-14')).toBe('france-test-overview-2026-09-14.png')
  })

  it('uses country when the name has no filename-safe characters', () => {
    expect(safeExportFilename(' / ', 'parliament', '2026-09-14')).toBe('country-parliament-2026-09-14.png')
  })
})
