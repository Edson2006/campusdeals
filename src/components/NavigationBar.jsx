import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import Notification from './Notification';

const baseLinkClasses =
  'text-xs font-semibold uppercase tracking-[0.25em] transition px-3 py-2 rounded-full border border-transparent';

const activeClasses = 'text-white border-white/40 bg-white/10 shadow-sm shadow-white/10';
const inactiveClasses = 'text-white/70 hover:text-white hover:border-white/30';

const NavigationBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, logout, loading } = useAuthContext();
  const [toast, setToast] = useState(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsSigningOut(true);
      await logout();
      setToast({
        type: 'info',
        title: 'Déconnexion effectuée',
        message: 'Reviens vite sur CampusDeals.'
      });
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      setToast({
        type: 'error',
        title: 'Déconnexion impossible',
        message: 'Réessaie dans quelques instants.'
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  const linkClassName = (path) => {
    const isRoot = path === '/';
    const normalizedPath = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
    const current = location.pathname;
    const isActive = isRoot
      ? current === '/'
      : current === normalizedPath || current.startsWith(`${normalizedPath}/`);
    return `${baseLinkClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {toast ? (
        <div className="pointer-events-auto fixed left-1/2 top-4 z-50 -translate-x-1/2">
          <Notification {...toast} onClose={() => setToast(null)} />
        </div>
      ) : null}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border border-white/10 bg-slate-950/80 px-4 py-3 shadow-lg shadow-indigo-500/10 backdrop-blur-2xl">
        <button
          type="button"
          className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.4em] text-white"
          onClick={() => navigate('/')}
        >
          <span className="h-2 w-2 rounded-full bg-indigo-400" />
          CampusDeals
        </button>
        <nav className="hidden items-center gap-3 md:flex">
          <Link to="/" className={linkClassName('/')}
            aria-label="Accueil"
          >
            Accueil
          </Link>
          <Link to="/annonces" className={linkClassName('/annonces')} aria-label="Annonces">
            Annonces
          </Link>
          {user ? (
            <Link
              to="/profil"
              className={linkClassName('/profil')}
              aria-label="Profil utilisateur"
            >
              Mon Profil
            </Link>
          ) : (
            <Link to="/auth" className={linkClassName('/auth')} aria-label="Connexion">
              Connexion
            </Link>
          )}
          {user ? (
            <Link to="/messages" className={linkClassName('/messages')} aria-label="Messagerie">
              Messages
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button
                type="button"
                onClick={() => navigate('/profil#annonce-form')}
                className="hidden items-center gap-2 rounded-full border border-indigo-300/60 bg-indigo-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow-sm shadow-indigo-500/40 transition hover:bg-indigo-500/40 md:flex"
              >
                Publier une annonce
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isSigningOut}
                className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/75 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSigningOut ? 'Déconnexion...' : 'Se déconnecter'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/profil')}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-semibold uppercase tracking-[0.25em] text-white"
                aria-label="Espace personnel"
              >
                {profile?.displayName?.[0]?.toUpperCase() || 'U'}
              </button>
            </>
          ) : !loading ? (
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/80 transition hover:border-white/40 hover:text-white"
            >
              Se connecter
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default NavigationBar;
