import { useRef, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Notification from '../components/Notification'
import SignupForm from '../components/SignupForm'
import LoginForm from '../components/LoginForm'
import NavigationBar from '../components/NavigationBar'

const AuthPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState('signup')
  const [toast, setToast] = useState(null)
  const redirectTimerRef = useRef(null)
  const redirectTarget = location.state?.redirectTo || null

  const handleNotify = (payload) => {
    setToast({ ...payload, timestamp: Date.now() })
  }

  const handleSuccess = (payload) => {
    const basePayload =
      payload ?? {
        type: 'success',
        title: 'Connexion réussie',
        message: 'Bienvenue sur CampusDeals.',
      }

    setToast({ ...basePayload, timestamp: Date.now() })

    if (redirectTimerRef.current) {
      window.clearTimeout(redirectTimerRef.current)
    }

    redirectTimerRef.current = window.setTimeout(() => {
      const destination = redirectTarget || '/annonces'
      navigate(destination, { replace: true, state: { toast: basePayload } })
      redirectTimerRef.current = null
    }, 1200)
  }

  useEffect(() => () => {
    if (redirectTimerRef.current) {
      window.clearTimeout(redirectTimerRef.current)
      redirectTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    const incomingToast = location.state?.toast
    if (incomingToast) {
      setToast({ ...incomingToast, timestamp: Date.now() })
    }
  }, [location.state])

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <NavigationBar />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-32 h-96 w-96 rounded-full bg-indigo-500/40 blur-3xl" />
        <div className="absolute -right-24 -bottom-20 h-[420px] w-[420px] rounded-full bg-pink-500/30 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/20 blur-[180px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%)]" />
      </div>

      {toast ? (
        <div className="fixed top-6 right-6 z-50">
          <Notification
            key={toast.timestamp}
            {...toast}
            onClose={() => setToast(null)}
          />
        </div>
      ) : null}

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pb-16 pt-32">
        <div className="mb-8 flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 text-sm text-white/70">
          <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/60">
            Accès rapide
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.25em]">
            <button
              type="button"
              onClick={() => navigate('/annonces')}
              className="rounded-full border border-white/20 px-4 py-2 text-white/70 transition hover:border-white/40 hover:text-white"
            >
              Explorer les annonces
            </button>
            <button
              type="button"
              onClick={() => navigate('/profil')}
              className="rounded-full border border-white/20 px-4 py-2 text-white/70 transition hover:border-white/40 hover:text-white"
            >
              Mon espace
            </button>
          </div>
        </div>

        <div className="w-full max-w-5xl">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-white/15 via-white/5 to-white/0 p-10 shadow-2xl shadow-indigo-500/30 backdrop-blur">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_70%)]" />
              <div className="relative z-10 space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-white/70">
                  CampusDeals Inside
                </span>
                <h1 className="text-4xl font-black leading-tight text-white md:text-5xl">
                  La communauté privée pour les bons plans universitaires.
                </h1>
                <p className="text-base text-white/75 md:text-lg">
                  Accède aux annonces exclusives, échange avec les autres étudiants et trouve les meilleures offres autour du campus en quelques secondes.
                </p>
                <div className="grid gap-4 text-sm text-white/70 sm:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-lg">✨</span>
                    <div>
                      <p className="font-semibold text-white">Marketplace premium</p>
                      <p className="mt-1 leading-snug text-white/70">
                        Dépose tes annonces en toute sécurité et trouve les meilleures opportunités près de toi.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-lg">🤝</span>
                    <div>
                      <p className="font-semibold text-white">Confiance assurée</p>
                      <p className="mt-1 leading-snug text-white/70">
                        Comptes vérifiés et notifications instantanées pour suivre chaque étape.
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">
                  Aix-Marseille Université · Étudiants &amp; personnels
                </p>
              </div>
            </div>

            <div className="relative rounded-[32px] border border-white/10 bg-white/10 p-8 shadow-2xl shadow-indigo-500/20 backdrop-blur">
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-70" />
              <div className="relative z-10">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white">
                    {mode === 'signup' ? 'Rejoins-nous' : 'Heureux de te revoir'}
                  </h2>
                  <p className="mt-2 text-base text-white/70">
                    {mode === 'signup'
                      ? 'Crée ton compte CampusDeals et profite d’expériences réservées à la communauté AMU.'
                      : 'Connecte-toi pour consulter les dernières annonces publiées par la communauté.'}
                  </p>
                </div>

                <div className="mt-8 rounded-full border border-white/15 bg-white/10 p-1 text-sm font-semibold text-white/70">
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup')
                        setToast(null)
                      }}
                      className={`relative overflow-hidden rounded-full px-4 py-2 transition ${
                        mode === 'signup'
                          ? 'bg-white text-slate-900 shadow-lg shadow-indigo-500/30'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      Inscription
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login')
                        setToast(null)
                      }}
                      className={`relative overflow-hidden rounded-full px-4 py-2 transition ${
                        mode === 'login'
                          ? 'bg-white text-slate-900 shadow-lg shadow-indigo-500/30'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      Connexion
                    </button>
                  </div>
                </div>

                <div className="mt-10">
                  {mode === 'signup' ? (
                    <SignupForm onNotify={handleNotify} onSuccess={handleSuccess} />
                  ) : (
                    <LoginForm onNotify={handleNotify} onSuccess={handleSuccess} />
                  )}
                </div>

                <p className="mt-10 text-center text-sm text-white/70">
                  {mode === 'signup' ? 'Déjà un compte ?' : 'Nouveau sur CampusDeals ?'}
                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === 'signup' ? 'login' : 'signup')
                      setToast(null)
                    }}
                    className="ml-2 font-semibold text-white transition hover:text-indigo-200"
                  >
                    {mode === 'signup' ? 'Se connecter' : 'Créer un compte'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage