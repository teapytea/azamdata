import { createFileRoute } from '@tanstack/react-router'
import { QuotaScreen } from '@/features/quota/QuotaScreen'

export const Route = createFileRoute('/quota')({ component: QuotaScreen })
