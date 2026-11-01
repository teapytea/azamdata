import { useMemo, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { QueryFeedback } from '@/components/ui/QueryFeedback'
import { formatRelativeTime } from '@/lib/format'
import { type IdeaNote, useIdeas } from './ideas.api'

const tabs = ['Inbox', 'Projects', 'Archive'] as const

export function IdeasScreen() {
  const ideasQuery = useIdeas()
  const ideas = useMemo(() => ideasQuery.data ?? [], [ideasQuery.data])
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Inbox')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const tabbedIdeas = useMemo(() => ideas.filter((idea) => {
    if (activeTab === 'Archive') return idea.status.toLowerCase() === 'archived'
    if (activeTab === 'Projects') return idea.noteType.toLowerCase() === 'project' && idea.status.toLowerCase() !== 'archived'
    return idea.status.toLowerCase() !== 'archived'
  }), [activeTab, ideas])
  const visibleIdeas = useMemo(() => tabbedIdeas.filter((idea) => `${idea.title} ${idea.contentMarkdown} ${idea.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())), [query, tabbedIdeas])
  const selectedIdea = visibleIdeas.find((idea) => idea.id === selectedId) ?? visibleIdeas[0] ?? null
  const counts = {
    Inbox: ideas.filter((idea) => idea.status.toLowerCase() !== 'archived').length,
    Projects: ideas.filter((idea) => idea.noteType.toLowerCase() === 'project' && idea.status.toLowerCase() !== 'archived').length,
    Archive: ideas.filter((idea) => idea.status.toLowerCase() === 'archived').length,
  }
  const latestSync = ideas.reduce<string | null>((latest, idea) => !latest || idea.lastSeenAt > latest ? idea.lastSeenAt : latest, null)

  return (
    <div className="ideas-workspace">
      <section className="ideas-list-pane">
        <header className="ideas-header"><div><p className="eyebrow">Obsidian vault</p><h1>Ideas</h1></div><span className="live-data-badge">Read only</span></header>
        <label className="quick-note-field"><Icon name="search" size={20} /><input aria-label="Search vault" onChange={(event) => setQuery(event.target.value)} placeholder="Search your vault..." value={query} /></label>
        <div className="idea-tabs" role="tablist">{tabs.map((tab) => <button aria-selected={activeTab === tab} className={activeTab === tab ? 'active' : ''} key={tab} onClick={() => setActiveTab(tab)} role="tab" type="button">{tab}<span>{counts[tab]}</span></button>)}</div>
        <div className="vault-status"><span><i className={latestSync ? '' : 'offline'} /> {latestSync ? `Synced ${formatRelativeTime(latestSync)}` : 'No vault sync received'}</span><Icon name="sync" size={17} /></div>

        {ideasQuery.isError ? <QueryFeedback actionLabel="Try again" message={ideasQuery.error.message} onAction={() => void ideasQuery.refetch()} title="Vault notes could not be loaded" tone="error" /> : null}
        {ideasQuery.isSuccess && ideas.length === 0 ? <QueryFeedback message="The local Obsidian agent has not synchronized any recognized notes yet. No placeholder notes are shown." title="Vault is empty" /> : null}

        <div className="idea-card-list">
          {visibleIdeas.map((idea, index) => (
            <button aria-pressed={selectedIdea?.id === idea.id} className={`idea-card ${selectedIdea?.id === idea.id ? 'selected' : ''}`} key={idea.id} onClick={() => setSelectedId(idea.id)} type="button">
              <span className={`idea-accent ${getAccent(index)}`} />
              <span className="idea-card-copy"><strong>{idea.title}</strong><span>{getExcerpt(idea)}</span><small><em>{idea.tags[0] ?? idea.noteType}</em>{formatRelativeTime(idea.updatedAt)}</small></span>
            </button>
          ))}
        </div>
      </section>

      <article className="idea-detail-pane">
        {selectedIdea ? <IdeaDocument idea={selectedIdea} /> : <div className="idea-detail-empty"><Icon name="description" size={34} /><strong>Select a synchronized note</strong><p>The note body will appear here without creating a second editor.</p></div>}
      </article>
    </div>
  )
}

function IdeaDocument({ idea }: { idea: IdeaNote }) {
  return (
    <>
      <header className="idea-detail-header"><span><small>{idea.relativePath}</small><strong>Read-only preview</strong></span><div><a className="obsidian-button" href={`obsidian://open?path=${encodeURIComponent(idea.relativePath)}`}><Icon name="open_in_new" size={18} /> Open in Obsidian</a></div></header>
      <div className="idea-document">
        <p className="document-date">Last updated {formatRelativeTime(idea.updatedAt)}</p>
        <h2>{idea.title}</h2>
        <div className="document-tags"><span>{idea.noteType}</span>{idea.priority ? <span>Priority: {idea.priority}</span> : null}<span>Status: {idea.status}</span>{idea.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
        <div className="markdown-preview">{idea.contentMarkdown || 'This synchronized note has no body content.'}</div>
      </div>
    </>
  )
}

function getExcerpt(idea: IdeaNote): string {
  return idea.contentMarkdown.replace(/^---[\s\S]*?---/, '').replace(/[#*_`>-]/g, '').trim().slice(0, 160) || 'No note content.'
}

function getAccent(index: number): 'violet' | 'blue' | 'pink' {
  return (['violet', 'blue', 'pink'] as const)[index % 3]
}
