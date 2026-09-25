# AGENTS.md — Mémo projet GED (frontend)

Ce fichier sert de mémoire de contexte. Référez-vous-y avant toute modification.

## Vue d'ensemble

Frontend de la **GED (Gestion Électronique de Documents)** du « Secrétariat du Ministère ».
Monorepo : `C:\Users\PC\Documents\ged_ministere` (front ici, backend Spring Boot séparé).
Backend : API REST Spring Boot sur `http://localhost:8182/api/v1` (voir `.env`).
Doc OpenAPI : `http://localhost:8182/api/v1/v3/api-docs`.

## Stack

- Next.js 16.2 (App Router, Turbopack) + React 19 + TypeScript
- Tailwind CSS v4 + composants shadcn/ui (`src/components/ui`)
- `@tanstack/react-table`, `react-hook-form` + `zod`, `recharts`, `sonner`, `lucide-react`, `date-fns`

## Commandes

```bash
npm run dev       # serveur de dev (hostname 0.0.0.0)
npm run build     # build production
npm run start     # serveur de prod
npm run lint      # eslint
npx tsc --noEmit  # typecheck
```

## Architecture

- `src/app/layout.tsx` : `AuthProvider` → `GEDProvider` → `Toaster` (sonner, `top-right` richColors).
- **Auth** (`src/components/providers/auth-provider.tsx`) : gère login/register/logout, JWT dans `localStorage` (`jwt_token`), profil dans `auth_user`.
  - `login(username, password)` → `POST /auth/login` (body `{username, password}`).
  - `register(data)` → `POST /utilisateurs` **avec token** (réservé admin).
  - `registerPublic(data)` → `POST /auth/enregistrer` **sans token** (inscription publique, utilisée par `/register`). Rôles possibles : `MINISTRE | CABINET | SECRETAIRE_GENERAL | DIRECTEUR | CHEF_DIVISION | CHEF_BUREAU | SECRETAIRE_BUREAU | AGENT | ADMINISTRATEUR | VISIT`.
- **Données GED** (`src/components/providers/data-provider.tsx`) : expose `dossiers`, `utilisateurs`, `services` + toutes les actions API (CRUD dossiers/services/utilisateurs, transmission, réponse, commentaire, historique, documents upload/download, `getKpis`). Bloque le rendu tant que `isReady` est false.
- **Routes** :
  - Publiques : `/` (login, = `src/app/page.tsx`), `/login`, `/register` (inscription publique).
  - Authentifiées (groupe `(app)` avec `AppShell` = Sidebar + Header) : `/dashboard`, `/dossiers`, `/dossiers/[id]`, `/admin/utilisateurs`, `/admin/services`.
- Header : logo utilisateur « U » fixe (`https://ui-avatars.com/api/?name=U&background=2563EB&color=fff&size=128`), fallback `AvatarFallback = "U"`.

## Points clés / conventions

- Toutes les requêtes API passent par fetch, header `Authorization: Bearer <jwt_token>`.
- **Décision récente** : `register` (admin) et `registerPublic` (public) sont **deux méthodes distinctes** — ne pas fusionner.
- La page `/register` crée un compte avec `roles: ["VISIT"]`, puis auto-login et redirection `/dashboard`.
- `.env` (gitignoré) contient `NEXT_PUBLIC_API_URL = http://localhost:8182/api/v1` (+ `NEXT_PUBLIC_API_ADMIN_URL`, `NEXT_PUBLIC_API_PUBLIC_URL`).
- Pagination API : `?page=1&per_page=100` ; les listes sont dans `data.content`.

## Dette technique / attention

- **Code mort à ne pas utiliser** (reliquats d'un projet de retraites) : `auth-provider-local.tsx`, `data-provider-local.tsx`, `data-provider-api.tsx`, `services/api.ts`, `services/local-db.ts`, `services/stats-service.ts`, `mock-data/`, `types/index.ts`, `features/dashboard/charts.tsx`. Seuls `auth-provider.tsx` et `data-provider.tsx` sont réellement importés par `layout.tsx`.
- **Pas de protection de route** : les pages `(app)` sont accessibles sans auth.
- `dossiers/page.tsx` contient des handlers no-op commentés, types `any`, et utilise `alert()/confirm()` au lieu de `toast`.
- Éditeur WYSIWYG de `dossiers/[id]/page.tsx` : `document.execCommand()` (déprécié), `contentEditable`.
- `tsconfig.tsbuildinfo` est généré mais **non gitignoré** (ajouter à `.gitignore` si besoin).
- Liens morts : cloche → `/notifications` (inexistant), « Paramètres » → `/parametres` (inexistant), recherche → `/dossiers?q=` (le paramètre n'est pas lu).
- Lint : erreurs préexistantes (`` ` `` non échappées, `any`, `setState` dans `useEffect`) — ne pas aggraver, ne pas nécessairement tout corriger.