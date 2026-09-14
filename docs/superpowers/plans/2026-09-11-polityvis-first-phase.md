# PolityVis First Phase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual, local-first political-system visualizer with a real France snapshot and configurable fictional countries.

**Architecture:** Keep domain models, persistence, translations, and SVG layout pure and separately testable. A React context owns the persisted collection, selected country, and language; focused page and visualization components consume it. CSS implements the dark data-dashboard UI without component or chart dependencies.

**Tech Stack:** React 19, TypeScript 6, Vite 8, native CSS, SVG, localStorage, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-11-polityvis-design.md`

## Global Constraints

- Use React, TypeScript, Vite, native CSS, native SVG, and `useState`/`useContext`; do not add a UI, router, chart, or state-management library.
- Add only Vitest as a development dependency for first-phase unit tests.
- Persist the country collection and the `zh`/`en` UI choice in `localStorage`.
- Keep the model compositional; never add a single democracy/monarchy/autocracy regime field.
- Render all UI copy in Simplified Chinese and English; preserve country and party/group names exactly.
- Seed a dated France snapshot. Use 11 September 2026 data: Emmanuel Macron, Prime Minister Sébastien Lecornu, 577 National Assembly seats, and official parliamentary-group totals `122, 90, 71, 68, 48, 38, 37, 36, 22, 17, 17, 11` (sum 577).

---

## File Structure

- `src/types/politics.ts` — domain types shared by state, UI, and SVG code.
- `src/data/france.ts` — immutable, dated France seed and source URLs.
- `src/i18n/messages.ts` — typed Chinese/English UI message dictionary.
- `src/lib/countryValidation.ts` — pure questionnaire and seat-total validation.
- `src/lib/countryStorage.ts` — defensive localStorage reads/writes.
- `src/lib/parliamentLayout.ts` — pure semicircle seat-position generator.
- `src/context/AppStateContext.tsx` — reducer, local persistence, and app actions.
- `src/components/` — `AppShell`, `CountryLibrary`, `CountryWizard`, `CountryOverview`, `ParliamentChart`, and `PowerMap`.
- `src/*.css` — global tokens plus one focused stylesheet per major view.
- `src/**/*.test.ts` — Vitest tests for pure domain, persistence, and layout behavior.

### Task 1: Establish the test harness and political-system domain

**Files:**
- Modify: `package.json`, `vite.config.ts`
- Create: `src/types/politics.ts`, `src/lib/countryValidation.ts`, `src/lib/countryValidation.test.ts`

**Interfaces:**
- Produces `Country`, `CountryDraft`, `PartyGroup`, `Institution`, `InstitutionRelation`, `Locale`, `validateCountryDraft(draft: CountryDraft): ValidationResult`.

- [ ] **Step 1: Add Vitest and test scripts.**

Run:

```bash
npm install --save-dev vitest
```

Set scripts to `"test": "vitest run"` and `"test:watch": "vitest"`. In `vite.config.ts`, import `defineConfig` from `vitest/config` and set `test: { environment: 'node', include: ['src/**/*.test.ts'] }`.

- [ ] **Step 2: Write the failing validation tests.**

```ts
import { describe, expect, it } from 'vitest'
import { validateCountryDraft } from './countryValidation'

it('requires party seats to equal the lower-house total', () => {
  expect(validateCountryDraft({ legislature: { lowerHouseSeats: 10 }, parties: [{ seats: 9 }] }).issues)
    .toContain('seatTotalMismatch')
})

it('accepts a complete legislature distribution', () => {
  expect(validateCountryDraft({ legislature: { lowerHouseSeats: 10 }, parties: [{ seats: 6 }, { seats: 4 }] }).issues)
    .toEqual([])
})
```

- [ ] **Step 3: Run the test to verify it fails.**

Run: `npm test -- countryValidation.test.ts`  
Expected: FAIL because the module does not exist.

- [ ] **Step 4: Define the model and minimal validation.**

Create a `Country` with `id`, `name`, `structure`, `headOfState`, `headOfGovernment`, `legislature`, `parties`, `institutions`, `relations`, `snapshot`, and `createdAt`. Define `CountryDraft` as the same creation fields with optional values while the wizard is incomplete. Make translated labels `{ zh: string; en: string }`; use `InstitutionRelation['kind']` values `elects`, `appoints`, `leads`, `accountableTo`, and `legislates`. `validateCountryDraft` must reject missing names, non-positive seat counts, negative party seats, and a seat sum that differs from `lowerHouseSeats`.

- [ ] **Step 5: Run the tests and type check.**

Run: `npm test -- countryValidation.test.ts && npm run build`  
Expected: PASS and an exit code of 0.

- [ ] **Step 6: Commit the domain foundation.**

```bash
git add package.json package-lock.json vite.config.ts src/types/politics.ts src/lib/countryValidation.ts src/lib/countryValidation.test.ts
git commit -m "feat: add political system domain model"
```

### Task 2: Add the France seed, translations, and local persistence

**Files:**
- Create: `src/data/france.ts`, `src/i18n/messages.ts`, `src/lib/countryStorage.ts`, `src/lib/countryStorage.test.ts`

**Interfaces:**
- Consumes `Country` and `Locale` from Task 1.
- Produces `franceSeed`, `messages`, `loadCountries(storage)`, `saveCountries(countries, storage)`, and `loadLocale(storage)`.

- [ ] **Step 1: Write failing storage and seed tests.**

```ts
it('returns the France seed when no stored collection exists', () => {
  expect(loadCountries(new MapStorage())).toEqual([franceSeed])
})

it('ignores malformed saved data instead of throwing', () => {
  const storage = new MapStorage({ 'polityvis:countries:v1': '{bad json' })
  expect(loadCountries(storage)).toEqual([])
})

it('uses all 577 seats in the France snapshot', () => {
  expect(franceSeed.parties.reduce((total, group) => total + group.seats, 0)).toBe(577)
})
```

- [ ] **Step 2: Run the test to verify it fails.**

Run: `npm test -- countryStorage.test.ts`  
Expected: FAIL because the seed and storage module do not exist.

- [ ] **Step 3: Implement immutable seed data and defensive storage.**

Give `franceSeed.snapshot` the date `2026-09-11` and source URLs for the [Élysée institutions page](https://www.elysee.fr/la-presidence/les-institutions-de-la-cinquieme-republique), [Assemblée nationale group totals](https://www2.assemblee-nationale.fr/instances/liste/groupes_politiques/effectif), and [official government record naming Sébastien Lecornu](https://www.info.gouv.fr/discours/propos-introductifs-a-la-rencontre-de-haut-niveau-au-maroc). Use parliamentary-group labels, not party labels. `loadCountries` returns `[franceSeed]` only for a missing key, `[]` for malformed/invalid JSON, and parsed countries for valid arrays. Store at `polityvis:countries:v1`; store the locale at `polityvis:locale:v1`.

Define every UI message used by the application in `messages.zh` and `messages.en`, including navigation, country actions, wizard prompts/options, validation messages, relation labels, empty-state copy, and snapshot disclosure.

- [ ] **Step 4: Run focused tests and lint.**

Run: `npm test -- countryStorage.test.ts && npm run lint`  
Expected: PASS and an exit code of 0.

- [ ] **Step 5: Commit the local data layer.**

```bash
git add src/data/france.ts src/i18n/messages.ts src/lib/countryStorage.ts src/lib/countryStorage.test.ts
git commit -m "feat: add France snapshot and local storage"
```

### Task 3: Build application state and the country-library home screen

**Files:**
- Modify: `src/App.tsx`, `src/main.tsx`, `src/index.css`
- Create: `src/context/AppStateContext.tsx`, `src/context/appStateReducer.test.ts`, `src/components/AppShell.tsx`, `src/components/CountryLibrary.tsx`, `src/components/CountryCard.tsx`, `src/styles/library.css`

**Interfaces:**
- Consumes `Country`, `Locale`, storage functions, and translations.
- Produces `useAppState()` with `countries`, `activeCountryId`, `screen`, `locale`, `createCountry`, `duplicateCountry`, `deleteCountry`, `selectCountry`, `setScreen`, and `setLocale`.

- [ ] **Step 1: Write failing reducer tests.**

```ts
it('duplicates a country with a new id and a localized copy suffix', () => {
  const next = appStateReducer(initialState, { type: 'duplicate', id: 'france', locale: 'en' })
  expect(next.countries).toHaveLength(2)
  expect(next.countries[1]).toMatchObject({ name: 'France copy' })
  expect(next.countries[1].id).not.toBe('france')
})

it('clears activeCountryId when the active country is deleted', () => {
  expect(appStateReducer({ ...initialState, activeCountryId: 'france' }, { type: 'delete', id: 'france' }).activeCountryId).toBeNull()
})
```

- [ ] **Step 2: Run the reducer test to verify it fails.**

Run: `npm test -- appStateReducer.test.ts`  
Expected: FAIL because the reducer does not exist.

- [ ] **Step 3: Implement context, persistence synchronization, and library UI.**

Use `useReducer` inside `AppStateProvider`; persist after each successful collection or locale update. `CountryLibrary` renders the selected B-style country-library layout: header with logo, locale toggle, new-country button, France and saved-country cards, and an empty card. A card exposes Open, Duplicate, and Delete; Delete calls `window.confirm` with localized text. Do not delete the France seed protection-free: it must be deletable like every other card.

- [ ] **Step 4: Replace the Vite starter page and add responsive foundation styles.**

Make `App.tsx` render `AppStateProvider` and `AppShell`. Replace template CSS/assets with dark tokens, readable focus rings, 44px minimum action hit targets, responsive grid cards, and a one-column breakpoint at 760px.

- [ ] **Step 5: Run automated and manual checks.**

Run: `npm test -- appStateReducer.test.ts && npm run lint && npm run build`  
Then run `npm run dev`, duplicate France, reload, delete the duplicate, reload, and switch both locales.  
Expected: test/build pass; cards and locale survive refresh as specified.

- [ ] **Step 6: Commit the application shell.**

```bash
git add src/App.tsx src/main.tsx src/index.css src/context src/components/AppShell.tsx src/components/CountryLibrary.tsx src/components/CountryCard.tsx src/styles/library.css
git commit -m "feat: add country library home screen"
```

### Task 4: Implement the validated country-creation wizard

**Files:**
- Create: `src/components/CountryWizard.tsx`, `src/components/WizardProgress.tsx`, `src/styles/wizard.css`
- Modify: `src/context/AppStateContext.tsx`, `src/components/AppShell.tsx`

**Interfaces:**
- Consumes `validateCountryDraft`, `useAppState`, and translated options.
- Produces a `Country` through `createCountry(country)` and returns to `overview`.

- [ ] **Step 1: Add failing draft-validation cases.**

```ts
it('rejects an empty country name', () => {
  expect(validateCountryDraft({ name: '', legislature: { lowerHouseSeats: 1 }, parties: [{ seats: 1 }] }).issues)
    .toContain('nameRequired')
})

it('rejects a negative party seat count', () => {
  expect(validateCountryDraft({ name: 'A', legislature: { lowerHouseSeats: 1 }, parties: [{ seats: -1 }] }).issues)
    .toContain('partySeatsInvalid')
})
```

- [ ] **Step 2: Run tests to verify the new cases fail.**

Run: `npm test -- countryValidation.test.ts`  
Expected: FAIL until the two issue codes are implemented.

- [ ] **Step 3: Extend validation and implement four steps.**

Step 1 collects country name and structure; Step 2 collects head-of-state selection method plus head-of-government role; Step 3 collects unicameral/bicameral legislature, lower-house label, and total seats; Step 4 manages repeatable groups with name, color, and seats. Use predefined translated options only. Show errors next to the relevant field and block Next/Create until the current step is valid; the final step also requires the exact seat total.

- [ ] **Step 4: Create default institutions and relations from questionnaire choices.**

Build the country's `institutions` and `relations` at submission: citizens elect the elected offices, the head of state appoints the government head where that option is selected, the government head leads government, and lower house accountability is represented as `accountableTo`. Preserve user-entered group names and selected colors.

- [ ] **Step 5: Run checks and exercise the flow manually.**

Run: `npm test -- countryValidation.test.ts && npm run lint && npm run build`  
In the browser, create a 10-seat country with groups 6 and 4; verify a 6/3 distribution cannot submit and a completed country appears in the library after refresh.

- [ ] **Step 6: Commit the wizard.**

```bash
git add src/components/CountryWizard.tsx src/components/WizardProgress.tsx src/styles/wizard.css src/context/AppStateContext.tsx src/components/AppShell.tsx src/lib/countryValidation.ts src/lib/countryValidation.test.ts
git commit -m "feat: add country creation wizard"
```

### Task 5: Implement tested parliament layout and SVG visualization

**Files:**
- Create: `src/lib/parliamentLayout.ts`, `src/lib/parliamentLayout.test.ts`, `src/components/ParliamentChart.tsx`, `src/components/CountryOverview.tsx`, `src/styles/parliament.css`

**Interfaces:**
- Consumes `PartyGroup[]` and `lowerHouseSeats`.
- Produces `buildParliamentSeats(groups, totalSeats): RenderSeat[]`, where each seat has `{ index, groupId, color, x, y }`.

- [ ] **Step 1: Write failing semicircle-layout tests.**

```ts
it('returns one render seat per configured seat', () => {
  expect(buildParliamentSeats([{ id: 'red', seats: 2, color: '#e55' }, { id: 'blue', seats: 3, color: '#55e' }], 5)).toHaveLength(5)
})

it('keeps every point on or above the baseline', () => {
  expect(buildParliamentSeats(groups, 5).every((seat) => seat.y <= 100)).toBe(true)
})

it('assigns contiguous seats to each group', () => {
  expect(buildParliamentSeats(groups, 5).map((seat) => seat.groupId)).toEqual(['red', 'red', 'blue', 'blue', 'blue'])
})
```

- [ ] **Step 2: Run the test to verify it fails.**

Run: `npm test -- parliamentLayout.test.ts`  
Expected: FAIL because the layout module does not exist.

- [ ] **Step 3: Implement deterministic row-based semicircle geometry.**

Use `Math.ceil(Math.sqrt(totalSeats))` concentric rows. Assign groups in input order, calculate angle from `Math.PI` to `0`, and place points with `x = 160 + radius * Math.cos(angle)` and `y = 160 - radius * Math.sin(angle)`. Return coordinates inside `viewBox="0 0 320 170"`; use color strings directly as circle fills.

- [ ] **Step 4: Render accessible SVG and statistics.**

`ParliamentChart` renders `<svg role="img" aria-labelledby="parliament-title">`, one `<circle>` per seat, a translated legend, total seats, and `Math.floor(totalSeats / 2) + 1` majority threshold. Ensure the actual rendered count always derives from groups, not a duplicated constant.

- [ ] **Step 5: Run tests and manually inspect France.**

Run: `npm test -- parliamentLayout.test.ts && npm run lint && npm run build`  
Open France Parliament view and confirm 577 circles, a majority of 289, all 12 group labels, and colors matching its legend.

- [ ] **Step 6: Commit the parliament visualization.**

```bash
git add src/lib/parliamentLayout.ts src/lib/parliamentLayout.test.ts src/components/ParliamentChart.tsx src/styles/parliament.css src/components/CountryOverview.tsx
git commit -m "feat: visualize parliament seats"
```

### Task 6: Build overview and institutional power map

**Files:**
- Create: `src/components/PowerMap.tsx`, `src/styles/overview.css`, `src/i18n/messages.test.ts`
- Modify: `src/components/CountryOverview.tsx`, `src/components/AppShell.tsx`, `src/i18n/messages.ts`

**Interfaces:**
- Consumes `Country`, translated relation labels, and `ParliamentChart`.
- Produces three accessible overview tabs: `summary`, `parliament`, and `power`.

- [ ] **Step 1: Write failing pure relation-label tests.**

```ts
import { relationMessageKey } from '../i18n/messages'

it('maps accountability to translated copy', () => {
  expect(relationMessageKey('accountableTo')).toBe('relation.accountableTo')
})
```

- [ ] **Step 2: Run the test to verify it fails.**

Run: `npm test -- messages.test.ts`  
Expected: FAIL because `relationMessageKey` and its test module do not exist.

- [ ] **Step 3: Implement overview content and tabs.**

Summary displays the country name, structure, executive selection method, legislative configuration, snapshot date/source links where present, and institution summary cards. The Parliament tab mounts `ParliamentChart`. The Power tab mounts `PowerMap`. Tabs are buttons with `aria-selected`, controlled by local component state, and keyboard-focusable.

- [ ] **Step 4: Implement the native-SVG power map.**

Use fixed responsive SVG positions for Citizens, Head of State, Head of Government, Government, Lower House, and Upper House when applicable. Render directed `<line markerEnd>` edges for each relation and a centred translated label. France must display citizens → president, citizens → National Assembly, president → prime minister, prime minister → government, and government → National Assembly accountability; include the Senate relationship as indirect election.

- [ ] **Step 5: Run tests and manual quality checks.**

Run: `npm test -- messages.test.ts && npm run lint && npm run build`  
Check all three tabs in both languages, keyboard tab selection, source links, and map labels at 375px and 1280px widths.

- [ ] **Step 6: Commit overview and map.**

```bash
git add src/components/CountryOverview.tsx src/components/PowerMap.tsx src/styles/overview.css src/components/AppShell.tsx src/i18n/messages.ts src/i18n/messages.test.ts
git commit -m "feat: add country overview and power map"
```

### Task 7: Finish visual polish, repository hygiene, and release verification

**Files:**
- Modify: `src/index.css`, `src/App.css`, `.gitignore`, `README.md`
- Delete: `src/assets/react.svg`, `src/assets/vite.svg`, `src/assets/hero.png`, `public/icons.svg` if no production import remains.

**Interfaces:**
- Consumes all completed app views.
- Produces a documented, responsive first-phase release.

- [ ] **Step 1: Write the final behavior checklist in README.**

Document `npm run dev`, `npm test`, `npm run lint`, `npm run build`, the `localStorage` keys, France snapshot date and official sources, and how to reset local data through browser storage tools.

- [ ] **Step 2: Remove starter-only styling and assets.**

Replace the Vite welcome-page CSS with shared dark tokens. Delete only assets confirmed unused by `rg "react.svg|vite.svg|hero.png|icons.svg" src public`; preserve any asset still imported. Add `.superpowers/` to `.gitignore` so brainstorming artifacts are not committed.

- [ ] **Step 3: Run full automated verification.**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: every command exits 0.

- [ ] **Step 4: Run the final manual acceptance pass.**

In a clean browser storage state: open France, confirm the dated snapshot, switch languages, use all three tabs, duplicate France, create a 10-seat fictional country, reload, delete it with confirmation, and check the layout at 375px and 1280px. Confirm no live-network request is needed after initial bundle load.

- [ ] **Step 5: Commit release readiness.**

```bash
git add src/index.css src/App.css .gitignore README.md src/assets public
git commit -m "chore: prepare PolityVis first phase"
```
