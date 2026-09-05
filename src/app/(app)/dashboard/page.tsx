"use client";

import { useEffect, useState } from "react";
import {
  FolderOpen,
  FileText,
  Users,
  Building2,
  Clock,
  CheckCircle2,
  Archive,
  AlertCircle,
} from "lucide-react";
import { KpiCard } from "@/features/dashboard/kpi-card";
import { DashboardCharts } from "@/features/dashboard/charts";
import { useGED } from "@/components/providers/data-provider";

export default function DashboardPage() {
  //const { getStats, dossiers = [], services = [] } = useGED();
  const { dossiers = [], services = [] } = useGED();
  const [loading, setLoading] = useState(true);

  //const stats = getStats ? getStats() : {
  const stats = {
    totalDossiers: 0,
    totalDocuments: 0,
    totalServices: 0,
    totalUsers: 0,
    pendingDossiers: 0,
    completedDossiers: 0,
    archivedDossiers: 0,
    urgentDossiers: 0,
  };

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  // Calcul dynamique de la répartition des dossiers par service pour le graphique
  const serviceDistributionData = services.map((service) => ({
    name: service.nom || service.code,
    totalDossiers: dossiers.filter((d) => d.idService === service.idService).length,
  }));

  return (
    <div className="space-y-6">
      {/* En-tête de la page */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-500 text-sm mt-1">
          Vue d&apos;ensemble de la Gestion Électronique de Documents (GED)
        </p>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Total Dossiers"
          value={stats.totalDossiers}
          icon={<FolderOpen className="h-4 w-4" />}
          loading={loading}
        />
        <KpiCard
          title="Total Documents"
          value={stats.totalDocuments}
          icon={<FileText className="h-4 w-4" />}
          color="bg-blue-100 text-blue-600"
          loading={loading}
        />
        <KpiCard
          title="Services Rattachés"
          value={stats.totalServices}
          icon={<Building2 className="h-4 w-4" />}
          color="bg-purple-100 text-purple-600"
          loading={loading}
        />
        <KpiCard
          title="Agents / Utilisateurs"
          value={stats.totalUsers}
          icon={<Users className="h-4 w-4" />}
          color="bg-indigo-100 text-indigo-600"
          loading={loading}
        />
        <KpiCard
          title="Dossiers en cours"
          value={stats.pendingDossiers}
          icon={<Clock className="h-4 w-4" />}
          color="bg-amber-100 text-amber-600"
          loading={loading}
        />
        <KpiCard
          title="Dossiers Traités"
          value={stats.completedDossiers}
          icon={<CheckCircle2 className="h-4 w-4" />}
          color="bg-emerald-100 text-emerald-600"
          loading={loading}
        />
        <KpiCard
          title="Dossiers Archivés"
          value={stats.archivedDossiers}
          icon={<Archive className="h-4 w-4" />}
          color="bg-slate-100 text-slate-600"
          loading={loading}
        />
        <KpiCard
          title="Dossiers Urgents"
          value={stats.urgentDossiers}
          icon={<AlertCircle className="h-4 w-4" />}
          color="bg-rose-100 text-rose-600"
          loading={loading}
        />
      </div>

      {/* Composant de Graphiques Visuels 
      <DashboardCharts
        stats={stats}
        serviceData={serviceDistributionData}
      />*/}
    </div>
  );
}