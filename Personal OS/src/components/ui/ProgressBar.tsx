interface ProgressBarProps {
  value: number
  tone?: 'primary' | 'secondary' | 'warning' | 'danger'
  label: string
}

export function ProgressBar({ value, tone = 'primary', label }: ProgressBarProps) {
  const safeValue = Math.min(100, Math.max(0, value))

  return (
    <div
      aria-label={label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={safeValue}
      className="progress-track"
      role="progressbar"
    >
      <span className={`progress-fill progress-${tone}`} style={{ width: `${safeValue}%` }} />
    </div>
  )
}
