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

const parliamentaryRepublic: RegimePreset = { id: 'parliamentaryRepublic', name: label('议会共和制', 'Parliamentary republic'), scores: { executive: -20, participation: 55, centralisation: 35, pluralism: 90, secularism: 80, military: -90 }, default: draft('parliamentaryRepublic', { executive: -20, participation: 55, centralisation: 35, pluralism: 90, secularism: 80, military: -90 }, 'Republia', 'unitary republic', 'parliamentary', label('总统', 'President'), label('总理', 'Chancellor'), label('联邦议院', 'Parliament'), label('省', 'Provinces'), 35, ['Civic Union', 'Labour Party'], ['parliamentaryElection', 'parliamentaryElection', 'directElection'], [5, 4]) }
const federalParliamentary: RegimePreset = { id: 'federalParliamentary', name: label('联邦议会共和制', 'Federal parliamentary republic'), scores: { executive: -25, participation: 55, centralisation: -55, pluralism: 90, secularism: 75, military: -90 }, default: draft('federalParliamentary', { executive: -25, participation: 55, centralisation: -55, pluralism: 90, secularism: 75, military: -90 }, 'Bundoria', 'federal republic', 'parliamentary', label('联邦总统', 'Federal President'), label('总理', 'Chancellor'), label('联邦议院', 'Bundestag'), label('州', 'Länder'), 80, ['Union Bloc', 'Social Democrats'], ['indirectElection', 'parliamentaryElection', 'directElection'], [5, 4]) }
const directorialRepublic: RegimePreset = { id: 'directorialRepublic', name: label('委员会共和制', 'Directorial republic'), scores: { executive: -50, participation: 70, centralisation: -20, pluralism: 70, secularism: 70, military: -90 }, default: draft('directorialRepublic', { executive: -50, participation: 70, centralisation: -20, pluralism: 70, secularism: 70, military: -90 }, 'Collegia', 'unitary republic', 'directorial', label('联邦委员会', 'Federal Council'), label('委员会主席', 'Council Chair'), label('公民议会', 'Citizens’ Assembly'), label('州', 'Cantons'), 60, ['Civic List', 'Social Forum'], ['parliamentaryElection', 'parliamentaryElection', 'directElection'], [1, 1]) }
const theocraticRepublic: RegimePreset = { id: 'theocraticRepublic', name: label('神权共和制', 'Theocratic republic'), scores: { executive: 75, participation: 10, centralisation: 75, pluralism: -45, secularism: -100, military: 25 }, default: draft('theocraticRepublic', { executive: 75, participation: 10, centralisation: 75, pluralism: -45, secularism: -100, military: 25 }, 'Theoria', 'theocratic republic', 'theocratic', label('最高领袖', 'Supreme Leader'), label('总统', 'President'), label('协商议会', 'Consultative Assembly'), label('省', 'Provinces'), 30, ['Revolutionary Front', 'Reform Bloc'], ['appointed', 'directElection', 'directElection'], [0, 4]) }
const dominantPartyRepublic: RegimePreset = { id: 'dominantPartyRepublic', name: label('优势党共和制', 'Dominant-party republic'), scores: { executive: 80, participation: -45, centralisation: 85, pluralism: -70, secularism: 50, military: -60 }, default: draft('dominantPartyRepublic', { executive: 80, participation: -45, centralisation: 85, pluralism: -70, secularism: 50, military: -60 }, 'Meridia', 'unitary republic', 'dominant-party', label('总统', 'President'), label('总理', 'Prime Minister'), label('人民议会', 'People’s Parliament'), label('地区', 'Districts'), 30, ['National Action Party', 'Civic Opposition'], ['directElection', 'appointed', 'directElection'], [6, 5]) }
const socialistCouncil: RegimePreset = { id: 'socialistCouncil', name: label('委员会社会主义制', 'Council socialist republic'), scores: { executive: 70, participation: -40, centralisation: 85, pluralism: -80, secularism: 60, military: -20 }, default: draft('socialistCouncil', { executive: 70, participation: -40, centralisation: 85, pluralism: -80, secularism: 60, military: -20 }, 'Sovaria', 'socialist republic', 'council-led', label('联邦主席', 'Federal Chair'), label('人民委员会主席', 'Council Premier'), label('工人代表大会', 'Workers’ Congress'), label('共和国', 'Republics'), 40, ['Workers’ Front', 'Popular Independents'], ['parliamentaryElection', 'parliamentaryElection', 'indirectElection'], [5, 5]) }
const constitutionalSultanate: RegimePreset = { id: 'constitutionalSultanate', name: label('立宪苏丹制', 'Constitutional sultanate'), scores: { executive: 80, participation: -40, centralisation: 80, pluralism: -55, secularism: -70, military: 40 }, default: draft('constitutionalSultanate', { executive: 80, participation: -40, centralisation: 80, pluralism: -55, secularism: -70, military: 40 }, 'Sultanara', 'constitutional monarchy', 'constitutional sultanate', label('苏丹', 'Sultan'), label('首相', 'Prime Minister'), label('协商议会', 'Consultative Assembly'), label('省', 'Provinces'), 25, ['Royalist Alliance', 'Reform Movement'], ['hereditary', 'appointed', 'directElection'], [0, 5]) }
const revolutionaryJunta: RegimePreset = { id: 'revolutionaryJunta', name: label('革命军政府', 'Revolutionary junta'), scores: { executive: 95, participation: -95, centralisation: 90, pluralism: -90, secularism: 20, military: 100 }, default: draft('revolutionaryJunta', { executive: 95, participation: -95, centralisation: 90, pluralism: -90, secularism: 20, military: 100 }, 'Juntara', 'republic', 'revolutionary junta', label('革命委员会主席', 'Junta Chair'), label('军政府总理', 'Military Premier'), label('全国革命委员会', 'National Revolutionary Council'), label('军区', 'Military Regions'), 10, ['Revolutionary Council', 'Civic Front'], ['militaryAppointment', 'militaryAppointment', 'appointed'], [0, 0]) }

export const regimePresetList: RegimePreset[] = [
  parliamentaryMonarchy,
  semiPresidential,
  federalPresidential,
  federalDirectDemocracy,
  onePartySocialist,
  absoluteMonarchy,
  militaryCivilian,
  parliamentaryRepublic, federalParliamentary, directorialRepublic, theocraticRepublic, dominantPartyRepublic, socialistCouncil, constitutionalSultanate, revolutionaryJunta,
]

export const regimePresets = {
  parliamentaryMonarchy,
  semiPresidential,
  federalPresidential,
  federalDirectDemocracy,
  onePartySocialist,
  absoluteMonarchy,
  militaryCivilian,
  parliamentaryRepublic,
  federalParliamentary,
  directorialRepublic,
  theocraticRepublic,
  dominantPartyRepublic,
  socialistCouncil,
  constitutionalSultanate,
  revolutionaryJunta,
}
