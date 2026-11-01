import { Icon } from '@/components/ui/Icon'

interface QueryFeedbackProps {
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
  tone?: 'empty' | 'error'
}

export function QueryFeedback({ title, message, actionLabel, onAction, tone = 'empty' }: QueryFeedbackProps) {
  return (
    <div className={`query-feedback ${tone}`}>
      <span><Icon name={tone === 'error' ? 'error' : 'database'} size={25} /></span>
      <div><strong>{title}</strong><p>{message}</p></div>
      {actionLabel && onAction ? <button onClick={onAction} type="button">{actionLabel}</button> : null}
    </div>
  )
}
