import type { Country } from '../types/politics'

const freeze = <T>(value: T): T => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze)
    Object.freeze(value)
  }

  return value
}

export const franceSeed: Country = freeze({
  id: 'france',
  name: 'France',
  structure: {
    stateForm: 'État unitaire',
    governmentForm: 'République semi-présidentielle',
  },
  headOfState: {
    title: { zh: '共和国总统', en: 'President of the Republic' },
    officeholder: 'Emmanuel Macron',
    selectionMethod: 'Direct universal suffrage',
  },
  headOfGovernment: {
    title: { zh: '总理', en: 'Prime Minister' },
    officeholder: 'Sébastien Lecornu',
    selectionMethod: 'Appointed by the President of the Republic',
  },
  legislature: {
    lowerHouseSeats: 577,
    lowerHouseLabel: { zh: '国民议会', en: 'National Assembly' },
    upperHouseLabel: { zh: '参议院', en: 'Senate' },
  },
  parties: [
    { id: 'rn', name: 'Rassemblement National', color: '#1f4e9d', seats: 122 },
    { id: 'epr', name: 'Ensemble pour la République', color: '#f5a623', seats: 90 },
    { id: 'lfi-nfp', name: 'La France insoumise - Nouveau Front populaire', color: '#d33155', seats: 71 },
    { id: 'socialistes', name: 'Socialistes et apparentés', color: '#e85d75', seats: 68 },
    { id: 'dr', name: 'Droite Républicaine', color: '#274c77', seats: 48 },
    { id: 'ecologiste', name: 'Écologiste et Social', color: '#4a9c5d', seats: 38 },
    { id: 'dem', name: 'Les Démocrates', color: '#ffb000', seats: 37 },
    { id: 'horizons', name: 'Horizons & Indépendants', color: '#5b7db1', seats: 36 },
    { id: 'liot', name: 'Libertés, Indépendants, Outre-mer et Territoires', color: '#00a6a6', seats: 22 },
    { id: 'gdr', name: 'Gauche Démocrate et Républicaine', color: '#b1263b', seats: 17 },
    { id: 'udr', name: 'Union des droites pour la République', color: '#253a73', seats: 17 },
    { id: 'non-inscrits', name: 'Non-inscrits', color: '#7b8794', seats: 11 },
  ],
  institutions: [
    { id: 'citizens', label: { zh: '公民', en: 'Citizens' } },
    { id: 'president', label: { zh: '共和国总统', en: 'President of the Republic' } },
    { id: 'prime-minister', label: { zh: '总理', en: 'Prime Minister' } },
    { id: 'government', label: { zh: '政府', en: 'Government' } },
    { id: 'national-assembly', label: { zh: '国民议会', en: 'National Assembly' } },
    { id: 'senate', label: { zh: '参议院', en: 'Senate' } },
  ],
  relations: [
    { from: 'citizens', to: 'president', kind: 'elects' },
    { from: 'citizens', to: 'national-assembly', kind: 'elects' },
    { from: 'president', to: 'prime-minister', kind: 'appoints' },
    { from: 'prime-minister', to: 'government', kind: 'leads' },
    { from: 'government', to: 'national-assembly', kind: 'accountableTo' },
    { from: 'citizens', to: 'senate', kind: 'elects' },
  ],
  snapshot: {
    date: '2026-09-11',
    sources: [
      'https://www.elysee.fr/la-presidence/les-institutions-de-la-cinquieme-republique',
      'https://www2.assemblee-nationale.fr/instances/liste/groupes_politiques/effectif',
      'https://www.info.gouv.fr/discours/propos-introductifs-a-la-rencontre-de-haut-niveau-au-maroc',
    ],
  },
  createdAt: '2026-09-11',
})
