# PolityVis Regime Dashboard Design

## Purpose

Extend PolityVis from a fixed four-step country form into a bilingual, questionnaire-led political-system explorer. It retains the local-first model and realistic France snapshot, but adds representative regime presets, a configurable institution model, a Wikipedia-style parliament, a single-page political dashboard, and PNG export.

## Questionnaire and Presets

The creation flow begins with 24 original institutional-preference statements. Every statement uses the five 8values-style responses from strongly disagree to strongly agree. The interaction and weighted-score pattern are inspired by [8values](https://8values.github.io/), whose public source uses four weighted axes, but no question text or result labels are copied.

Answers score six `-100…100` axes: executive concentration, democratic participation, centralisation, political pluralism, secular governance, and military political role. The closest preset is selected by distance across all six axes; users see the score bars, selected preset, and alternatives before continuing. The seven first-release presets are UK-style parliamentary monarchy, French-style semi-presidential republic, US-style federal presidential republic, Swiss-style federal direct democracy, one-party socialist republic, absolute monarchy, and military/military-civilian regime. A preset creates a complete editable draft; it is a descriptive starting point, not a claim that a country has one correct classification.

## Editable Country Model

Countries store `presetId` and `systemScores`, plus repeatable records for executive offices, legislative chambers, courts, and territorial levels. Each record has a bilingual label and only the fields required by its type (for example, chamber seat count and selection method). The editor lets users add, remove, and edit those records after preset selection. Existing saved countries are normalised on load: France receives a semi-presidential preset, axis scores, and its existing institutions; legacy user records receive safe defaults rather than being discarded.

`PartyGroup` gains `ideologyPosition: -100…100`. The party editor exposes this numeric value. Parliament layout sorts groups ascending by position, then descending seat count for ties. Every group remains contiguous in the hemicycle and the legend uses that same order, matching the familiar Wikipedia convention.

## Political Dashboard

Replace the three exclusive overview tabs with one responsive dashboard. A top hero presents the country, preset, snapshot date, and six score bars. The main grid shows country structure and executive roles beside the SVG power map. A full-width parliament module follows, then modules for chambers, courts, territorial levels, and sources. Desktop uses the selected B “political cockpit” layout; narrow screens stack the same modules. Existing links, locale toggle, focus states, and source disclosure remain intact.

## PNG Export

The dashboard has two actions: export the entire dashboard as a PNG and export the parliament chart as a PNG. The complete dashboard is rasterised at high resolution from its dedicated render container; the parliament is rasterised directly from its SVG. Filenames use a safe country-name slug, export type, and ISO date, such as `france-overview-2026-09-14.png`. Export failure shows a localised inline message and does not alter country data.

## Validation and Verification

Validate all counts as non-negative integers, require at least one executive office and chamber, and require party-seat totals to match the selected visible chamber. Test question scoring, deterministic preset matching, legacy normalisation, record validation, left-to-right party sorting, unique/in-bounds seats, and export filename generation. Run the complete Vitest suite, lint, and production build. Manually verify both locales, all seven preset results, edits to each institution type, France’s 577-seat ordering, responsive dashboard, and both downloaded PNGs.
