import type { CountryDraft, RegimePresetId, SystemScores, TranslatedLabel } from '../types/politics'

export interface RegimePreset {
  id: RegimePresetId
  name: TranslatedLabel
  scores: SystemScores
  default: CountryDraft
}

const label = (zh: string, en: string): TranslatedLabel => ({ zh, en })

const draft = (
  id: RegimePresetId,
  scores: SystemScores,
  name: string,
  stateForm: string,
  governmentForm: string,
  headOfState: TranslatedLabel,
  headOfGovernment: TranslatedLabel,
  lowerHouse: TranslatedLabel,
  territorial: TranslatedLabel,
  autonomy: number,
  partyNames: [string, string],
  selection: [string, string | null, string],
  terms: [number, number],
): CountryDraft => ({
  name,
  presetId: id,
  systemScores: scores,
  structure: { stateForm, governmentForm },
  executiveOffices: [
    { id: 'head-of-state', label: headOfState, selectionMethod: selection[0], terms: terms[0] },
    ...(selection[1] ? [{ id: 'head-of-government', label: headOfGovernment, selectionMethod: selection[1], terms: terms[1] }] : []),
  ],
  chambers: [{ id: 'lower-house', label: lowerHouse, seats: 100, selectionMethod: selection[2], isPartyChamber: true }],
  courts: [{ id: 'constitutional-court', label: label('宪法法院', 'Constitutional Court'), level: 0 }],
  territorialLevels: [{ id: 'regions', label: territorial, count: 12, autonomy }],
  parties: [
    { name: partyNames[0], color: '#2364aa', seats: 60, ideologyPosition: -25 },
    { name: partyNames[1], color: '#cf4b4b', seats: 40, ideologyPosition: 35 },
  ],
})

const parliamentaryMonarchy: RegimePreset = {
  id: 'parliamentaryMonarchy',
  name: label('议会君主制', 'Parliamentary monarchy'),
  scores: { executive: -40, participation: 30, centralisation: 40, pluralism: 80, secularism: 60, military: -90 },
  default: draft('parliamentaryMonarchy', { executive: -40, participation: 30, centralisation: 40, pluralism: 80, secularism: 60, military: -90 }, 'Parliamentia', 'constitutional monarchy', 'parliamentary', label('君主', 'Monarch'), label('首相', 'Prime Minister'), label('民选议院', 'Elected Assembly'), label('地区', 'Regions'), 45, ['Civic Party', 'Labour Alliance'], ['hereditary', 'appointed', 'directElection'], [0, 0]),
}

const semiPresidential: RegimePreset = {
  id: 'semiPresidential',
  name: label('半总统制共和国', 'Semi-presidential republic'),
  scores: { executive: 30, participation: 40, centralisation: 60, pluralism: 80, secularism: 90, military: -40 },
  default: draft('semiPresidential', { executive: 30, participation: 40, centralisation: 60, pluralism: 80, secularism: 90, military: -40 }, 'Civitas', 'unitary republic', 'semi-presidential', label('总统', 'President'), label('总理', 'Prime Minister'), label('国民议会', 'National Assembly'), label('大区', 'Regions'), 40, ['Republican Centre', 'Social Forum'], ['directElection', 'appointed', 'directElection'], [5, 0]),
}

const federalPresidential: RegimePreset = {
  id: 'federalPresidential',
  name: label('联邦总统制共和国', 'Federal presidential republic'),
  scores: { executive: 60, participation: 40, centralisation: -70, pluralism: 80, secularism: 70, military: -90 },
  default: draft('federalPresidential', { executive: 60, participation: 40, centralisation: -70, pluralism: 80, secularism: 70, military: -90 }, 'Federalia', 'federal republic', 'presidential', label('总统', 'President'), label('总统', 'President'), label('众议院', 'House of Representatives'), label('州', 'States'), 80, ['Federal Union', 'Democratic League'], ['indirectElection', null, 'directElection'], [4, 4]),
}

const federalDirectDemocracy: RegimePreset = {
  id: 'federalDirectDemocracy',
  name: label('联邦直接民主制', 'Federal direct democracy'),
  scores: { executive: -60, participation: 100, centralisation: -80, pluralism: 80, secularism: 70, military: -90 },
  default: draft('federalDirectDemocracy', { executive: -60, participation: 100, centralisation: -80, pluralism: 80, secularism: 70, military: -90 }, 'Helvetia', 'federal republic', 'directorial', label('联邦主席', 'Federal Chair'), label('联邦委员会', 'Federal Council'), label('联邦议会', 'Federal Assembly'), label('州', 'Cantons'), 90, ['Civic List', 'Social Democrats'], ['parliamentaryElection', 'parliamentaryElection', 'directElection'], [1, 4]),
}

const onePartySocialist: RegimePreset = {
  id: 'onePartySocialist',
  name: label('一党社会主义共和国', 'One-party socialist republic'),
  scores: { executive: 70, participation: -50, centralisation: 80, pluralism: -90, secularism: 50, military: -40 },
  default: draft('onePartySocialist', { executive: 70, participation: -50, centralisation: 80, pluralism: -90, secularism: 50, military: -40 }, 'Novara', 'socialist republic', 'party-led', label('国家主席', 'State Chair'), label('政府总理', 'Premier'), label('人民议会', 'People’s Assembly'), label('省', 'Provinces'), 25, ['People’s Front', 'Workers’ Association'], ['parliamentaryElection', 'parliamentaryElection', 'indirectElection'], [5, 5]),
}

const absoluteMonarchy: RegimePreset = {
  id: 'absoluteMonarchy',
  name: label('绝对君主制', 'Absolute monarchy'),
  scores: { executive: 100, participation: -100, centralisation: 80, pluralism: -100, secularism: -70, military: -20 },
  default: draft('absoluteMonarchy', { executive: 100, participation: -100, centralisation: 80, pluralism: -100, secularism: -70, military: -20 }, 'Almara', 'absolute monarchy', 'monarchical', label('君主', 'Monarch'), label('王室首相', 'Royal Prime Minister'), label('协商会议', 'Consultative Council'), label('行政区', 'Governorates'), 15, ['Royal Council', 'Civic Delegates'], ['hereditary', 'appointed', 'appointed'], [0, 0]),
}

const militaryCivilian: RegimePreset = {
  id: 'militaryCivilian',
  name: label('军方—文职政权', 'Military-civilian regime'),
  scores: { executive: 80, participation: -80, centralisation: 70, pluralism: -80, secularism: 10, military: 100 },
  default: draft('militaryCivilian', { executive: 80, participation: -80, centralisation: 70, pluralism: -80, secularism: 10, military: 100 }, 'Orion', 'republic', 'military-civilian', label('国家元首', 'Head of State'), label('行政长官', 'Chief Executive'), label('国民委员会', 'National Council'), label('军区', 'Military Districts'), 20, ['National Stability Bloc', 'Civic Partnership'], ['militaryAppointment', 'appointed', 'appointed'], [0, 0]),
}

export const regimePresetList: RegimePreset[] = [
  parliamentaryMonarchy,
  semiPresidential,
  federalPresidential,
  federalDirectDemocracy,
  onePartySocialist,
  absoluteMonarchy,
  militaryCivilian,
]

export const regimePresets = {
  parliamentaryMonarchy,
  semiPresidential,
  federalPresidential,
  federalDirectDemocracy,
  onePartySocialist,
  absoluteMonarchy,
  militaryCivilian,
}
