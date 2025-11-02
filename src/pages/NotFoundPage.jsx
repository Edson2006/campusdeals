import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import NavigationBar from '../components/NavigationBar'

const NotFoundPage = () => {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate('/', { replace: true })
    }, 6000)

    return () => window.clearTimeout(timer)
  }, [navigate])

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <NavigationBar />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute right-10 bottom-10 h-[360px] w-[360px] rounded-full bg-pink-500/25 blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]" />
      </div>

  <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 pb-20 pt-32 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
          Erreur 404
        </span>
        <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl">
          Oups, cette page est introuvable.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-white/70">
          L’adresse <span className="text-white">{location.pathname}</span> ne fait pas partie du parcours CampusDeals ou nécessite une connexion préalable.
          Nous te redirigeons vers l’accueil dans quelques secondes.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate('/', { replace: true })}
            className="group relative flex w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-3 text-base font-semibold text-white shadow-xl shadow-indigo-500/30 transition hover:scale-[1.02] focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-50 sm:w-auto"
          >
            <span className="absolute inset-0 translate-y-full bg-white/20 transition duration-500 group-hover:translate-y-0" />
            <span className="relative">Retour à l’accueil</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/auth', { replace: true })}
            className="w-full rounded-full border border-white/20 bg-white/5 px-8 py-3 text-base font-semibold text-white transition hover:border-white/35 hover:bg-white/10 sm:w-auto"
          >
            S’identifier
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
