import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../services/firebase'

const fallbackNotify = () => {}

const labelClasses =
  'flex items-center justify-between text-xs font-semibold uppercase tracking-[0.35em] text-white/70'
const inputWrapperClasses =
  'group relative rounded-[28px] border border-white/15 bg-white/10 p-6 shadow-2xl shadow-indigo-500/20 backdrop-blur-xl transition hover:border-white/35 hover:bg-white/15'
const fieldBaseClasses =
  'mt-4 w-full rounded-2xl border border-white/30 bg-white/95 px-5 py-3 text-sm font-medium text-slate-700 placeholder:text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none ring-2 ring-transparent transition focus:border-transparent focus:ring-indigo-300/80 focus:ring-offset-2 focus:ring-offset-white/10'
const helperClasses = 'mt-3 text-[10px] uppercase tracking-[0.45em] text-white/45'

const errorMessages = {
  'auth/user-not-found': 'Aucun compte ne correspond à cette adresse email.',
  'auth/wrong-password': 'Mot de passe incorrect. Vérifie-le et réessaie.',
  'auth/invalid-credential': 'Identifiants invalides. Merci de saisir une adresse et un mot de passe valides.',
  'auth/too-many-requests': 'Trop de tentatives infructueuses. Réessaie dans quelques minutes.',
  'auth/user-disabled': 'Ce compte a été désactivé. Contacte le support CampusDeals.',
}

export default function LoginForm({ onNotify = fallbackNotify, onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      setIsSubmitting(true)

      await signInWithEmailAndPassword(auth, email, password)

      const successPayload = {
        type: 'success',
        title: 'Connexion réussie',
        message: 'Ravi de te revoir sur CampusDeals. Prépare-toi à découvrir les annonces du moment !',
      }

      if (typeof onSuccess === 'function') {
        onSuccess(successPayload)
      } else {
        onNotify(successPayload)
      }

      setEmail('')
      setPassword('')
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[LoginForm] sign in error', err)
      }

      const message = errorMessages[err.code] ?? 'Impossible de te connecter pour le moment. Vérifie tes informations ou réessaie plus tard.'

      onNotify({
        type: 'error',
        title: 'Connexion refusée',
        message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-6" aria-live="assertive">
      <div className={inputWrapperClasses}>
        <label htmlFor="login-email" className={labelClasses}>
          <span>EMAIL</span>
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="prenom.nom@email.com"
          required
          className={fieldBaseClasses}
          autoComplete="email"
        />
        <p className={helperClasses}>Adresse liée à ton compte CampusDeals</p>
      </div>

      <div className={inputWrapperClasses}>
        <label htmlFor="login-password" className={labelClasses}>
          <span>MOT DE PASSE</span>
          <a
            href="#"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60 transition hover:text-white"
          >
            Oublié ?
          </a>
        </label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Ton mot de passe"
          required
          className={fieldBaseClasses}
          autoComplete="current-password"
        />
        <p className={helperClasses}>Ton accès privilégié</p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="group relative flex w-full items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 text-base font-semibold tracking-wide text-white shadow-lg shadow-indigo-500/40 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-50 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span className="absolute inset-0 translate-y-full bg-white/20 transition duration-500 group-hover:translate-y-0" />
        <span className="relative flex items-center gap-3">
          {isSubmitting ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : null}
          Se connecter
        </span>
      </button>
    </form>
  )
}
