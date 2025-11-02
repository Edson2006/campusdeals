import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';
import AnnonceForm from '../components/AnnonceForm';
import NavigationBar from '../components/NavigationBar';
import { useAuthContext } from '../context/AuthContext';
import {
  uploadProfilePhoto,
  updateUserProfile,
  syncAnnoncesAuthorInfo,
  getUserAnnonces,
  createAnnonce,
  updateAnnonce,
  deleteAnnonce
} from '../services/firestoreService';

const initialAnnonce = {
  title: '',
  description: '',
  price: '',
  category: '',
  status: 'active',
  imageUrls: []
};

const bgClass =
  'absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25),_transparent_60%)]';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, profile, loading, setUserProfileLocally } = useAuthContext();

  const [formState, setFormState] = useState({ displayName: '', promo: '' });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [toast, setToast] = useState(null);

  const [annonces, setAnnonces] = useState([]);
  const [annoncesLoading, setAnnoncesLoading] = useState(true);
  const [annonceSubmitting, setAnnonceSubmitting] = useState(false);
  const [editingAnnonce, setEditingAnnonce] = useState(null);

  useEffect(() => {
    if (profileImageFile) {
      const previewUrl = URL.createObjectURL(profileImageFile);
      setProfilePreview(previewUrl);
      return () => URL.revokeObjectURL(previewUrl);
    }
    setProfilePreview(profile?.photoURL || '');
  }, [profileImageFile, profile?.photoURL]);

  useEffect(() => {
    if (profile) {
      setFormState({
        displayName: profile.displayName || '',
        promo: profile.promo || ''
      });
    }
  }, [profile]);

  const loadAnnonces = useCallback(async () => {
    if (!user) return;
    try {
      setAnnoncesLoading(true);
      const items = await getUserAnnonces(user.uid);
      setAnnonces(items);
    } catch (error) {
      console.error('Erreur chargement annonces:', error);
      setToast({
        type: 'error',
        title: 'Impossible de charger tes annonces',
        message: 'Réessaie dans quelques instants.'
      });
    } finally {
      setAnnoncesLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth', {
        replace: true,
        state: {
          toast: {
            type: 'info',
            title: 'Connexion requise',
            message: 'Identifie-toi pour accéder à ton espace personnel.'
          }
        }
      });
    }
  }, [loading, navigate, user]);

  useEffect(() => {
    if (user) {
      loadAnnonces();
    }
  }, [loadAnnonces, user]);

  const profileRating = useMemo(() => {
    const average = profile?.rating?.average ?? 0;
    const count = profile?.rating?.count ?? 0;
    return { average, count };
  }, [profile]);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    if (!user) return;

    setIsSavingProfile(true);
    try {
      let photoURL = profile?.photoURL || '';
      if (profileImageFile) {
        photoURL = await uploadProfilePhoto(user.uid, profileImageFile);
      }

      await updateUserProfile(user.uid, {
        uid: user.uid,
        email: user.email,
        displayName: formState.displayName || 'Étudiant AMU',
        promo: formState.promo || '',
        photoURL
      });

      await setUserProfileLocally({
        displayName: formState.displayName || 'Étudiant AMU',
        photoURL
      });
      setProfilePreview(photoURL || '');
      await syncAnnoncesAuthorInfo(user.uid, {
        displayName: formState.displayName,
        photoURL
      });
      setToast({
        type: 'success',
        title: 'Profil mis à jour',
        message: 'Tes informations sont à jour sur l’ensemble de la plateforme.'
      });
      setProfileImageFile(null);
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      setToast({
        type: 'error',
        title: 'Modification impossible',
        message: 'Une erreur est survenue. Vérifie ta connexion et réessaie.'
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAnnonceSubmit = async (payload) => {
    if (!user) return;
    setAnnonceSubmitting(true);
    try {
      if (editingAnnonce) {
        await updateAnnonce(editingAnnonce.id, payload);
        setToast({
          type: 'success',
          title: 'Annonce actualisée',
          message: "Les modifications ont été enregistrées."
        });
      } else {
        await createAnnonce(payload);
        setToast({
          type: 'success',
          title: 'Annonce publiée',
          message: 'Ta publication est désormais visible par les étudiants.'
        });
      }
      setEditingAnnonce(null);
      await loadAnnonces();
    } catch (error) {
      console.error('Erreur enregistrement annonce:', error);
      setToast({
        type: 'error',
        title: 'Opération impossible',
        message: "Nous n'avons pas pu enregistrer l'annonce."
      });
      throw error;
    } finally {
      setAnnonceSubmitting(false);
    }
  };

  const handleDeleteAnnonce = async (annonceId) => {
    if (!annonceId) return;
    const confirmation = window.confirm('Supprimer cette annonce ?');
    if (!confirmation) return;

    try {
      await deleteAnnonce(annonceId);
      setToast({
        type: 'success',
        title: 'Annonce supprimée',
        message: 'Elle ne sera plus visible des autres étudiants.'
      });
      await loadAnnonces();
    } catch (error) {
      console.error('Erreur suppression annonce:', error);
      setToast({
        type: 'error',
        title: 'Suppression impossible',
        message: 'Réessaie ultérieurement.'
      });
    }
  };

  const handleFileSelection = (event) => {
    const file = event.target.files?.[0];
    setProfileImageFile(file || null);
  };

  const resetAnnonceForm = () => {
    setEditingAnnonce(null);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <NavigationBar />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 left-10 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-pink-500/25 blur-[180px]" />
        <div className={bgClass} />
      </div>

      {toast ? (
        <div className="fixed top-6 right-6 z-50">
          <Notification key={toast.title + toast.message} {...toast} onClose={() => setToast(null)} />
        </div>
      ) : null}

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-32">
        <header className="mb-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            Espace personnel
          </span>
          <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Ton profil &amp; tes annonces
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-white/70">
            Mets à jour ton identité, gère tes annonces et assure-toi que les étudiants trouvent tes meilleures offres.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
            <button
              type="button"
              onClick={() => navigate('/annonces')}
              className="rounded-full border border-white/20 px-4 py-2 transition hover:border-white/40 hover:text-white"
            >
              Voir les annonces
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-full border border-white/20 px-4 py-2 transition hover:border-white/40 hover:text-white"
            >
              Accueil
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('annonce-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="rounded-full border border-indigo-300/60 bg-indigo-500/20 px-4 py-2 text-white transition hover:bg-indigo-500/35"
            >
              Publier rapidement
            </button>
          </div>
        </header>

        <section className="mb-14 grid gap-8 lg:grid-cols-[320px_1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-indigo-500/10 backdrop-blur-xl">
            <div className="flex flex-col items-center text-center">
              <div className="relative h-32 w-32 overflow-hidden rounded-full border border-white/20 bg-slate-900/50">
                {profilePreview ? (
                  <img src={profilePreview} alt="Profil" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-white/40">
                    Aucune photo
                  </div>
                )}
              </div>
              <p className="mt-4 text-lg font-semibold text-white">
                {formState.displayName || 'Étudiant AMU'}
              </p>
              <p className="text-sm text-white/60">{profile?.email || user?.email}</p>
              <p className="mt-2 rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/60">
                {formState.promo || 'Promo inconnue'}
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400/90">
                <span className="text-base font-bold">{profileRating.average.toFixed(1)}</span>
                <span>{profileRating.count} avis</span>
              </div>
            </div>

            <label className="mt-8 block text-center text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
              Changer la photo
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelection}
                className="mt-3 w-full text-xs text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-indigo-500/90 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-indigo-500"
              />
            </label>
          </div>

          <form
            onSubmit={handleProfileSubmit}
            className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-indigo-500/10 backdrop-blur-xl"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={formState.displayName}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, displayName: event.target.value }))
                  }
                  placeholder="Ton nom public"
                  className="w-full rounded-2xl border border-white/20 bg-slate-900/60 px-4 py-3 text-sm text-white shadow-inner shadow-white/10 outline-none transition focus:border-white/40 focus:ring-2 focus:ring-indigo-400/60"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                  Promo
                </label>
                <input
                  type="text"
                  value={formState.promo}
                  onChange={(event) => setFormState((prev) => ({ ...prev, promo: event.target.value }))}
                  placeholder="Ex: L1 Droit"
                  className="w-full rounded-2xl border border-white/20 bg-slate-900/60 px-4 py-3 text-sm text-white shadow-inner shadow-white/10 outline-none transition focus:border-white/40 focus:ring-2 focus:ring-indigo-400/60"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                  Email universitaire
                </label>
                <input
                  type="email"
                  value={profile?.email || user?.email || ''}
                  disabled
                  className="w-full cursor-not-allowed rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/70"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                  Identifiant Firebase
                </label>
                <input
                  type="text"
                  value={user?.uid || ''}
                  disabled
                  className="w-full cursor-not-allowed rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/60"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-white shadow-lg shadow-indigo-500/40 transition hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSavingProfile ? 'Mise à jour...' : 'Enregistrer le profil'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormState({
                    displayName: profile?.displayName || '',
                    promo: profile?.promo || ''
                  });
                  setProfileImageFile(null);
                }}
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-white/70 transition hover:border-white/40 hover:text-white"
              >
                Réinitialiser
              </button>
            </div>
          </form>
        </section>

  <section id="annonce-form" className="mb-14">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-white">Gérer mes annonces</h2>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditingAnnonce(null)}
                className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/70 transition hover:border-white/40 hover:text-white"
              >
                Nouvelle annonce
              </button>
              {editingAnnonce ? (
                <button
                  type="button"
                  onClick={resetAnnonceForm}
                  className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/70 transition hover:border-white/40 hover:text-white"
                >
                  Annuler l'édition
                </button>
              ) : null}
            </div>
          </div>

          <AnnonceForm
            key={editingAnnonce ? editingAnnonce.id : 'create-form'}
            initialData={editingAnnonce || initialAnnonce}
            mode={editingAnnonce ? 'edit' : 'create'}
            onSubmit={handleAnnonceSubmit}
            onCancel={editingAnnonce ? resetAnnonceForm : undefined}
            isSubmitting={annonceSubmitting}
          />
        </section>

        <section>
          <h3 className="mb-4 text-lg font-semibold text-white">Mes annonces en ligne</h3>
          {annoncesLoading ? (
            <p className="text-sm text-white/60">Chargement en cours...</p>
          ) : annonces.length === 0 ? (
            <p className="text-sm text-white/60">Tu n'as pas encore publié d'annonce.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {annonces.map((annonce) => (
                <article
                  key={annonce.id}
                  className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{annonce.title}</h4>
                      <p className="mt-1 text-sm text-white/70">{annonce.category}</p>
                    </div>
                    <span className="rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/60">
                      {annonce.status}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-white/70">{annonce.description}</p>
                  <p className="mt-4 text-lg font-semibold text-emerald-300">{annonce.price.toFixed(2)} €</p>
                  {annonce.imageUrls?.length ? (
                    <div className="mt-4 flex gap-3 overflow-x-auto">
                      {annonce.imageUrls.map((url) => (
                        <img
                          key={url}
                          src={url}
                          alt={annonce.title}
                          className="h-20 w-20 flex-shrink-0 rounded-2xl object-cover"
                        />
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingAnnonce(annonce)}
                      className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/80 transition hover:border-white/40 hover:text-white"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAnnonce(annonce.id)}
                      className="rounded-full border border-rose-400/50 bg-rose-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-rose-300 transition hover:border-rose-400 hover:text-rose-200"
                    >
                      Supprimer
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
