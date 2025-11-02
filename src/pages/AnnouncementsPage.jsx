import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Notification from '../components/Notification'
import { ensureConversationForAnnonce, getActiveAnnonces } from '../services/firestoreService'
import { useAuthContext } from '../context/AuthContext'
import NavigationBar from '../components/NavigationBar'

const formatPrice = (raw) => Number(raw ?? 0).toFixed(2)

const AnnouncementsPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthContext()

  const [toast, setToast] = useState(null)
  const [annonces, setAnnonces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [contactingId, setContactingId] = useState(null)

  useEffect(() => {
    const incoming = location.state?.toast
    if (incoming) {
      setToast({ ...incoming, timestamp: Date.now() })
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate])

  useEffect(() => {
    let isMounted = true
    const fetchAnnonces = async () => {
      try {
        setLoading(true)
        const data = await getActiveAnnonces()
        if (isMounted) {
          setAnnonces(data)
          setError(null)
        }
      } catch (err) {
        console.error('Erreur chargement annonces actives:', err)
        if (isMounted) {
          setError("Impossible de charger les annonces pour le moment.")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchAnnonces()
    return () => {
      isMounted = false
    }
  }, [])

  const headline = useMemo(() => {
    if (loading) return 'Chargement des annonces...'
    if (error) return 'Oups, un souci est survenu'
    if (annonces.length === 0) return 'Aucune annonce active pour le moment'
    return 'Annonces récentes'
  }, [annonces.length, error, loading])

  const handleCardNavigation = (annonceId) => {
    navigate(`/annonces/${annonceId}`)
  }

  const handleCardKeyDown = (event, annonceId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleCardNavigation(annonceId)
    }
  }

  const handleContactSeller = async (event, annonce) => {
    event.stopPropagation()
    event.preventDefault()

    if (!user) {
      navigate('/auth', {
        state: {
          redirectTo: `/annonces/${annonce.id}`,
          toast: {
            type: 'info',
            title: 'Connexion requise',
            message: 'Identifie-toi pour échanger avec le vendeur.'
          }
        }
      })
      return
    }

    setContactingId(annonce.id)
    try {
      const conversation = await ensureConversationForAnnonce(annonce)
      navigate(`/messages/${conversation.id}`)
    } catch (err) {
      console.error('Erreur création conversation:', err)
      const message =
        err.message === 'Vous êtes le vendeur de cette annonce.'
          ? 'Tu es le vendeur de cette annonce, inutile de t’écrire à toi-même.'
          : err.message || 'Impossible de démarrer la conversation.'
      setToast({
        type: 'error',
        title: 'Envoi impossible',
        message
      })
    } finally {
      setContactingId(null)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <NavigationBar />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 left-10 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[380px] w-[380px] rounded-full bg-pink-500/30 blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]" />
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
      <div className="relative z-10 min-h-screen px-6 pb-20 pt-32 text-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              CampusDeals
            </span>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">{headline}</h1>
                {user ? (
                  <p className="mt-3 max-w-2xl text-sm text-white/70">
                    Publie, mets à jour ou retire tes annonces depuis ton espace personnel. Clique sur une carte pour voir tous les détails.
                  </p>
                ) : (
                  <p className="mt-3 max-w-2xl text-sm text-white/70">
                    Connecte-toi pour publier tes annonces et contacter les vendeurs du campus.
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em]">
                <button
                  type="button"
                  onClick={() =>
                    navigate(user ? '/profil#annonce-form' : '/auth', {
                      state: user
                        ? null
                        : {
                            toast: {
                              type: 'info',
                              title: 'Identifie-toi',
                              message: 'Tu dois être connecté pour publier tes annonces.'
                            }
                          }
                    })
                  }
                  className="rounded-full border border-indigo-300/60 bg-indigo-500/20 px-4 py-2 text-white shadow-sm shadow-indigo-500/40 transition hover:bg-indigo-500/35"
                >
                  {user ? 'Publier' : 'Se connecter'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/profil')}
                  className="rounded-full border border-white/20 px-4 py-2 text-white/70 transition hover:border-white/40 hover:text-white"
                >
                  Espace perso
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="rounded-full border border-white/20 px-4 py-2 text-white/70 transition hover:border-white/40 hover:text-white"
                >
                  Accueil
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-white/60">Chargement en cours...</p>
          ) : error ? (
            <p className="text-sm text-rose-300">{error}</p>
          ) : annonces.length === 0 ? (
            <p className="text-sm text-white/60">Reviens bientôt, de nouvelles annonces arrivent.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {annonces.map((annonce) => (
                <article
                  key={annonce.id}
                  onClick={() => handleCardNavigation(annonce.id)}
                  onKeyDown={(event) => handleCardKeyDown(event, annonce.id)}
                  tabIndex={0}
                  role="button"
                  className="group h-full rounded-3xl border border-white/10 bg-white/5 p-6 text-left shadow-lg shadow-indigo-500/10 backdrop-blur-xl transition hover:border-white/25 hover:bg-white/10 focus:outline-none focus-visible:border-white/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-white group-hover:text-indigo-200">
                        {annonce.title}
                      </h2>
                      <p className="text-xs uppercase tracking-[0.25em] text-white/60">{annonce.category}</p>
                    </div>
                    <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                      {formatPrice(annonce.price)} €
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-white/70">{annonce.description}</p>
                  <div className="mt-5 flex items-center gap-3 text-sm text-white/60">
                    {annonce.authorPhotoURL ? (
                      <img
                        src={annonce.authorPhotoURL}
                        alt={annonce.authorDisplayName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-xs text-white/70">
                        {annonce.authorDisplayName?.[0] || '?'}
                      </span>
                    )}
                    <div>
                      <p className="font-semibold text-white">{annonce.authorDisplayName}</p>
                      <p className="text-xs uppercase tracking-[0.3em] text-white/50">Voir le profil</p>
                    </div>
                  </div>
                  {annonce.imageUrls?.length ? (
                    <div className="mt-4 flex gap-3 overflow-x-auto">
                      {annonce.imageUrls.map((url) => (
                        <img key={url} src={url} alt={annonce.title} className="h-20 w-20 flex-shrink-0 rounded-2xl object-cover" />
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        event.preventDefault()
                        handleCardNavigation(annonce.id)
                      }}
                      className="rounded-full border border-white/20 px-4 py-2 transition hover:border-white/40 hover:text-white"
                    >
                      Voir l’annonce
                    </button>
                    {annonce.authorId !== user?.uid ? (
                      <button
                        type="button"
                        onClick={(event) => handleContactSeller(event, annonce)}
                        disabled={contactingId === annonce.id}
                        className="rounded-full border border-indigo-300/60 bg-indigo-500/20 px-4 py-2 text-white transition hover:bg-indigo-500/35 disabled:cursor-wait disabled:opacity-60"
                      >
                        {contactingId === annonce.id ? 'Ouverture…' : 'Envoyer un message'}
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AnnouncementsPage
