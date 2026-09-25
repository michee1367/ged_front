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
import { useGED, KpisDashboard } from "@/components/providers/data-provider";

const emptyKpis: KpisDashboard = {
  totalDossiers: 0,
  totalDocuments: 0,
  totalServicesRattaches: 0,
  totalUtilisateurs: 0,
  totalDossiersEncours: 0,
  totalDossiersTraites: 0,
  totalDossiersArchivees: 0,
  totalDossiersUrgents: 0,
};

export default function DashboardPage() {
  const { getKpis } = useGED();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<KpisDashboard>(emptyKpis);

  useEffect(() => {
    let cancelled = false;

    async function loadKpis() {
      try {
        const data = await getKpis();
        if (!cancelled) setStats(data);
      } catch (error) {
        console.error("Erreur de récupération des KPI :", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadKpis();
    const t = setTimeout(() => setLoading(false), 800);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [getKpis]);

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
          value={stats.totalServicesRattaches}
          icon={<Building2 className="h-4 w-4" />}
          color="bg-purple-100 text-purple-600"
          loading={loading}
        />
        <KpiCard
          title="Agents / Utilisateurs"
          value={stats.totalUtilisateurs}
          icon={<Users className="h-4 w-4" />}
          color="bg-indigo-100 text-indigo-600"
          loading={loading}
        />
        <KpiCard
          title="Dossiers en cours"
          value={stats.totalDossiersEncours}
          icon={<Clock className="h-4 w-4" />}
          color="bg-amber-100 text-amber-600"
          loading={loading}
        />
        <KpiCard
          title="Dossiers Traités"
          value={stats.totalDossiersTraites}
          icon={<CheckCircle2 className="h-4 w-4" />}
          color="bg-emerald-100 text-emerald-600"
          loading={loading}
        />
        <KpiCard
          title="Dossiers Archivés"
          value={stats.totalDossiersArchivees}
          icon={<Archive className="h-4 w-4" />}
          color="bg-slate-100 text-slate-600"
          loading={loading}
        />
        <KpiCard
          title="Dossiers Urgents"
          value={stats.totalDossiersUrgents}
          icon={<AlertCircle className="h-4 w-4" />}
          color="bg-rose-100 text-rose-600"
          loading={loading}
        />
      </div>
    </div>
  );
}