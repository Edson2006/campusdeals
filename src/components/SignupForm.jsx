import { useState } from 'react'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { auth } from '../services/firebase'
import { createUserProfile } from '../services/firestoreService'

const fallbackNotify = () => {}

const labelClasses =
  'flex items-center justify-between text-xs font-semibold uppercase tracking-[0.35em] text-white/70'
const inputWrapperClasses =
  'group relative rounded-[28px] border border-white/15 bg-white/10 p-6 shadow-2xl shadow-indigo-500/20 backdrop-blur-xl transition hover:border-white/35 hover:bg-white/15'
const fieldBaseClasses =
  'mt-4 w-full rounded-2xl border border-white/30 bg-white/95 px-5 py-3 text-sm font-medium text-slate-700 placeholder:text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none ring-2 ring-transparent transition focus:border-transparent focus:ring-indigo-300/80 focus:ring-offset-2 focus:ring-offset-white/10'
const helperClasses = 'mt-3 text-[10px] uppercase tracking-[0.45em] text-white/45'

export default function SignupForm({ onNotify = fallbackNotify, onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSignup = async (e) => {
    e.preventDefault()

    // DEV: Règle temporairement désactivée pour les tests.
    /*
    if (!email.endsWith('@etu.univ-amu.fr')) {
      onNotify({
        type: 'error',
        title: 'Email non autorisé',
        message: 'Merci d’utiliser votre adresse universitaire @etu.univ-amu.fr.',
      })
      return
    }
    */

    try {
      setIsSubmitting(true)

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      await createUserProfile(user, { displayName })

      let verificationFailed = false
      try {
        await sendEmailVerification(user)
      } catch (verificationError) {
        verificationFailed = true
        if (import.meta.env.DEV) {
          console.error('[SignupForm] email verification error', verificationError)
        }
      }

      const successPayload = {
        type: 'success',
        title: 'Inscription réussie',
        message: verificationFailed
          ? "Compte créé mais l'email de vérification n'a pas pu être envoyé. Tu pourras redemander le lien depuis ton espace utilisateur."
          : 'Compte créé avec succès. Vérifie ta boîte mail pour activer ton accès.',
      }

      if (typeof onSuccess === 'function') {
        onSuccess(successPayload)
      } else {
        onNotify(successPayload)
      }

      setDisplayName('')
      setEmail('')
      setPassword('')

    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[SignupForm] create account error', err)
      }

      let message = 'Une erreur imprévue est survenue. Merci de réessayer dans quelques instants.'

      if (err.code === 'auth/email-already-in-use') {
        message = 'Cet email est déjà utilisé. Essaie de te connecter ou choisis une autre adresse.'
      } else if (err.code === 'auth/weak-password') {
        message = 'Ton mot de passe doit contenir au minimum six caractères.'
      } else if (err.code === 'auth/invalid-email') {
        message = 'L’adresse email semble incorrecte. Vérifie l’orthographe puis réessaie.'
      }

      onNotify({
        type: 'error',
        title: 'Impossible de finaliser l’inscription',
        message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSignup} className="space-y-6" aria-live="assertive">
      <div className={inputWrapperClasses}>
        <label htmlFor="displayName" className={labelClasses}>
          <span>NOM COMPLET</span>
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Jean Dupont"
          required
          className={fieldBaseClasses}
        />
        <p className={helperClasses}>Ton identité sur le campus</p>
      </div>

      <div className={inputWrapperClasses}>
        <label htmlFor="email" className={labelClasses}>
          <span>EMAIL UNIVERSITAIRE</span>
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="prenom.nom@email.com"
          required
          className={fieldBaseClasses}
        />
        <p className={helperClasses}>Nous ne partagerons jamais ton adresse</p>
      </div>

      <div className={inputWrapperClasses}>
        <label htmlFor="password" className={labelClasses}>
          <span>MOT DE PASSE</span>
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="min. 6 caractères"
          required
          className={fieldBaseClasses}
        />
        <p className={helperClasses}>Ajoute chiffres &amp; lettres pour plus de sécurité</p>
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
          Rejoindre CampusDeals
        </span>
      </button>
    </form>
  )
}