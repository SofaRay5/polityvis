import { useState } from 'react'
import { createCountryFromDraft } from '../lib/countryBuilder'
import { validateCountryDraft } from '../lib/countryValidation'
import { messages } from '../i18n/messages'
import type { CountryDraft, PartyGroup } from '../types/politics'
import { useAppState } from '../context/AppStateContext'
import { WizardProgress } from './WizardProgress'
import '../styles/wizard.css'

const defaultDraft: CountryDraft = {
  name: '',
  structure: { stateForm: 'unitary', governmentForm: 'semiPresidential' },
  headOfState: { title: { zh: '国家元首', en: 'Head of state' }, selectionMethod: 'directElection' },
  headOfGovernment: { title: { zh: '政府首脑', en: 'Head of government' }, selectionMethod: 'appointed' },
  legislature: { lowerHouseSeats: 100, lowerHouseLabel: { zh: '下议院', en: 'Lower house' } },
  parties: [{ name: '', color: '#2879ff', seats: 100 }],
}

const colors = ['#2879ff', '#e85d63', '#35bf88', '#e6b83f', '#9b70e9', '#37b7c8']

export function CountryWizard() {
  const { locale, createCountry, setScreen } = useAppState()
  const t = messages[locale]
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<CountryDraft>(defaultDraft)
  const issues = validateCountryDraft(draft).issues

  const hasIssue = (issue: string) => issues.includes(issue as never)
  const profileValid = Boolean(draft.name?.trim())
  const executiveValid = Boolean(draft.headOfState?.selectionMethod && draft.headOfGovernment?.selectionMethod)
  const legislatureValid = !hasIssue('lowerHouseSeatsInvalid') && Boolean(draft.legislature?.lowerHouseSeats)
  const partiesValid = issues.length === 0 && Boolean(draft.parties?.length)
  const stepValid = [profileValid, executiveValid, legislatureValid, partiesValid][step]

  const updateParty = (index: number, field: keyof PartyGroup, value: string | number) => {
    setDraft((current) => ({ ...current, parties: current.parties?.map((party, partyIndex) => partyIndex === index ? { ...party, [field]: value } : party) }))
  }

  const submit = () => {
    if (!partiesValid) return
    const country = createCountryFromDraft(draft, crypto.randomUUID(), new Date().toISOString())
    createCountry(country)
  }

  return <section className="wizard" aria-labelledby="wizard-title">
    <button type="button" className="button-subtle" onClick={() => setScreen('library')}>← {t['wizard.cancel']}</button>
    <div className="wizard-heading"><p className="eyebrow">POLITYVIS</p><h1 id="wizard-title">{t['wizard.title']}</h1></div>
    <WizardProgress step={step} locale={locale} />
    <div className="wizard-panel">
      {step === 0 && <fieldset><legend>{t['wizard.step.profile']}</legend>
        <label>{t['wizard.countryName']}<input autoFocus value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
        <div className="field-grid"><label>{t['wizard.stateForm']}<select value={draft.structure?.stateForm} onChange={(event) => setDraft({ ...draft, structure: { ...draft.structure, stateForm: event.target.value } })}><option value="unitary">{t['wizard.option.unitary']}</option><option value="federal">{t['wizard.option.federal']}</option></select></label>
        <label>{t['wizard.governmentForm']}<select value={draft.structure?.governmentForm} onChange={(event) => setDraft({ ...draft, structure: { ...draft.structure, governmentForm: event.target.value } })}><option value="parliamentary">{t['wizard.option.parliamentary']}</option><option value="presidential">{t['wizard.option.presidential']}</option><option value="semiPresidential">{t['wizard.option.semiPresidential']}</option></select></label></div>
        {hasIssue('nameRequired') && <p className="field-error">{t['validation.nameRequired']}</p>}</fieldset>}
      {step === 1 && <fieldset><legend>{t['wizard.step.executive']}</legend>
        <div className="field-grid"><label>{t['wizard.headOfState']}<select value={draft.headOfState?.selectionMethod} onChange={(event) => setDraft({ ...draft, headOfState: { ...draft.headOfState, selectionMethod: event.target.value } })}><option value="directElection">{t['wizard.option.directElection']}</option><option value="indirectElection">{t['wizard.option.indirectElection']}</option><option value="hereditary">{t['wizard.option.hereditary']}</option></select></label>
        <label>{t['wizard.headOfGovernment']}<select value={draft.headOfGovernment?.selectionMethod} onChange={(event) => setDraft({ ...draft, headOfGovernment: { ...draft.headOfGovernment, selectionMethod: event.target.value } })}><option value="appointed">{t['wizard.option.appointed']}</option><option value="directElection">{t['wizard.option.directElection']}</option></select></label></div></fieldset>}
      {step === 2 && <fieldset><legend>{t['wizard.step.legislature']}</legend>
        <div className="field-grid"><label>{t['wizard.legislatureType']}<select value={draft.legislature?.upperHouseLabel ? 'bicameral' : 'unicameral'} onChange={(event) => setDraft({ ...draft, legislature: { ...draft.legislature, upperHouseLabel: event.target.value === 'bicameral' ? { zh: '上议院', en: 'Upper house' } : undefined } })}><option value="unicameral">{t['wizard.unicameral']}</option><option value="bicameral">{t['wizard.bicameral']}</option></select></label>
        <label>{t['wizard.lowerHouseSeats']}<input type="number" min="1" value={draft.legislature?.lowerHouseSeats ?? ''} onChange={(event) => setDraft({ ...draft, legislature: { ...draft.legislature, lowerHouseSeats: Number(event.target.value) } })} /></label></div>
        {hasIssue('lowerHouseSeatsInvalid') && <p className="field-error">{t['validation.lowerHouseSeatsInvalid']}</p>}</fieldset>}
      {step === 3 && <fieldset><legend>{t['wizard.step.parties']}</legend>
        <div className="party-list">{draft.parties?.map((party, index) => <div className="party-row" key={`party-${index}`}><input aria-label={t['wizard.partyGroupName']} placeholder={t['wizard.partyGroupName']} value={party.name ?? ''} onChange={(event) => updateParty(index, 'name', event.target.value)} /><input aria-label={t['wizard.partyGroupColor']} type="color" value={party.color ?? colors[index % colors.length]} onChange={(event) => updateParty(index, 'color', event.target.value)} /><input aria-label={t['wizard.partyGroupSeats']} type="number" min="0" value={party.seats ?? ''} onChange={(event) => updateParty(index, 'seats', Number(event.target.value))} />{draft.parties && draft.parties.length > 1 && <button type="button" className="button-delete" onClick={() => setDraft({ ...draft, parties: draft.parties?.filter((_, partyIndex) => partyIndex !== index) })}>{t['wizard.removePartyGroup']}</button>}</div>)}</div>
        <button type="button" className="button-subtle" onClick={() => setDraft({ ...draft, parties: [...(draft.parties ?? []), { name: '', color: colors[(draft.parties?.length ?? 0) % colors.length], seats: 0 }] })}>＋ {t['wizard.addPartyGroup']}</button>
        {issues.map((issue) => <p className="field-error" key={issue}>{t[`validation.${issue}`]}</p>)}</fieldset>}
      <div className="wizard-actions"><button type="button" className="button-subtle" disabled={step === 0} onClick={() => setStep(step - 1)}>{t['wizard.back']}</button>{step < 3 ? <button type="button" className="button-primary" disabled={!stepValid} onClick={() => setStep(step + 1)}>{t['wizard.next']}</button> : <button type="button" className="button-primary" disabled={!stepValid} onClick={submit}>{t['wizard.create']}</button>}</div>
    </div>
  </section>
}
