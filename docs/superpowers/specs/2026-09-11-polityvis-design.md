# PolityVis First-Phase Design

## Purpose

PolityVis is a React and TypeScript front-end tool for exploring fictional political systems. It is not a game: users answer a structured questionnaire to define a country's institutions, then inspect a visual representation of the legislature and authority relationships. The first release is fully local and ships with a realistic France example.

## Scope

The application provides a country-library home screen, creation flow, country overview, semicircular parliament chart, and institutional relationship map. It supports Simplified Chinese and English. It has no backend, account system, cloud sync, live data feed, map, or complex animation.

## User Flow

1. The country library lists the bundled France snapshot and all locally saved countries.
2. Each card offers open, duplicate, and delete actions; deletion requires confirmation.
3. New country opens a four-step questionnaire: profile, executive, legislature, then parties and seats.
4. Submission validates that party seats equal the legislature's total seats, saves the country, and opens its overview.
5. The overview exposes Overview, Parliament, and Power Structure views, with editing available from the saved country.

## Data and State

`App` owns `language`, `countries`, and `activeCountryId`, using React state/context only. Each `Country` stores an id, name, structure, executive attributes, legislature attributes, party list, institutional relationships, and optional source/snapshot metadata. The model deliberately derives political-system descriptions from multiple attributes rather than using one regime label.

Persist the country collection and language in `localStorage`. Seed the France record only on an empty installation. Ignore malformed saved records safely rather than preventing the app from starting. France data is a static, dated snapshot; show its source date in the interface so it is not represented as live information.

## Components

- `CountryLibrary`: cards, empty state, new, duplicate, and delete actions.
- `CountryWizard`: four-step questionnaire and field validation.
- `CountryOverview`: institutional summary and view navigation.
- `ParliamentChart`: dependency-free SVG semicircle with party-colored seats, legend, total, and majority threshold.
- `PowerMap`: institution nodes and labelled election, appointment, and accountability links.
- `countryStorage` and translation dictionaries: persistence and UI text separated from presentation components.

## Interaction and Visual Design

The interface uses a dark blue-black, data-dashboard visual language inspired by the supplied reference: restrained blue-gray panels and dividers, with vivid color reserved for political parties and chart data. The country-library layout is the selected home-screen direction. Cards should stay readable on narrow screens through single-column layout; the questionnaire maintains visible progress on desktop and stacked controls on mobile.

All static interface text changes with the language toggle. Country and party names remain exactly as entered or supplied by real France data. Display validation errors in the active language for required fields, invalid numbers, and mismatched seat totals.

## Verification

Run `npm run lint` and `npm run build`. Manually validate both languages, France snapshot presentation and date, CRUD persistence across refresh, questionnaire validation, parliament total/threshold/party coloring, and institution-map links against each country's data.
