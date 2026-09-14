# PolityVis

PolityVis is a bilingual, local-first React tool for visualizing fictional political systems. Create countries through a structured questionnaire, then inspect their institutions, parliamentary composition, and authority relationships. The application ships with a dated France snapshot for exploration.

## Development

```bash
npm install
npm run dev
```

- `npm test` runs the Vitest unit suite.
- `npm run lint` runs Oxlint.
- `npm run build` type-checks and creates a production bundle.
- `npm run preview` serves the production build after a build.

## Local data

No account or backend is required. PolityVis persists countries in `localStorage` under `polityvis:countries:v1` and the interface language under `polityvis:locale:v1`. To reset the application, remove these keys in your browser's storage tools.

The bundled France record is a fixed snapshot dated 2026-09-11, not live data. Its institutional and parliamentary information is sourced from the [Élysée](https://www.elysee.fr/la-presidence/les-institutions-de-la-cinquieme-republique), the [Assemblée nationale](https://www2.assemblee-nationale.fr/instances/liste/groupes_politiques/effectif), and [info.gouv.fr](https://www.info.gouv.fr/discours/propos-introductifs-a-la-rencontre-de-haut-niveau-au-maroc).
