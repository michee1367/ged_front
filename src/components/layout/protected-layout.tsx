"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useGED } from "@/components/providers/data-provider";
import { AppShell } from "./app-shell";

function SessionGate() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm text-slate-500">Vérification de la session…</p>
    </div>
  );
}

/**
 * Garde le groupe `(app)` :
 *  - session absente ou expirée  → `/login`
 *  - rôle `VISIT`                → `/contact-admin` (aucun accès à la GED)
 *  - sinon                       → `AppShell`
 *
 * Le niveau `VISIT` est déjà bloqué côté API par `NonVisiteurAuthorizationManager`
 * (toute requête hors `/auth/**` et `GET /services` renvoie 403).
 */
export function ProtectedLayout({ children }: { children: ReactNode }) {
  const { isLoading, accessLevel } = useAuth();
  const { isReady } = useGED();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (accessLevel === "ANONYME") {
      router.replace("/login");
    } else if (accessLevel === "VISITEUR") {
      router.replace("/contact-admin");
    }
  }, [accessLevel, isLoading, router]);

  if (isLoading || !isReady || accessLevel === "ANONYME" || accessLevel === "VISITEUR") {
    return <SessionGate />;
  }

  return <AppShell>{children}</AppShell>;
}
