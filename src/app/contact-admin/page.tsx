"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, LogOut, Mail, MapPin, Phone, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";

const ADMIN_EMAIL = "secretariat.general@ministere.cd";
const ADMIN_PHONE = "+243 81 000 0000";

export default function ContactAdminPage() {
  const { user, isLoading, accessLevel, logout } = useAuth();
  const router = useRouter();

  // Garde inverse : cette page n'est destinée qu'aux comptes `VISIT`.
  useEffect(() => {
    if (isLoading) return;
    if (accessLevel === "ANONYME") router.replace("/login");
    else if (accessLevel === "AUTORISE") router.replace("/dashboard");
  }, [accessLevel, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const fullName = [user?.prenom, user?.nom, user?.postNom].filter(Boolean).join(" ").trim();
  const serviceLabel = user?.service?.nom ?? null;

  if (isLoading || accessLevel !== "VISITEUR") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-slate-500">Vérification de la session…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 p-2.5 mb-4 shadow-lg">
            <img
              src="/logo.jpeg"
              alt="Logo Ministère"
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Secrétariat du Ministère</h1>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <Clock className="h-6 w-6 text-amber-700" />
            </div>
            <CardTitle>Votre compte est en attente de validation</CardTitle>
            <CardDescription>
              Votre demande a bien été enregistrée, mais votre accès à la GED n&apos;est pas encore
              activé.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="rounded-lg border border-border bg-slate-50 p-4 text-sm text-slate-600">
              <p>
                Un administrateur doit vous attribuer un rôle et, le cas échéant, vous rattacher à un
                service. Tant que cette validation n&apos;est pas faite, les dossiers, documents et
                tableaux de bord du Ministère restent inaccessibles.
              </p>
            </div>

            {(fullName || serviceLabel || user?.email || user?.phoneNumber) && (
              <div className="rounded-lg border border-border p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Votre demande
                </p>
                <dl className="space-y-2 text-sm">
                  {fullName && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Nom complet</dt>
                      <dd className="text-right font-medium text-slate-900">{fullName}</dd>
                    </div>
                  )}
                  {user?.email && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Email</dt>
                      <dd className="text-right font-medium text-slate-900">{user.email}</dd>
                    </div>
                  )}
                  {user?.phoneNumber && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Téléphone</dt>
                      <dd className="text-right font-medium text-slate-900">{user.phoneNumber}</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Service demandé</dt>
                    <dd className="text-right font-medium text-slate-900">
                      {serviceLabel ?? "Non précisé"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Statut</dt>
                    <dd className="text-right font-medium text-amber-700">En attente de validation</dd>
                  </div>
                </dl>
              </div>
            )}

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Contactez l&apos;administration
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-3 text-slate-700">
                  <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                  <a href={`mailto:${ADMIN_EMAIL}`} className="text-blue-600 hover:underline">
                    {ADMIN_EMAIL}
                  </a>
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                  <a href={`tel:${ADMIN_PHONE.replace(/\s/g, "")}`} className="text-blue-600 hover:underline">
                    {ADMIN_PHONE}
                  </a>
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                  <span>Secrétariat Général du Ministère</span>
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-slate-400" />
                  <span>La validation est effectuée par un administrateur du Ministère.</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Se déconnecter
              </Button>
              <Link
                href="/"
                className="inline-flex h-10 flex-1 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-slate-100"
              >
                Retour à l&apos;accueil
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
