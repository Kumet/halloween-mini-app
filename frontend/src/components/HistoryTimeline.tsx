import { useTranslation } from 'react-i18next'
import type { HistoryEntry } from '../lib/api'

function formatTimestamp(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function HistoryTimeline({ entries }: { entries: HistoryEntry[] }) {
  const { t } = useTranslation()

  if (entries.length === 0) {
    return <p className="text-sm text-zinc-500">{t('timeline.empty')}</p>
  }

  return (
    <ul className="space-y-3">
      {entries.map((entry) => (
        <li key={entry.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-zinc-400">
            <span className={entry.type === 'trick' ? 'text-orange-400' : 'text-green-400'}>
              {entry.type === 'trick' ? t('timeline.type.trick') : t('timeline.type.story')}
            </span>
            <span className="text-zinc-500">{formatTimestamp(entry.created_at)}</span>
          </div>
          <div className="mt-2 text-sm font-semibold text-zinc-100">{entry.summary}</div>
          {Object.keys(entry.payload ?? {}).length > 0 && (
            <pre className="mt-3 max-h-40 overflow-auto rounded-xl bg-zinc-950/50 p-3 text-xs text-zinc-500">
              {JSON.stringify(entry.payload, null, 2)}
            </pre>
          )}
        </li>
      ))}
    </ul>
  )
}
