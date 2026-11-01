import { createFileRoute } from '@tanstack/react-router'
import { ConnectionsScreen } from '@/features/connections/ConnectionsScreen'

export const Route = createFileRoute('/connections')({ component: ConnectionsScreen })
