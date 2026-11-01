import { createFileRoute } from '@tanstack/react-router'
import { SubscriptionsScreen } from '@/features/subscriptions/SubscriptionsScreen'

export const Route = createFileRoute('/subscriptions')({ component: SubscriptionsScreen })
