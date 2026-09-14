# PolityVis Regime Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 24-question regime quiz, editable institutions, left-to-right parliament seating, a single political cockpit dashboard, and PNG exports.

**Architecture:** Keep quiz scoring, preset matching, country normalisation, seat sorting, and export filename generation pure and tested. React components consume the expanded `Country` model through the existing context; the dashboard composes existing SVG visualisations with new editable modules. Use one capture dependency only for the complete dashboard; rasterise the SVG parliament natively.

**Tech Stack:** React 19, TypeScript 6, Vite 8, native CSS/SVG/canvas, localStorage, Vitest, `html2canvas`.

**Spec:** `docs/superpowers/specs/2026-09-14-polityvis-regime-dashboard-design.md`

## Global Constraints

- Preserve local-only storage, Simplified Chinese/English UI, source links, and the realistic France snapshot.
- Author 24 new institutional-preference statements; do not copy 8values questions or ideology labels.
- Scores are `-100…100` on executive concentration, democratic participation, centralisation, political pluralism, secular governance, and military political role.
- Ship exactly seven presets: parliamentary monarchy, semi-presidential republic, federal presidential republic, federal direct democracy, one-party socialist republic, absolute monarchy, and military/military-civilian regime.
- Party positions are integers from `-100` (left) to `100` (right); equal positions break by descending seats.
- Add no UI, chart, routing, or state-management dependency. Add `html2canvas` only for whole-dashboard PNG rendering.
- Keep existing stored countries usable by normalising missing new fields on load.

---

## File Structure

- `src/types/politics.ts` — expanded country, institution, preset, score, and party types.
- `src/data/regimeQuestions.ts` — 24 original questions and axis weights.
- `src/data/regimePresets.ts` — seven preset score vectors and country draft defaults.
- `src/lib/regimeQuiz.ts` — pure answer scoring and deterministic closest-preset match.
- `src/lib/countryStorage.ts` — legacy-country normalisation before persistence consumers receive records.
- `src/lib/countryValidation.ts` — count, party position, and visible-chamber validation.
- `src/components/RegimeQuiz.tsx`, `RegimeResult.tsx`, `CountryEditor.tsx` — creation flow.
- `src/components/CountryDashboard.tsx` — all-in-one cockpit display and export controls.
- `src/lib/pngExport.ts` — safe filename and native SVG PNG conversion.
- `src/styles/dashboard.css`, `src/styles/editor.css` — responsive cockpit and editor styles.

### Task 1: Expand the country model and safely normalise saved countries

**Files:**
- Modify: `src/types/politics.ts`, `src/data/france.ts`, `src/lib/countryStorage.ts`, `src/lib/countryStorage.test.ts`, `src/lib/countryValidation.ts`, `src/lib/countryValidation.test.ts`, `src/lib/countryBuilder.ts`, `src/lib/countryBuilder.test.ts`

**Interfaces:**
- Produces `SystemAxis`, `SystemScores`, `RegimePresetId`, `ExecutiveOffice`, `LegislativeChamber`, `Court`, `TerritorialLevel`, and `normaliseCountry(value: unknown): Country | null`.
- `PartyGroup` gains `ideologyPosition: number`; `Country` gains `presetId`, `systemScores`, `executiveOffices`, `chambers`, `courts`, and `territorialLevels`.

- [ ] **Step 1: Write failing migration and validation tests.**

```ts
it('normalises a legacy country with left-right positions and editable institutions', () => {
  const country = normaliseCountry(legacyFrance)
  expect(country).toMatchObject({ presetId: 'semiPresidential', parties: [{ ideologyPosition: expect.any(Number) }] })
  expect(country?.chambers[0].seats).toBe(577)
})

it('rejects party positions outside the political spectrum', () => {
  expect(validateCountryDraft({ parties: [{ name: 'A', seats: 1, ideologyPosition: 101 }] }).issues)
    .toContain('partyPositionInvalid')
})
```

- [ ] **Step 2: Run focused tests and confirm they fail because the new exports and issue code are absent.**

Run: `npm test -- countryStorage.test.ts countryValidation.test.ts`

- [ ] **Step 3: Define the minimum expanded records and normaliser.**

```ts
export type SystemAxis = 'executive' | 'participation' | 'centralisation' | 'pluralism' | 'secularism' | 'military'
export type SystemScores = Record<SystemAxis, number>
export interface LegislativeChamber { id: string; label: TranslatedLabel; seats: number; selectionMethod: string; isPartyChamber: boolean }
export interface ExecutiveOffice { id: string; label: TranslatedLabel; selectionMethod: string; terms: number }
export interface Court { id: string; label: TranslatedLabel; level: number }
export interface TerritorialLevel { id: string; label: TranslatedLabel; count: number; autonomy: number }
```

Normalise valid legacy fields into one head-of-state office, one head-of-government office, a lower-house chamber, optional upper chamber, an empty court list, and one territorial level. Default legacy party positions to `0`; give France its documented party positions and the `semiPresidential` preset. Clamp no user data: malformed new records return `null`, while missing legacy-only fields receive defaults.

- [ ] **Step 4: Extend `createCountryFromDraft` and validation.**

Require a non-empty name, at least one executive office, at least one chamber, non-negative integer court/territorial counts, an integer party position in range, and party seats equal the one `isPartyChamber` total. Preserve the legacy `headOfState`, `headOfGovernment`, and `legislature` fields as derived compatibility fields for `PowerMap`.

- [ ] **Step 5: Run focused tests, full tests, lint, and build.**

Run: `npm test && npm run lint && npm run build`

- [ ] **Step 6: Commit the data-compatible model update.**

```bash
git add src/types/politics.ts src/data/france.ts src/lib/countryStorage.ts src/lib/countryStorage.test.ts src/lib/countryValidation.ts src/lib/countryValidation.test.ts src/lib/countryBuilder.ts src/lib/countryBuilder.test.ts
git commit -m "feat: add configurable regime model"
```

### Task 2: Build the original 24-question scoring and preset matcher

**Files:**
- Create: `src/data/regimeQuestions.ts`, `src/data/regimePresets.ts`, `src/lib/regimeQuiz.ts`, `src/lib/regimeQuiz.test.ts`

**Interfaces:**
- `RegimeQuestion` has `id`, `text: TranslatedLabel`, and sparse `weights: Partial<SystemScores>`.
- `RegimePreset` has `id: RegimePresetId`, `name: TranslatedLabel`, `scores: SystemScores`, and a valid `CountryDraft` default.
- `scoreRegimeAnswers(answers: Record<string, -2 | -1 | 0 | 1 | 2>): SystemScores` and `matchRegimePreset(scores: SystemScores): RegimePreset` are pure exports.

- [ ] **Step 1: Write failing score and matching tests.**

```ts
it('normalises unanimous executive-concentration answers to 100', () => {
  expect(scoreRegimeAnswers(executiveAnswers).executive).toBe(100)
})

it('selects the military preset for its exact score vector', () => {
  expect(matchRegimePreset(regimePresets.militaryCivilian.scores).id).toBe('militaryCivilian')
})

it('breaks an equal distance in declared preset order', () => {
  expect(matchRegimePreset(zeroScores).id).toBe('parliamentaryMonarchy')
})
```

- [ ] **Step 2: Run the focused test and confirm it fails because the modules do not exist.**

Run: `npm test -- regimeQuiz.test.ts`

- [ ] **Step 3: Add six groups of four original statements.**

Use these exact English concepts with matching Chinese translations: direct national votes, elected assembly confidence, strong executive decrees, local lawmaking; one-party competition, independent opposition, religious law, secular law; civilian control of the armed forces, military emergency rule; national standards and provincial autonomy. Assign only the relevant one or two axis weights to each statement. Give every axis four non-zero questions and use `-2…2` answer values.

- [ ] **Step 4: Add seven complete preset vectors and draft defaults.**

Each preset must include `id`, translated name, six scores, state/government form, offices, chambers, courts, territorial levels, and a small valid default party distribution. `matchRegimePreset` computes squared distance in the six fixed axis order and uses the preset array order for ties.

- [ ] **Step 5: Implement normalised scoring.**

For each axis, sum `answer * question.weights[axis]`, divide by that axis’s maximum absolute answer-weight total, multiply by 100, round, and clamp to `-100…100`. Throw a clear error only if an answer key is unknown or a required answer is missing; UI validation prevents this path.

- [ ] **Step 6: Run focused and full verification.**

Run: `npm test -- regimeQuiz.test.ts && npm test && npm run lint && npm run build`

- [ ] **Step 7: Commit the quiz domain layer.**

```bash
git add src/data/regimeQuestions.ts src/data/regimePresets.ts src/lib/regimeQuiz.ts src/lib/regimeQuiz.test.ts
git commit -m "feat: add regime questionnaire scoring"
```

### Task 3: Replace the fixed wizard with quiz, result, and institution editor

**Files:**
- Create: `src/components/RegimeQuiz.tsx`, `src/components/RegimeResult.tsx`, `src/components/CountryEditor.tsx`, `src/styles/editor.css`
- Modify: `src/components/CountryWizard.tsx`, `src/components/WizardProgress.tsx`, `src/context/AppStateContext.tsx`, `src/i18n/messages.ts`, `src/styles/wizard.css`

**Interfaces:**
- `RegimeQuiz` calls `onComplete(scores: SystemScores)` after all 24 answers are present.
- `RegimeResult` receives scores, exposes the selected and alternate `RegimePreset`s, and calls `onContinue(preset)`.
- `CountryEditor` receives a preset-derived `CountryDraft` and calls `createCountryFromDraft` only after `validateCountryDraft` returns no issues.

- [ ] **Step 1: Add failing pure builder tests for a preset-derived custom country.**

```ts
it('keeps custom offices, chambers, courts, and territorial levels', () => {
  const country = createCountryFromDraft(editorDraft, 'custom', '2026-09-14T00:00:00.000Z')
  expect(country.courts).toHaveLength(2)
  expect(country.territorialLevels[0].autonomy).toBe(70)
})
```

- [ ] **Step 2: Run the builder test and confirm it fails until the draft supports the records.**

Run: `npm test -- countryBuilder.test.ts`

- [ ] **Step 3: Implement the quiz and result screens with five answer buttons.**

Render one question at a time, show `current / 24`, retain Back, require an answer before Next, and use the score matcher only on completion. The result view renders six labelled score bars, the closest preset, all alternatives, and a “use this preset” action. Add every new string to both message dictionaries.

- [ ] **Step 4: Implement the four list editors with native controls.**

Use arrays in one `CountryEditor` screen: executive office label/selection method/terms; chamber label/seats/selection method/party-chamber toggle; court label/level; territorial label/count/autonomy. Add/remove buttons update only their relevant array. The party list includes its existing name/color/seats controls plus a `number` input with min `-100` and max `100` for ideology position.

- [ ] **Step 5: Connect context and old routes.**

Make the New Country action open the quiz-first creation flow. Keep `CountryWizard` as the flow coordinator or replace it with a small coordinator component, but do not leave the prior fixed profile/executive/legislature/party steps reachable. On submission, create, persist, select, and display the country through existing context actions.

- [ ] **Step 6: Run checks and manually complete each preset path.**

Run: `npm test -- countryBuilder.test.ts && npm test && npm run lint && npm run build`

In the browser, complete the quiz with one answer pattern, select the resulting preset, add a court and territorial level, set party positions `-50` and `50`, and verify a refreshed country retains all edits. The seven exact preset-vector checks remain in the pure Task 2 test suite.

- [ ] **Step 7: Commit the creation flow.**

```bash
git add src/components/RegimeQuiz.tsx src/components/RegimeResult.tsx src/components/CountryEditor.tsx src/components/CountryWizard.tsx src/components/WizardProgress.tsx src/context/AppStateContext.tsx src/i18n/messages.ts src/styles/editor.css src/styles/wizard.css src/lib/countryBuilder.test.ts
git commit -m "feat: create countries from regime quiz"
```

### Task 4: Sort and render Wikipedia-style parliament blocks

**Files:**
- Modify: `src/lib/parliamentLayout.ts`, `src/lib/parliamentLayout.test.ts`, `src/components/ParliamentChart.tsx`, `src/styles/parliament.css`

**Interfaces:**
- `sortPartyGroups(groups: PartyGroup[]): PartyGroup[]` returns a new left-to-right sorted array.
- `buildParliamentSeats(groups, totalSeats)` consumes this order and returns one unique, in-bounds seat for each configured seat.

- [ ] **Step 1: Write failing sort and layout tests.**

```ts
it('sorts groups from left to right and seats-descending within a tie', () => {
  expect(sortPartyGroups(groups).map((group) => group.id)).toEqual(['left', 'centre-large', 'centre-small', 'right'])
})

it('keeps every group contiguous in the ordered seat stream', () => {
  expect(buildParliamentSeats(groups, 6).map((seat) => seat.groupId)).toEqual(['left', 'left', 'centre', 'centre', 'right', 'right'])
})
```

- [ ] **Step 2: Run the layout test and confirm the new sort assertions fail.**

Run: `npm test -- parliamentLayout.test.ts`

- [ ] **Step 3: Implement sorted input without mutating country data.**

Sort a copied array by `ideologyPosition`, then `seats` descending, then `name.localeCompare`. Feed it into the existing concentric semicircle layout, preserve its coordinate/view-box bounds, and keep its one-seat-per-record guarantees.

- [ ] **Step 4: Make the visual and legend share the sorted array.**

`ParliamentChart` creates one `orderedGroups` array and passes it to both layout and legend. Display the signed ideology position next to each legend group. Keep party fills contiguous by flattening each sorted group before seating.

- [ ] **Step 5: Verify France and regression tests.**

Run: `npm test -- parliamentLayout.test.ts && npm test && npm run lint && npm run build`

In the browser, confirm France contains 577 unique circles inside the SVG and its legend runs left-to-right by stored political position.

- [ ] **Step 6: Commit the parliament change.**

```bash
git add src/lib/parliamentLayout.ts src/lib/parliamentLayout.test.ts src/components/ParliamentChart.tsx src/styles/parliament.css
git commit -m "feat: order parliament by political position"
```

### Task 5: Build the political cockpit and both PNG exports

**Files:**
- Create: `src/components/CountryDashboard.tsx`, `src/lib/pngExport.ts`, `src/lib/pngExport.test.ts`, `src/styles/dashboard.css`
- Modify: `package.json`, `package-lock.json`, `src/components/CountryOverview.tsx`, `src/components/AppShell.tsx`, `src/components/PowerMap.tsx`, `src/i18n/messages.ts`, `src/styles/overview.css`

**Interfaces:**
- `safeExportFilename(countryName: string, kind: 'overview' | 'parliament', date: string): string` returns a PNG filename.
- `downloadSvgPng(svg: SVGSVGElement, filename: string): Promise<void>` uses `XMLSerializer`, `Blob`, `Image`, and a 2× canvas.
- `CountryDashboard` owns a `ref` for `html2canvas` and calls the two export paths.

- [ ] **Step 1: Add the capture dependency and write failing filename tests.**

Run:

```bash
npm install html2canvas
```

```ts
it('creates a safe dated dashboard filename', () => {
  expect(safeExportFilename('France / Test', 'overview', '2026-09-14')).toBe('france-test-overview-2026-09-14.png')
})
```

- [ ] **Step 2: Run the export test and confirm it fails because the helper is absent.**

Run: `npm test -- pngExport.test.ts`

- [ ] **Step 3: Implement filename and native SVG export helpers.**

Lowercase the country name, replace every non-alphanumeric run with one hyphen, trim edge hyphens, and fall back to `country`. `downloadSvgPng` serialises the SVG, loads it through an object URL, draws at `devicePixelRatio * 2`, revokes the URL in `finally`, and downloads through a temporary anchor.

- [ ] **Step 4: Compose the dashboard.**

Replace the tab-only `CountryOverview` body with `CountryDashboard`: hero/preset/score bars, facts and executive offices, `PowerMap`, full-width `ParliamentChart`, chambers, courts, territorial levels, snapshot sources, and localized export controls. Give the dashboard capture container a solid background and no transient controls so the overview PNG is self-contained. Use `html2canvas(container, { backgroundColor: '#101823', scale: 2 })` for full dashboard export, then download the resulting data URL.

- [ ] **Step 5: Add responsive styling and export failure handling.**

Use a 12-column desktop grid, two columns at tablet widths, and one column under 760px. Make the parliament module full width. Disable the active export button while rendering; catch both export paths and show a localized inline error. Do not persist export state.

- [ ] **Step 6: Run automated and manual verification.**

Run: `npm test -- pngExport.test.ts && npm test && npm run lint && npm run build`

In Chrome, open France in both locales; verify all cockpit modules are visible without tabs, narrow the viewport to one column, download `france-overview-YYYY-MM-DD.png` and `france-parliament-YYYY-MM-DD.png`, and open both PNGs to confirm no module or SVG seat is missing.

- [ ] **Step 7: Commit the dashboard and exports.**

```bash
git add package.json package-lock.json src/components/CountryDashboard.tsx src/components/CountryOverview.tsx src/components/AppShell.tsx src/components/PowerMap.tsx src/lib/pngExport.ts src/lib/pngExport.test.ts src/i18n/messages.ts src/styles/dashboard.css src/styles/overview.css
git commit -m "feat: add political cockpit and png exports"
```

## Plan Self-Review

- **Spec coverage:** Task 1 covers model/migration/France; Task 2 covers the 24 original questions, six axes, and seven presets; Task 3 covers quiz-to-edit creation and all four editable institution categories; Task 4 covers numeric left/right placement; Task 5 covers the B cockpit, responsive layout, both PNG exports, and error handling.
- **No-placeholder check:** The plan defines required interfaces, algorithms, test cases, exact commands, and commit boundaries. It contains no deferred implementation markers.
- **Type consistency:** `SystemScores`, `RegimePreset`, expanded `CountryDraft`, `PartyGroup.ideologyPosition`, `sortPartyGroups`, and PNG helper signatures are introduced before their consuming tasks.
