import { useNavigate } from 'react-router-dom'
import NavigationBar from '../components/NavigationBar'

const highlights = [
  { title: '2 000+', description: 'membres actifs dans la communauté' },
  { title: '24/7', description: 'modération & assistance CampusDeals' },
  { title: '100%', description: 'transactions sécurisées entre AMU' },
]

const heroImages = [
  {
    src: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80',
    alt: 'Groupe d’étudiants souriants sur le campus',
    className: 'col-span-2 aspect-[5/3] md:row-span-2',
  },
  {
    src: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=80',
    alt: 'Deux étudiants discutant autour d’un projet',
    className: 'aspect-square md:row-span-1',
  },
  {
    src: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    alt: 'Amis célébrant un projet universitaire',
    className: 'aspect-[4/5] md:row-span-1',
  },
  {
    src: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=800&q=80',
    alt: 'Étudiants travaillant ensemble dans une bibliothèque',
    className: 'col-span-2 aspect-[16/9] md:row-span-1',
  },
]

const featureCards = [
  {
    icon: '📦',
    title: 'Vends en quelques secondes',
    description: 'Publie tes annonces en trois clics et suis leurs performances en direct.',
  },
  {
    icon: '🛍️',
    title: 'Achète au meilleur prix',
    description: 'Filtre par campus, promo ou catégorie pour dénicher l’offre parfaite.',
  },
  {
    icon: '🔒',
    title: 'Sécurité AMU',
    description: 'Profils vérifiés par email universitaire et notifications en temps réel.',
  },
  {
    icon: '🚀',
    title: 'Boost tes projets',
    description: 'Récolte des feedbacks, gagne en visibilité et trouve des collaborateurs motivés.',
  },
]

const testimonials = [
  {
    quote:
      'CampusDeals nous a permis de vendre le matériel de notre association en une semaine. La communauté est hyper bienveillante !',
    name: 'Manon G.',
    role: 'Présidente BDE - Campus Saint-Charles',
  },
  {
    quote:
      'Je garde mes livres de cours en circulation grâce à la plateforme. C’est simple, rapide et on reste entre étudiants.',
    name: 'Yanis D.',
    role: 'Licence Informatique - Aix-en-Provence',
  },
  {
    quote:
      'L’équipe de modération est super réactive. On se sent en confiance pour acheter comme pour vendre.',
    name: 'Clara V.',
    role: 'Master Droit - Marseille',
  },
]

const steps = [
  {
    title: '1 · Crée ton compte',
    description: 'Inscris-toi avec ton email universitaire pour accéder à l’espace CampusDeals.',
    detail: 'La vérification est automatique et protège la communauté.',
  },
  {
    title: '2 · Publie ou explore',
    description: 'Ajoute ton annonce ou découvre celles des autres étudiants en temps réel.',
    detail: 'Filtres intelligents, recherches sauvegardées, alertes push.',
  },
  {
    title: '3 · Conclus en confiance',
    description: 'Chat intégré, rendez-vous sur le campus et notation réciproque pour chaque transaction.',
    detail: 'Un historique clair et des conseils pratiques à chaque étape.',
  },
]

const HomePage = () => {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <NavigationBar />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-24 h-[420px] w-[420px] rounded-full bg-indigo-500/40 blur-3xl" />
        <div className="absolute -right-24 top-10 h-[360px] w-[360px] rounded-full bg-purple-500/30 blur-3xl" />
        <div className="absolute left-1/2 bottom-[-180px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-pink-500/20 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.1),_transparent_60%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <main className="flex-1 space-y-24 px-6 pb-24 pt-32">
          <section className="mx-auto flex max-w-6xl flex-col gap-16 lg:flex-row lg:items-center">
            <div className="max-w-2xl space-y-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                Bienvenue sur CampusDeals
              </span>
              <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                La marketplace confidentielle pour les talents d’Aix-Marseille Université.
              </h1>
              <p className="text-lg text-white/75">
                Découvre des opportunités exclusives, finance tes projets et offre une seconde vie à ton matériel, le tout dans un cadre 100 % AMU.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  onClick={() => navigate('/auth')}
                  className="group relative flex w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-3 text-base font-semibold text-white shadow-xl shadow-indigo-500/30 transition hover:scale-[1.02] focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-50 sm:w-auto"
                >
                  <span className="absolute inset-0 translate-y-full bg-white/20 transition duration-500 group-hover:translate-y-0" />
                  <span className="relative flex items-center gap-2">
                    Commencer maintenant
                    <span aria-hidden="true">✨</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/annonces')}
                  className="w-full rounded-full border border-white/20 bg-white/5 px-8 py-3 text-base font-semibold text-white transition hover:border-white/35 hover:bg-white/10 sm:w-auto"
                >
                  Voir les annonces
                </button>
              </div>

              <dl className="grid gap-6 sm:grid-cols-3">
                {highlights.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-indigo-500/10 backdrop-blur"
                  >
                    <dt className="text-sm uppercase tracking-[0.25em] text-white/50">{item.description}</dt>
                    <dd className="mt-3 text-3xl font-bold text-white">{item.title}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative w-full max-w-2xl">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {heroImages.map((image) => (
                  <div
                    key={image.src}
                    className={`relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-3 shadow-2xl shadow-indigo-500/20 backdrop-blur ${image.className}`}
                  >
                    <div className="absolute inset-0 rounded-[26px] bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                    <img
                      src={image.src}
                      alt={image.alt}
                      loading="lazy"
                      className="relative h-full w-full rounded-[26px] object-cover shadow-lg shadow-indigo-500/20"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-3xl border border-white/15 bg-slate-900/80 p-6 text-center shadow-2xl shadow-indigo-500/40 md:absolute md:-bottom-12 md:right-8 md:mt-0 md:w-64 md:text-left">
                <p className="text-sm font-semibold text-white">+128 nouvelles annonces</p>
                <p className="mt-2 text-xs uppercase tracking-[0.3em] text-indigo-200/80">Cette semaine</p>
                <p className="mt-4 text-sm text-white/70">
                  Mode, high-tech, logement, événements… quelque chose t’attend toujours sur CampusDeals.
                </p>
              </div>
            </div>
          </section>

          <section id="features" className="mx-auto max-w-6xl">
            <div className="mb-10 max-w-2xl">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">Pensé par et pour les étudiants.</h2>
              <p className="mt-3 text-base text-white/70">
                Nos outils t’accompagnent de la publication jusqu’à la rencontre, pour une expérience fluide et sécurisée.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {featureCards.map((card) => (
                <div
                  key={card.title}
                  className="flex h-full flex-col justify-between gap-4 rounded-3xl border border-white/15 bg-white/10 p-6 shadow-lg shadow-indigo-500/15 backdrop-blur transition hover:border-white/30 hover:bg-white/15"
                >
                  <div className="flex items-start gap-4">
                    <span className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl">
                      {card.icon}
                    </span>
                    <div>
                      <p className="text-lg font-semibold text-white">{card.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-white/75">{card.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="experience" className="mx-auto max-w-6xl">
            <div className="mb-10 max-w-2xl">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">Ils en parlent mieux que nous.</h2>
              <p className="mt-3 text-base text-white/70">
                La plateforme rassemble déjà les étudiants des campus d’Aix et de Marseille. Voici ce qu’ils en retiennent.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.name}
                  className="flex h-full flex-col justify-between rounded-3xl border border-white/15 bg-white/10 p-6 text-left shadow-lg shadow-indigo-500/15 backdrop-blur"
                >
                  <p className="text-sm text-white/80">“{testimonial.quote}”</p>
                  <div className="mt-6">
                    <p className="text-base font-semibold text-white">{testimonial.name}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/50">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="support" className="mx-auto max-w-6xl">
            <div className="mb-10 max-w-2xl">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">Comment ça marche ?</h2>
              <p className="mt-3 text-base text-white/70">
                Trois étapes suffisent pour rejoindre les bons plans du campus et trouver ce qu’il te faut.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((step) => (
                <div
                  key={step.title}
                  className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-lg shadow-indigo-500/15 backdrop-blur"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-200">{step.title}</p>
                  <p className="mt-3 text-lg font-semibold text-white">{step.description}</p>
                  <p className="mt-3 text-sm text-white/70">{step.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-5xl overflow-hidden rounded-[36px] border border-white/15 bg-white/10 p-10 text-center shadow-2xl shadow-indigo-500/20 backdrop-blur">
            <div className="mx-auto max-w-3xl space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                Ta prochaine opportunité t’attend
              </span>
              <h2 className="text-4xl font-bold text-white">Prêt à faire bouger le campus ?</h2>
              <p className="text-base text-white/75">
                Rejoins la plateforme qui dynamise les projets étudiants, favorise les échanges responsables et crée des rencontres inoubliables.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  onClick={() => navigate('/auth')}
                  className="group relative flex w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-3 text-base font-semibold text-white shadow-xl shadow-indigo-500/30 transition hover:scale-[1.02] focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-50 sm:w-auto"
                >
                  <span className="absolute inset-0 translate-y-full bg-white/20 transition duration-500 group-hover:translate-y-0" />
                  <span className="relative">Créer un compte</span>
                </button>
                <button
                  onClick={() => navigate('/annonces')}
                  className="w-full rounded-full border border-white/20 bg-white/5 px-8 py-3 text-base font-semibold text-white transition hover:border-white/35 hover:bg-white/10 sm:w-auto"
                >
                  Explorer les annonces
                </button>
              </div>
            </div>
          </section>
        </main>

        <footer className="px-6 pb-8 text-center text-xs uppercase tracking-[0.3em] text-white/40">
          Support membre · contact@campusdeals.fr · Suis-nous @CampusDealsAMU
        </footer>
      </div>
    </div>
  )
}

export default HomePage