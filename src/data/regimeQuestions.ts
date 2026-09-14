import type { SystemScores, TranslatedLabel } from '../types/politics'

export interface RegimeQuestion {
  id: string
  text: TranslatedLabel
  weights: Partial<SystemScores>
}

export const regimeQuestions: RegimeQuestion[] = [
  { id: 'executive-decrees', text: { en: 'The executive should be able to issue broad decrees without a prior legislative vote.', zh: '行政机构应能在立法机关事先表决前发布广泛法令。' }, weights: { executive: 1 } },
  { id: 'assembly-confidence', text: { en: 'A government should leave office when it loses the confidence of an elected assembly.', zh: '政府失去民选议会信任时应当下台。' }, weights: { executive: -1 } },
  { id: 'executive-appointments', text: { en: 'The chief executive should personally choose most senior ministers.', zh: '行政首长应亲自任命大多数高级部长。' }, weights: { executive: 1 } },
  { id: 'legislative-oversight', text: { en: 'An elected legislature should be able to block major executive decisions.', zh: '民选立法机关应能阻止重大的行政决定。' }, weights: { executive: -1 } },

  { id: 'national-votes', text: { en: 'Important national laws should be decided through direct votes of citizens.', zh: '重要的国家法律应由公民直接投票决定。' }, weights: { participation: 1 } },
  { id: 'citizen-initiatives', text: { en: 'Citizens should be able to place a proposal before the national electorate.', zh: '公民应能把提案提交全国选民表决。' }, weights: { participation: 1 } },
  { id: 'representative-only', text: { en: 'After elections, public decisions should be left entirely to representatives.', zh: '选举之后，公共决策应完全交给代表。' }, weights: { participation: -1 } },
  { id: 'recall-petitions', text: { en: 'Voters should be able to petition for a vote on removing elected officials.', zh: '选民应能请愿发起罢免民选官员的投票。' }, weights: { participation: 1 } },

  { id: 'national-standards', text: { en: 'Uniform national standards should take priority over regional rules.', zh: '统一的国家标准应优先于地区规则。' }, weights: { centralisation: 1 } },
  { id: 'local-lawmaking', text: { en: 'Local governments should make laws on matters that chiefly affect their communities.', zh: '地方政府应就主要影响本地社区的事务制定法律。' }, weights: { centralisation: -1 } },
  { id: 'provincial-autonomy', text: { en: 'Provinces should retain broad autonomy unless the constitution says otherwise.', zh: '除非宪法另有规定，省份应保有广泛自治权。' }, weights: { centralisation: -1 } },
  { id: 'appointed-governors', text: { en: 'Regional leaders should be appointed by the national government.', zh: '地区领导人应由中央政府任命。' }, weights: { centralisation: 1 } },

  { id: 'one-party-competition', text: { en: 'One political organisation should have a permanent leading role in public life.', zh: '一个政治组织应在公共生活中长期处于领导地位。' }, weights: { pluralism: -1 } },
  { id: 'independent-opposition', text: { en: 'Independent opposition parties should freely organise and contest elections.', zh: '独立反对党应能自由组织并参与选举竞争。' }, weights: { pluralism: 1 } },
  { id: 'peaceful-alternation', text: { en: 'A governing party should be able to lose power through ordinary elections.', zh: '执政党应能通过正常选举和平失去权力。' }, weights: { pluralism: 1 } },
  { id: 'licensed-parties', text: { en: 'New political parties should need permission from the governing party to operate.', zh: '新政党应取得执政党许可才能运作。' }, weights: { pluralism: -1 } },

  { id: 'religious-law', text: { en: 'Religious law should guide the state’s civil legislation.', zh: '宗教法应指导国家的民事立法。' }, weights: { secularism: -1 } },
  { id: 'secular-law', text: { en: 'Civil law should be made on secular grounds, independent of religious authority.', zh: '民事法律应基于世俗理由制定，不受宗教权威支配。' }, weights: { secularism: 1 } },
  { id: 'clerical-office', text: { en: 'Religious leaders should hold reserved offices in the government.', zh: '宗教领袖应在政府中拥有保留席位。' }, weights: { secularism: -1 } },
  { id: 'equal-public-service', text: { en: 'Public services should treat all beliefs without an official faith.', zh: '公共服务不应设立官方信仰，并应平等对待各种信念。' }, weights: { secularism: 1 } },

  { id: 'civilian-control', text: { en: 'Elected civilian institutions should control the armed forces.', zh: '民选的文职机构应控制武装力量。' }, weights: { military: -1 } },
  { id: 'military-emergency-rule', text: { en: 'Military leaders should be able to govern directly during a political emergency.', zh: '在政治紧急状态下，军方领导人应能直接执政。' }, weights: { military: 1 } },
  { id: 'civilian-defence-budget', text: { en: 'Civilian legislators should approve the defence budget and military deployments.', zh: '文职立法者应批准国防预算和军事部署。' }, weights: { military: -1 } },
  { id: 'officer-political-veto', text: { en: 'Senior officers should be able to veto major political decisions.', zh: '高级军官应能否决重大的政治决定。' }, weights: { military: 1 } },
]
