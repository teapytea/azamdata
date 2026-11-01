import { useQuery } from '@tanstack/react-query'
import { requireSupabase } from '@/lib/supabase'
import { useAuth } from '@/providers/auth-context'

export interface IdeaNote {
  id: string
  obsidianId: string
  title: string
  noteType: string
  status: string
  priority: string | null
  targetDate: string | null
  relativePath: string
  contentMarkdown: string
  updatedAt: string
  lastSeenAt: string
  tags: string[]
}

interface NoteRow {
  id: string; obsidian_id: string; title: string; note_type: string; status: string; priority: string | null; target_date: string | null; relative_path: string; content_markdown: string; updated_at: string; last_seen_at: string
  note_tags: Array<{ tag: string }> | { tag: string } | null
}

export const ideaKeys = { all: (userId: string) => ['ideas', userId] as const }

export async function fetchIdeas(): Promise<IdeaNote[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('notes')
    .select('id,obsidian_id,title,note_type,status,priority,target_date,relative_path,content_markdown,updated_at,last_seen_at,note_tags(tag)')
    .is('deleted_at', null)
    .neq('sync_status', 'deleted')
    .order('updated_at', { ascending: false })

  if (error) throw error

  return ((data ?? []) as NoteRow[]).map((row) => ({
    id: row.id,
    obsidianId: row.obsidian_id,
    title: row.title,
    noteType: row.note_type,
    status: row.status,
    priority: row.priority,
    targetDate: row.target_date,
    relativePath: row.relative_path,
    contentMarkdown: row.content_markdown,
    updatedAt: row.updated_at,
    lastSeenAt: row.last_seen_at,
    tags: (Array.isArray(row.note_tags) ? row.note_tags : row.note_tags ? [row.note_tags] : []).map((item) => item.tag),
  }))
}

export function useIdeas() {
  const { user } = useAuth()
  return useQuery({ queryKey: ideaKeys.all(user?.id ?? 'anonymous'), queryFn: fetchIdeas, enabled: Boolean(user) })
}
