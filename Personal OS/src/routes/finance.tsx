import { createFileRoute } from '@tanstack/react-router'
import { FinanceScreen } from '@/features/finance/FinanceScreen'

export const Route = createFileRoute('/finance')({ component: FinanceScreen })
