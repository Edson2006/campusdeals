import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import Notification from '../components/Notification';
import { getAnnoncesByAuthor, getUserProfile } from '../services/firestoreService';

const SellerProfilePage = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();

  const [seller, setSeller] = useState(null);
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sellerProfile, sellerAnnonces] = await Promise.all([
          getUserProfile(sellerId),
          getAnnoncesByAuthor(sellerId)
        ]);
        if (!sellerProfile) {
          if (isMounted) {
            setError("Ce vendeur n'existe pas ou n'est plus actif.");
          }
          return;
        }
        if (isMounted) {
          setSeller(sellerProfile);
          setAnnonces(sellerAnnonces);
        }
      } catch (err) {
        console.error('Erreur profil vendeur:', err);
        if (isMounted) {
          setError('Impossible de charger ce profil pour le moment.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [sellerId]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <NavigationBar />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 left-6 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-pink-500/25 blur-[180px]" />
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
            <button
              type="button"
              onClick={() => navigate('/annonces')}
              className="rounded-full border border-indigo-300/60 bg-indigo-500/20 px-4 py-2 text-white transition hover:bg-indigo-500/35"
            >
              Voir toutes les annonces
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-white/60">Chargement en cours...</p>
        ) : error ? (
          <div className="rounded-3xl border border-rose-400/40 bg-rose-500/10 p-8 text-sm text-rose-200">
            {error}
          </div>
        ) : seller ? (
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <aside className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center shadow-lg shadow-indigo-500/10 backdrop-blur">
                <div className="mx-auto h-32 w-32 overflow-hidden rounded-full border border-white/15">
                  {seller.photoURL ? (
                    <img src={seller.photoURL} alt={seller.displayName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-900/70 text-2xl font-semibold text-white/70">
                      {seller.displayName?.[0] || seller.uid?.[0] || 'U'}
                    </div>
                  )}
                </div>
                <h1 className="mt-4 text-2xl font-bold text-white">{seller.displayName || 'Vendeur CampusDeals'}</h1>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">{seller.promo || 'Promo inconnue'}</p>
                <p className="mt-3 text-xs text-white/60">
                  {seller.rating?.count
                    ? `${seller.rating.average.toFixed(1)} · ${seller.rating.count} avis`
                    : 'Nouveau vendeur'}
                </p>
                <button
                  type="button"
                  onClick={() => setToast({
                    type: 'info',
                    title: 'Contact bientôt disponible',
                    message: 'La messagerie privée sera activée dans une prochaine version.'
                  })}
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/80 transition hover:border-white/40 hover:text-white"
                >
                  Contacter le vendeur
                </button>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
                <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">À propos</h2>
                <ul className="mt-4 space-y-3 text-sm text-white/70">
                  <li>Email: <span className="text-white/90">{seller.email || 'Non renseigné'}</span></li>
                  <li>Promo: <span className="text-white/90">{seller.promo || 'Non renseignée'}</span></li>
                  <li>Annonces publiées: <span className="text-white/90">{annonces.length}</span></li>
                </ul>
              </div>
            </aside>

            <section className="space-y-6">
              <div className="flex flex-col gap-3">
                <h2 className="text-lg font-semibold text-white">Annonces de {seller.displayName || 'ce vendeur'}</h2>
                <p className="text-sm text-white/60">
                  Clique sur une annonce pour accéder à tous les détails et poursuivre sur CampusDeals.
                </p>
              </div>

              {annonces.length === 0 ? (
                <p className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/60">
                  Ce vendeur n'a pas encore publié d'annonce.
                </p>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {annonces.map((annonce) => (
                    <button
                      type="button"
                      key={annonce.id}
                      onClick={() => navigate(`/annonces/${annonce.id}`)}
                      className="group h-full rounded-3xl border border-white/10 bg-white/5 p-6 text-left shadow-lg shadow-indigo-500/10 backdrop-blur transition hover:border-white/25 hover:bg-white/10"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white group-hover:text-indigo-200">{annonce.title}</h3>
                          <p className="text-xs uppercase tracking-[0.25em] text-white/60">{annonce.category}</p>
                        </div>
                        <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                          {Number(annonce.price).toFixed(2)} €
                        </span>
                      </div>
                      <p className="mt-4 text-sm text-white/70">{annonce.description}</p>
                      {annonce.imageUrls?.length ? (
                        <div className="mt-4 flex gap-3 overflow-x-auto">
                          {annonce.imageUrls.slice(0, 3).map((url) => (
                            <img key={url} src={url} alt={annonce.title} className="h-20 w-20 flex-shrink-0 rounded-2xl object-cover" />
                          ))}
                        </div>
                      ) : null}
                      <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200/70">
                        Voir les détails <span aria-hidden="true">→</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SellerProfilePage;
