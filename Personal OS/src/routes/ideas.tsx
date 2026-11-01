import { createFileRoute } from '@tanstack/react-router'
import { IdeasScreen } from '@/features/ideas/IdeasScreen'

export const Route = createFileRoute('/ideas')({ component: IdeasScreen })
