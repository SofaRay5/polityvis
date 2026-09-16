import { useAppState } from '../context/AppStateContext'
import { messages } from '../i18n/messages'
import { createCountryFromDraft } from '../lib/countryBuilder'
import { validateCountryDraft } from '../lib/countryValidation'
import type { CountryDraft, ExecutiveOffice, LegislativeChamber, PartyGroup, TerritorialLevel, TranslatedLabel } from '../types/politics'
import '../styles/editor.css'

const colors = ['#2879ff', '#e85d63', '#35bf88', '#e6b83f', '#9b70e9', '#37b7c8']
const id = () => crypto.randomUUID()
const label = (zh: string, en: string): TranslatedLabel => ({ zh, en })

export function CountryEditor({ draft, onDraftChange, onBack, onSave }: { draft: CountryDraft; onDraftChange: (draft: CountryDraft) => void; onBack: () => void; onSave?: (draft: CountryDraft) => void }) {
  const { locale, createCountry } = useAppState()
  const t = messages[locale]
  const setDraft = onDraftChange
  const issues = validateCountryDraft(draft).issues
  const updateOffices = (offices: ExecutiveOffice[]) => setDraft({ ...draft, executiveOffices: offices })
  const updateChambers = (chambers: LegislativeChamber[]) => setDraft({ ...draft, chambers })
  const updateTerritories = (territorialLevels: TerritorialLevel[]) => setDraft({ ...draft, territorialLevels })
  const updateParties = (parties: Array<Partial<PartyGroup>>) => setDraft({ ...draft, parties })
  const submit = () => {
    if (issues.length > 0) return
    if (onSave) onSave(draft)
    else createCountry(createCountryFromDraft(draft, id(), new Date().toISOString()))
  }

  return <div className="wizard-panel editor-panel">
    <h2>{t['editor.title']}</h2>
    <div className="field-grid">
      <label>{t['wizard.countryName']}<input value={draft.name ?? ''} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
      <label>{t['wizard.stateForm']}<input value={draft.structure?.stateForm ?? ''} onChange={(event) => setDraft({ ...draft, structure: { ...draft.structure, stateForm: event.target.value } })} /></label>
      <label>{t['wizard.governmentForm']}<input value={draft.structure?.governmentForm ?? ''} onChange={(event) => setDraft({ ...draft, structure: { ...draft.structure, governmentForm: event.target.value } })} /></label>
    </div>

    <EditorSection title={t['editor.offices']} addLabel={t['editor.addOffice']} onAdd={() => updateOffices([...(draft.executiveOffices ?? []), { id: id(), label: label('新职位', 'New office'), selectionMethod: 'appointed', terms: 4 }])}>
      {draft.executiveOffices?.map((office, index) => <div className="editor-row" key={office.id}>
        <LabelInputs value={office.label} t={t} onChange={(value) => updateOffices(draft.executiveOffices!.map((item, itemIndex) => itemIndex === index ? { ...item, label: value } : item))} />
        <label>{t['wizard.selectionMethod']}<select value={office.selectionMethod} onChange={(event) => updateOffices(draft.executiveOffices!.map((item, itemIndex) => itemIndex === index ? { ...item, selectionMethod: event.target.value } : item))}><SelectionOptions t={t} /></select></label>
        <label>{t['editor.terms']}<input type="number" min="0" value={office.terms} onChange={(event) => updateOffices(draft.executiveOffices!.map((item, itemIndex) => itemIndex === index ? { ...item, terms: event.target.valueAsNumber } : item))} /></label>
        <Remove onClick={() => updateOffices(draft.executiveOffices!.filter((_, itemIndex) => itemIndex !== index))} t={t} />
      </div>)}
    </EditorSection>

    <EditorSection title={t['editor.chambers']} addLabel={t['editor.addChamber']} onAdd={() => updateChambers([...(draft.chambers ?? []), { id: id(), label: label('新议院', 'New chamber'), seats: 0, selectionMethod: 'directElection', isPartyChamber: false }])}>
      {draft.chambers?.map((chamber, index) => <div className="editor-row" key={chamber.id}>
        <LabelInputs value={chamber.label} t={t} onChange={(value) => updateChambers(draft.chambers!.map((item, itemIndex) => itemIndex === index ? { ...item, label: value } : item))} />
        <label>{t['editor.seats']}<input type="number" min="0" value={chamber.seats} onChange={(event) => updateChambers(draft.chambers!.map((item, itemIndex) => itemIndex === index ? { ...item, seats: event.target.valueAsNumber } : item))} /></label>
        <label>{t['wizard.selectionMethod']}<select value={chamber.selectionMethod} onChange={(event) => updateChambers(draft.chambers!.map((item, itemIndex) => itemIndex === index ? { ...item, selectionMethod: event.target.value } : item))}><SelectionOptions t={t} /></select></label>
        <label className="checkbox-label"><input type="checkbox" checked={chamber.isPartyChamber} onChange={(event) => updateChambers(draft.chambers!.map((item, itemIndex) => itemIndex === index ? { ...item, isPartyChamber: event.target.checked } : item))} />{t['editor.partyChamber']}</label>
        <Remove onClick={() => updateChambers(draft.chambers!.filter((_, itemIndex) => itemIndex !== index))} t={t} />
      </div>)}
    </EditorSection>

    <EditorSection title={t['editor.courts']} addLabel={t['editor.addCourt']} onAdd={() => setDraft({ ...draft, courts: [...(draft.courts ?? []), { id: id(), label: label('新法院', 'New court'), level: 0 }] })}>
      {draft.courts?.map((court, index) => <div className="editor-row" key={court.id}>
        <LabelInputs value={court.label} t={t} onChange={(value) => setDraft({ ...draft, courts: draft.courts!.map((item, itemIndex) => itemIndex === index ? { ...item, label: value } : item) })} />
        <label>{t['editor.courtLevel']}<input type="number" min="0" value={court.level} onChange={(event) => setDraft({ ...draft, courts: draft.courts!.map((item, itemIndex) => itemIndex === index ? { ...item, level: event.target.valueAsNumber } : item) })} /></label>
        <Remove onClick={() => setDraft({ ...draft, courts: draft.courts!.filter((_, itemIndex) => itemIndex !== index) })} t={t} />
      </div>)}
    </EditorSection>

    <EditorSection title={t['editor.territories']} addLabel={t['editor.addTerritory']} onAdd={() => updateTerritories([...(draft.territorialLevels ?? []), { id: id(), label: label('新层级', 'New level'), count: 1, autonomy: 0 }])}>
      {draft.territorialLevels?.map((level, index) => <div className="editor-row" key={level.id}>
        <LabelInputs value={level.label} t={t} onChange={(value) => updateTerritories(draft.territorialLevels!.map((item, itemIndex) => itemIndex === index ? { ...item, label: value } : item))} />
        <label>{t['editor.count']}<input type="number" min="0" value={level.count} onChange={(event) => updateTerritories(draft.territorialLevels!.map((item, itemIndex) => itemIndex === index ? { ...item, count: event.target.valueAsNumber } : item))} /></label>
        <label>{t['editor.autonomy']}<input type="number" min="0" max="100" value={level.autonomy} onChange={(event) => updateTerritories(draft.territorialLevels!.map((item, itemIndex) => itemIndex === index ? { ...item, autonomy: event.target.valueAsNumber } : item))} /></label>
        <Remove onClick={() => updateTerritories(draft.territorialLevels!.filter((_, itemIndex) => itemIndex !== index))} t={t} />
      </div>)}
    </EditorSection>

    <EditorSection title={t['wizard.step.parties']} addLabel={t['wizard.addPartyGroup']} onAdd={() => updateParties([...(draft.parties ?? []), { name: '', color: colors[(draft.parties?.length ?? 0) % colors.length], seats: 0, ideologyPosition: 0 }])}>
      {draft.parties?.map((party, index) => <div className="editor-row party-editor-row" key={party.id ?? index}>
        <label>{t['wizard.partyGroupName']}<input value={party.name ?? ''} onChange={(event) => updateParties(draft.parties!.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} /></label>
        <label>{t['wizard.partyGroupColor']}<input type="color" value={party.color ?? colors[index % colors.length]} onChange={(event) => updateParties(draft.parties!.map((item, itemIndex) => itemIndex === index ? { ...item, color: event.target.value } : item))} /></label>
        <label>{t['editor.seats']}<input type="number" min="0" value={party.seats ?? ''} onChange={(event) => updateParties(draft.parties!.map((item, itemIndex) => itemIndex === index ? { ...item, seats: event.target.valueAsNumber } : item))} /></label>
        <label>{t['editor.ideologyPosition']}<input type="number" min="-100" max="100" value={party.ideologyPosition ?? 0} onChange={(event) => updateParties(draft.parties!.map((item, itemIndex) => itemIndex === index ? { ...item, ideologyPosition: event.target.valueAsNumber } : item))} /></label>
        <Remove onClick={() => updateParties(draft.parties!.filter((_, itemIndex) => itemIndex !== index))} t={t} />
      </div>)}
    </EditorSection>

    {issues.map((issue) => <p className="field-error" key={issue}>{t[`validation.${issue}`]}</p>)}
    <div className="wizard-actions"><button type="button" className="button-subtle" onClick={onBack}>{t['wizard.back']}</button><button type="button" className="button-primary" disabled={issues.length > 0} onClick={submit}>{onSave ? t['editor.save'] : t['wizard.create']}</button></div>
  </div>
}

function EditorSection({ title, addLabel, onAdd, children }: { title: string; addLabel: string; onAdd: () => void; children: React.ReactNode }) {
  return <section className="editor-section"><h3>{title}</h3><div className="editor-list">{children}</div><button type="button" className="button-subtle" onClick={onAdd}>＋ {addLabel}</button></section>
}

function LabelInputs({ value, t, onChange }: { value: TranslatedLabel; t: typeof messages.en; onChange: (value: TranslatedLabel) => void }) {
  return <><label>{t['editor.labelZh']}<input value={value.zh} onChange={(event) => onChange({ ...value, zh: event.target.value })} /></label><label>{t['editor.labelEn']}<input value={value.en} onChange={(event) => onChange({ ...value, en: event.target.value })} /></label></>
}

function SelectionOptions({ t }: { t: typeof messages.en }) {
  return <><option value="directElection">{t['wizard.option.directElection']}</option><option value="indirectElection">{t['wizard.option.indirectElection']}</option><option value="appointed">{t['wizard.option.appointed']}</option><option value="hereditary">{t['wizard.option.hereditary']}</option><option value="parliamentaryElection">{t['wizard.option.parliamentaryElection']}</option><option value="militaryAppointment">{t['wizard.option.militaryAppointment']}</option><option value="election">{t['editor.election']}</option></>
}

function Remove({ onClick, t }: { onClick: () => void; t: typeof messages.en }) {
  return <button type="button" className="button-delete" onClick={onClick}>{t['editor.remove']}</button>
}
