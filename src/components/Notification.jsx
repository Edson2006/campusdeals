import { useEffect } from 'react'

const variantClasses = {
  success: {
    container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    icon: 'text-emerald-500',
    accent: 'bg-emerald-500',
  },
  error: {
    container: 'bg-rose-50 border-rose-200 text-rose-900',
    icon: 'text-rose-500',
    accent: 'bg-rose-500',
  },
  info: {
    container: 'bg-sky-50 border-sky-200 text-sky-900',
    icon: 'text-sky-500',
    accent: 'bg-sky-500',
  },
}

const iconPaths = {
  success: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M4.5 12.75l6 6 9-13.5"
    />
  ),
  error: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M12 9v4.5m0 3v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  ),
  info: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M11.25 11.25h1.5v5.25m-1.5-8.25h.008v.008H11.25z"
    />
  ),
}

export default function Notification({
  type = 'info',
  title,
  message,
  autoHide = true,
  hideAfter = 4000,
  onClose,
}) {
  const variant = variantClasses[type] ?? variantClasses.info
  const icon = iconPaths[type] ?? iconPaths.info

  useEffect(() => {
    if (!autoHide || !onClose) return undefined

    const timeout = setTimeout(() => {
      onClose()
    }, hideAfter)

    return () => clearTimeout(timeout)
  }, [autoHide, hideAfter, onClose])

  return (
    <div
      role="status"
      className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-2xl ring-1 ring-black/5 transition-all ${variant.container}`}
    >
      <span
        className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/60 ${variant.icon}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          className="h-6 w-6"
        >
          {icon}
        </svg>
      </span>
      <div className="flex-1">
        {title ? <p className="font-semibold leading-tight">{title}</p> : null}
        {message ? <p className="mt-1 text-sm leading-snug opacity-80">{message}</p> : null}
      </div>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className={`group relative flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${variant.accent}`}
          aria-label="Fermer la notification"
        >
          <span className="absolute inset-0 rounded-full bg-white/40 opacity-0 transition group-hover:opacity-100" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4 stroke-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M6 6l8 8m0-8l-8 8"
            />
          </svg>
        </button>
      ) : null}
    </div>
  )
}
