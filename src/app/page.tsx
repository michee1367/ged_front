import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileStack,
  FolderOpen,
  Send,
  ShieldCheck,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: FolderOpen,
    title: "Gestion centralisée des dossiers",
    description:
      "Créez, classez et suivez chaque dossier entrant depuis un tableau de bord unique, avec priorité, échéance et objet.",
  },
  {
    icon: Send,
    title: "Transmission interservices",
    description:
      "Affectez un dossier au service compétent et suivez son avancement via un historique complet des transmissions.",
  },
  {
    icon: FileStack,
    title: "Documents et pièces jointes",
    description:
      "Joignez, archivez et consultez les pièces justificatives rattachées à chaque dossier sans quitter la plateforme.",
  },
  {
    icon: BarChart3,
    title: "Tableaux de bord",
    description:
      "Visualisez en temps réel les volumes traités, les dossiers en cours et la répartition par service.",
  },
];

const steps = [
  {
    title: "Créez votre compte",
    description:
      "Renseignez vos informations et sélectionnez votre service de rattachement éventuel.",
  },
  {
    title: "Demandez votre accès",
    description:
      "Un administrateur du Secrétariat Général valide votre compte et vous attribue votre rôle.",
  },
  {
    title: "Traitez vos dossiers",
    description:
      "Une fois activé, vous accédez au tableau de bord et traitez les dossiers qui vous sont transmis.",
  },
];

const highlights = [
  "Traçabilité complète des transmissions",
  "Rôles et services gérés par l'administration",
  "Consultation des pièces jointes",
  "Indicateurs de suivi",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* En-tête */}
      <header className="sticky top-0 z-30 border-b border-border bg-white/85 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 p-1">
              <img src="/logo.jpeg" alt="Logo Ministère" className="h-full w-full object-contain" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold text-slate-900">GED Ministère</p>
              <p className="hidden text-[11px] text-slate-500 sm:block">Secrétariat Général</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            <a href="#fonctionnalites" className="text-sm text-slate-600 hover:text-slate-900">
              Fonctionnalités
            </a>
            <a href="#etapes" className="text-sm text-slate-600 hover:text-slate-900">
              Accès
            </a>
            <Link href="/login" className={cn(buttonVariants({ size: "sm" }))}>
              Se connecter
            </Link>
          </nav>

          <Link href="/login" className={cn(buttonVariants({ size: "sm" }), "md:hidden")}>
            Connexion
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-24 h-64 rounded-full bg-blue-200/40 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-medium text-blue-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Accès réservé aux agents habilités
            </span>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              La gestion électronique de documents du Secrétariat du Ministère
            </h1>

            <p className="mt-5 max-w-2xl text-lg text-slate-600">
              Centralisez vos dossiers, organisez les transmissions entre services et istrumentez le
              suivi de votre courrier, dans un espace unique et sécurisé.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>
                Demander un accès
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                Déjà un compte ? Se connecter
              </Link>
            </div>

            <ul className="mt-10 grid gap-3 sm:grid-cols-2">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section id="fonctionnalites" className="border-t border-border bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Un outil unique pour tout le circuit documentaire
            </h2>
            <p className="mt-3 text-slate-600">
              La GED couvre l&apos;ensemble de la chaîne : de la réception d&apos;un dossier à son
              traitement puis à son archivage, en passant par les transmissions interservices.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
                  <Icon className="h-5 w-5 text-blue-600" />
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="etapes" className="border-t border-border bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Comment obtenir un accès
            </h2>
            <p className="mt-3 text-slate-600">
              L&apos;accès à la GED est validé par l&apos;administration. La création d&apos;un compte
              en ligne ne suffit pas : votre profil doit être activé.
            </p>
          </div>

          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="relative rounded-xl border border-border bg-slate-50 p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Appel à l'action */}
      <section className="bg-blue-600 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Vous trabajamos déjà au Ministère ?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-blue-100">
            Créez votre compte et signalez votre service de rattachement. L&apos;administration
            finalisera votre habilitation.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-white text-blue-700 shadow-sm hover:bg-blue-50"
              )}
            >
              Créer mon compte
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-white/60 bg-transparent text-white hover:bg-white/10"
              )}
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* Pied de page */}
      <footer className="border-t border-border bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 p-1">
              <img src="/logo.jpeg" alt="Logo Ministère" className="h-full w-full object-contain" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold text-slate-900">GED Ministère</p>
              <p className="text-xs text-slate-500">Secrétariat Général</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Secrétariat du Ministère — Gestion Électronique de
            Documents
          </p>
        </div>
      </footer>
    </div>
  );
}
