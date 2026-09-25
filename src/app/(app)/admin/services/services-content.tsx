"use client";

import { useState } from "react";
import { Building2, Building, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGED, ServiceModel } from "@/components/providers/data-provider";

export default function ServicesContent() {
  const { services, utilisateurs, creerService, modifierService, loadServicesAndUtilisateurs } = useGED();
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);

  const [nomService, setNomService] = useState("");
  const [codeService, setCodeService] = useState("");

  // Édition d'un service existant
  const [editingService, setEditingService] = useState<ServiceModel | null>(null);
  const [editNom, setEditNom] = useState("");
  const [editCode, setEditCode] = useState("");

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomService || !codeService) return;
    try {
      const service = await creerService({ nom: nomService, code: codeService });
      await loadServicesAndUtilisateurs(1, 100);
      alert(`Service "${service.nom || nomService}" (${service.code || codeService}) créé avec succès !`);
      setNomService("");
      setCodeService("");
      setShowAddServiceModal(false);
    } catch {
      alert("Échec de la création du service");
    }
  };

  const openEditModal = (s: ServiceModel) => {
    setEditingService(s);
    setEditNom(s.nom || "");
    setEditCode(s.code || "");
  };

  const handleEditService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editingService.idService) return;
    try {
      await modifierService(editingService.idService, { nom: editNom, code: editCode });
      await loadServicesAndUtilisateurs(1, 100);
      alert(`Service "${editNom}" modifié avec succès !`);
      setEditingService(null);
    } catch {
      alert("Échec de la modification du service");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Répertoire des Services</h1>
          <p className="text-slate-500 text-sm mt-1">
            Gérez l&apos;arborescence des départements et la répartition des effectifs.
          </p>
        </div>

        <Button
          variant="outline"
          className="flex items-center gap-2 text-xs font-semibold h-9"
          onClick={() => setShowAddServiceModal(!showAddServiceModal)}
        >
          <Building className="h-4 w-4 text-slate-600" /> Ajouter un Service
        </Button>
      </div>

      <Card className="bg-emerald-50/50 border-emerald-100 max-w-xs">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-600 uppercase">Services Actifs</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{services.length}</p>
          </div>
          <Building2 className="h-8 w-8 text-emerald-500/40" />
        </CardContent>
      </Card>

      {showAddServiceModal && (
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-emerald-900 flex justify-between items-center">
              Nouveau Service
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowAddServiceModal(false)}>
                <XCircle className="h-4 w-4 text-slate-400" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateService} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input placeholder="Nom du service" value={nomService} onChange={(e) => setNomService(e.target.value)} required className="h-8 text-xs bg-white" />
              <Input placeholder="Code (ex: DRH)" value={codeService} onChange={(e) => setCodeService(e.target.value)} required className="h-8 text-xs bg-white" />
              <Button type="submit" size="sm" className="h-8 text-xs bg-emerald-600 text-white">Ajouter le service</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {editingService && (
        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-amber-900 flex justify-between items-center">
              Modifier le service {editNom}
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingService(null)}>
                <XCircle className="h-4 w-4 text-slate-400" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEditService} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input placeholder="Nom du service" value={editNom} onChange={(e) => setEditNom(e.target.value)} required className="h-8 text-xs bg-white" />
              <Input placeholder="Code (ex: DRH)" value={editCode} onChange={(e) => setEditCode(e.target.value)} required className="h-8 text-xs bg-white" />
              <Button type="submit" size="sm" className="h-8 text-xs bg-amber-600 text-white">Enregistrer</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((serv) => {
          const countAgents = utilisateurs.filter((u) => u.service?.idService === serv.idService).length;
          return (
            <Card key={serv.idService} className="hover:border-blue-200 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {serv.code || `SERV-${serv.idService}`}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {countAgents} membre(s)
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold text-slate-900 mt-2">
                  {serv.nom}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-500 min-h-[36px]">
                  {serv.code || "Aucune description enregistrée pour ce département."}
                </p>
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[11px] text-slate-400">ID: #{serv.idService}</span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600" onClick={() => openEditModal(serv)}>
                    Gérer le service
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}