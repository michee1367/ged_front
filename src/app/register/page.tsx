"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, Role } from "@/components/providers/auth-provider";

const schema = z
  .object({
    nom: z.string().min(2, "Le nom est requis"),
    postNom: z.string().optional(),
    prenom: z.string().optional(),
    phoneNumber: z.string().min(8, "Numéro de téléphone invalide"),
    email: z.string().email("Adresse email invalide"),
    motDePasse: z.string().min(4, "Le mot de passe doit contenir au moins 4 caractères"),
    confirmation: z.string(),
  })
  .refine((data) => data.motDePasse === data.confirmation, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmation"],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { registerPublic, login } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nom: "",
      postNom: "",
      prenom: "",
      phoneNumber: "",
      email: "",
      motDePasse: "",
      confirmation: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      // Inscription publique via `/auth/enregistrer` (sans authentification préalable)
      await registerPublic({
        nom: data.nom,
        postNom: data.postNom,
        prenom: data.prenom,
        phoneNumber: data.phoneNumber,
        email: data.email,
        motDePasse: data.motDePasse,
        roles: ["VISIT"] as Role[],
      });
      toast.success("Compte créé avec succès !");

      // Connexion automatique
      await login(data.email, data.motDePasse);
      toast.success("Connexion réussie !");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la création du compte");
      console.error("Erreur d'inscription GED :", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-30 w-50 items-center justify-center rounded-2xl bg-blue-600 p-2.5 mb-4 shadow-lg">
            <img
              src="/logo.jpeg"
              alt="Logo Ministère"
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Secrétariat du Ministère</h1>
          <p className="text-slate-500 text-sm mt-1">Création de compte — GED</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Créer un compte</CardTitle>
            <CardDescription>Inscrivez-vous pour accéder à l&apos;espace documentaire</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom *</Label>
                  <Input id="nom" placeholder="Ex: Mukendi" {...register("nom")} />
                  {errors.nom && <p className="text-xs text-red-500">{errors.nom.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postNom">Post Nom</Label>
                  <Input id="postNom" placeholder="Ex: Kalala" {...register("postNom")} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input id="prenom" placeholder="Ex: Jean" {...register("prenom")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Numéro de téléphone *</Label>
                  <Input id="phoneNumber" type="tel" placeholder="+243 81 000 0000" {...register("phoneNumber")} />
                  {errors.phoneNumber && <p className="text-xs text-red-500">{errors.phoneNumber.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Adresse Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre.email@ministere.cd"
                  {...register("email")}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="motDePasse">Mot de passe *</Label>
                  <div className="relative">
                    <Input
                      id="motDePasse"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("motDePasse")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.motDePasse && <p className="text-xs text-red-500">{errors.motDePasse.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmation">Confirmer le mot de passe *</Label>
                  <div className="relative">
                    <Input
                      id="confirmation"
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("confirmation")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmation && <p className="text-xs text-red-500">{errors.confirmation.message}</p>}
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Créer mon compte
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Déjà un compte ?{" "}
              <Link href="/login" className="text-blue-600 font-medium hover:underline">
                Se connecter
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}