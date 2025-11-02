import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import Notification from '../components/Notification';
import {
  ensureConversationForAnnonce,
  getAnnonceById,
  getAnnoncesByAuthor,
  getUserProfile
} from '../services/firestoreService';
import { useAuthContext } from '../context/AuthContext';

const safeDate = (timestamp) => {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp.toDate === 'function') return timestamp.toDate();
  if (typeof timestamp.toMillis === 'function') return new Date(timestamp.toMillis());
  if (typeof timestamp === 'number') return new Date(timestamp);
  return null;
};

const formatDate = (timestamp) => {
  const date = safeDate(timestamp);
  if (!date) return 'Date inconnue';
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

const AnnonceDetailPage = () => {
  const { annonceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [annonce, setAnnonce] = useState(null);
  const [seller, setSeller] = useState(null);
  const [otherAnnonces, setOtherAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [isContacting, setIsContacting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchAnnonce = async () => {
      try {
        setLoading(true);
        const annonceData = await getAnnonceById(annonceId);
        if (!annonceData) {
          if (isMounted) {
            setError("Cette annonce n'est plus disponible.");
          }
          return;
        }
        if (isMounted) {
          setAnnonce(annonceData);
        }
        const [sellerProfile, sellerAnnonces] = await Promise.all([
          getUserProfile(annonceData.authorId),
          getAnnoncesByAuthor(annonceData.authorId)
        ]);
        if (isMounted) {
          setSeller(sellerProfile);
          setOtherAnnonces(sellerAnnonces.filter((item) => item.id !== annonceData.id));
        }
      } catch (err) {
        console.error('Erreur chargement annonce:', err);
        if (isMounted) {
          setError("Impossible de charger cette annonce pour le moment.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAnnonce();
    return () => {
      isMounted = false;
    };
  }, [annonceId]);

  const mainImage = useMemo(() => annonce?.imageUrls?.[0] || seller?.photoURL || null, [annonce, seller]);

  const handleContactSeller = async () => {
    if (!user) {
      navigate('/auth', { state: { redirectTo: `/annonces/${annonceId}` } });
      return;
    }
    if (!annonce) return;
    setIsContacting(true);
    try {
      const conversation = await ensureConversationForAnnonce({ ...annonce, id: annonceId });
      navigate(`/messages/${conversation.id}`);
    } catch (err) {
      console.error('Erreur démarrage conversation:', err);
      const message =
        err.message === 'Vous êtes le vendeur de cette annonce.'
          ? 'Tu es le vendeur de cette annonce, pas besoin de te contacter !'
          : err.message || 'Impossible de démarrer la conversation.';
      setToast({
        type: 'error',
        title: 'Contact impossible',
        message
      });
    } finally {
      setIsContacting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <NavigationBar />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-10 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute bottom-0 right-10 h-[420px] w-[420px] rounded-full bg-pink-500/25 blur-[180px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]" />
      </div>

      {toast ? (
        <div className="fixed top-6 right-6 z-50">
          <Notification {...toast} onClose={() => setToast(null)} />
        </div>
      ) : null}

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-32">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
          <button
            type="button"
            onClick={() => navigate('/annonces')}
            className="rounded-full border border-white/20 px-4 py-2 transition hover:border-white/40 hover:text-white"
          >
            ← Retour aux annonces
          </button>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-full border border-white/20 px-4 py-2 transition hover:border-white/40 hover:text-white"
            >
              Accueil
            </button>
            {annonce?.authorId ? (
              <button
                type="button"
                onClick={() => navigate(`/vendeurs/${annonce.authorId}`)}
                className="rounded-full border border-indigo-300/60 bg-indigo-500/20 px-4 py-2 text-white transition hover:bg-indigo-500/35"
              >
                Profil du vendeur
              </button>
            ) : null}
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-white/60">Chargement en cours...</p>
        ) : error ? (
          <div className="rounded-3xl border border-rose-400/40 bg-rose-500/10 p-8 text-sm text-rose-200">
            {error}
          </div>
        ) : annonce ? (
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-4 shadow-2xl shadow-indigo-500/30 backdrop-blur">
                {mainImage ? (
                  <img src={mainImage} alt={annonce.title} className="h-[420px] w-full rounded-[28px] object-cover" />
                ) : (
                  <div className="flex h-[420px] items-center justify-center rounded-[28px] bg-slate-900/50 text-sm text-white/60">
                    Aucune image disponible
                  </div>
                )}
              </div>
              {annonce.imageUrls?.length > 1 ? (
                <div className="flex gap-4 overflow-x-auto">
                  {annonce.imageUrls.slice(1).map((url) => (
                    <img
                      key={url}
                      src={url}
                      alt={annonce.title}
                      className="h-28 w-28 rounded-2xl border border-white/15 object-cover"
                    />
                  ))}
                </div>
              ) : null}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
                <h2 className="text-lg font-semibold uppercase tracking-[0.3em] text-white/60">Description</h2>
                <p className="mt-4 text-base leading-relaxed text-white/80">{annonce.description}</p>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
                  {annonce.status === 'sold' ? 'Vendue' : annonce.status === 'archived' ? 'Archivée' : 'Disponible'}
                </span>
                <h1 className="mt-6 text-3xl font-black text-white">{annonce.title}</h1>
                <p className="mt-4 text-sm uppercase tracking-[0.3em] text-white/60">{annonce.category}</p>
                <p className="mt-6 text-4xl font-black text-emerald-300">{Number(annonce.price).toFixed(2)} €</p>
                <p className="mt-4 text-xs text-white/60">Mise en ligne le {formatDate(annonce.createdAt)}</p>
                <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
                  <button
                    type="button"
                    onClick={() => navigate(`/vendeurs/${annonce.authorId}`)}
                    className="rounded-full border border-white/20 px-4 py-2 transition hover:border-white/40 hover:text-white"
                  >
                    Voir le profil vendeur
                  </button>
                  {annonce.authorId !== user?.uid ? (
                    <button
                      type="button"
                      onClick={handleContactSeller}
                      disabled={isContacting}
                      className="rounded-full border border-white/20 px-4 py-2 transition hover:border-white/40 hover:text-white disabled:cursor-wait disabled:opacity-60"
                    >
                      {isContacting ? 'Ouverture...' : 'Contacter le vendeur'}
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
                <div className="flex items-start gap-4">
                  {seller?.photoURL ? (
                    <img
                      src={seller.photoURL}
                      alt={seller.displayName}
                      className="h-16 w-16 rounded-full border border-white/20 object-cover"
                    />
                  ) : (
                    <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 text-lg font-semibold text-white/80">
                      {seller?.displayName?.[0] || annonce.authorDisplayName?.[0] || 'U'}
                    </span>
                  )}
                  <div>
                    <p className="text-base font-semibold text-white">{seller?.displayName || annonce.authorDisplayName}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/50">{seller?.promo || 'Vendeur CampusDeals'}</p>
                    <p className="mt-2 text-xs text-white/60">
                      {seller?.rating?.count ? `${seller.rating.average.toFixed(1)} · ${seller.rating.count} avis` : 'Nouveau vendeur'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/vendeurs/${annonce.authorId}`)}
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-indigo-300/60 bg-indigo-500/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-indigo-500/35"
                >
                  Voir toutes ses annonces
                </button>
              </div>

              {otherAnnonces.length ? (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
                    Autres annonces du vendeur
                  </h2>
                  <div className="mt-4 space-y-3">
                    {otherAnnonces.slice(0, 4).map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => navigate(`/annonces/${item.id}`)}
                        className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition hover:border-white/30 hover:text-white"
                      >
                        <span className="truncate pr-3 text-left text-sm normal-case text-white">
                          {item.title}
                        </span>
                        <span className="text-emerald-200">{Number(item.price).toFixed(2)} €</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AnnonceDetailPage;
