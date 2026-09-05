"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useGED, Priorite, PIORITIES_LABELS, EnregistrerDossierCommand } from "@/components/providers/data-provider";
import { 
  Plus, 
  Trash2, 
  FolderOpen, 
  X, 
  FileText, 
  Building2,
  MoveHorizontal,
  Clock,
  CheckCircle2,
  AlertCircle,
  Archive
} from "lucide-react";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "danger" }> = {
  RECU: { label: "Reçu", variant: "warning" },
  EN_TRAITEMENT: { label: "En cours", variant: "warning" },
  EN_ATTENTE: { label: "En attente", variant: "danger" },
  TRAITE: { label: "Traité", variant: "success" },
  CLOTURE: { label: "Cloturé", variant: "secondary" },
};

export default function DossiersPage() {
  const router = useRouter();
  const todayFormatted = new Date().toISOString().split("T")[0];
  const { 
    dossiers = [], 
    services = [], 
    utilisateurs = [], 
    creerDossier,
    loadServicesAndUtilisateurs,
    deleteDossier, 
    addDossier,
    updateDossier 
  } = useGED();

  // États locaux
  const [selectedDossier, setSelectedDossier] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  // Formulaire nouveau dossier
  const [newTitle, setNewTitle] = useState("");
  const [newReference, setNewReference] = useState("");
  const [newServiceId, setNewServiceId] = useState("");
  const [newExpediteurId, setNewExpediteurId] = useState(undefined);
  const [newPriority, setNewPriority] = useState<Priorite>("NORMALE");
  const [newEcheance, setNewEcheance] = useState<string>(todayFormatted);

  const handleAddDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newReference.trim()) return;

    const dossierData : EnregistrerDossierCommand = {
      objet: newTitle,
      expediteurOrigineId: newExpediteurId,
      echeance:newEcheance,
      priorite: newPriority || "NORMALE"
    };

    if (creerDossier) {
      try {
        await creerDossier(dossierData);
        await loadServicesAndUtilisateurs(1, 100)
        alert(`Dossier ${dossierData.objet} créé avec succès !`);
      } catch (error) {
          alert(`Echec !`);
          console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
          console.log(error)
          console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")        
      }
    } 

    setNewTitle("");
    setNewReference("");
    setNewServiceId("");
    setNewExpediteurId(undefined);
    setNewPriority("NORMALE");
    setIsAddModalOpen(false);
  };

  const handleDeleteDossier = (dossierId: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (confirm("Êtes-vous sûr de vouloir supprimer ce dossier ?")) {
      if (deleteDossier) deleteDossier(dossierId);
    }
  };

  const handleUpdateStatus = (dossierId: string, newStatus: string) => {
    if (updateDossier) {
      updateDossier(dossierId, { status: newStatus });
      if (selectedDossier) {
        setSelectedDossier({ ...selectedDossier, status: newStatus });
      }
    }
  };

  const handleTransferService = (dossierId: string, targetServiceId: string) => {
    if (updateDossier && targetServiceId) {
      updateDossier(dossierId, { serviceId: targetServiceId });
      setIsTransferring(false);
      setSelectedDossier(null);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des Dossiers</h1>
          <p className="text-slate-500 text-sm mt-1">
            {dossiers.length} dossiers au total · {services.length} services rattaches
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 self-start bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Nouveau dossier
        </Button>
      </div>

      {/* Grille des dossiers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {dossiers.map((dossier: any) => {
          const service = services.find((s: any) => s.id === dossier.serviceId);
          const config = statusConfig[dossier.statutActuel] || { label: dossier.statutActuel, variant: "outline" };

          return (
            <Card 
              key={dossier.idDossier} 
              className="hover:shadow-md transition-all cursor-pointer border hover:border-blue-400 group relative"
              //onClick={() => setSelectedDossier({ ...dossier, service })}
              onClick={() => router.push(`/dossiers/${dossier.idDossier}`)}
            >
              <CardHeader className="pb-3 pr-10">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {dossier.reference || dossier.numeroDossier}
                  </span>
                  <Badge variant={config.variant}>{config.label}</Badge>
                </div>
                <CardTitle className="text-base font-semibold text-slate-900 line-clamp-1 mt-2">
                  {dossier.title || dossier.objet}
                </CardTitle>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <Building2 className="h-3 w-3" /> {service?.nom || service?.code || "Non assigné"}
                </p>
              </CardHeader>
              
              {/* Bouton supprimer au survol */}
              <button
                onClick={(e) => handleDeleteDossier(dossier.id, e)}
                className="absolute top-4 right-3 p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Supprimer le dossier"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <CardContent>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-slate-400" /> 
                    {dossier.documentsCount || dossier.documents?.length || 0} document(s)
                  </span>
                  <span className="text-blue-600 font-medium group-hover:underline">Consulter</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* MODAL 1 : CREER UN DOSSIER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-lg text-slate-900">Nouveau Dossier</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddDossier} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Référence / Numéro d&apos;enregistrement</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: DOS-2026-001"
                  value={newReference}
                  onChange={(e) => setNewReference(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Intitulé du dossier</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Demande d'Agrément - Direction A"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Expéditeur</label>
                <select
                  value={newExpediteurId}
                  onChange={(e) => setNewExpediteurId(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">-- Sélectionner un expediteur --</option>
                  {utilisateurs.map((s: any) => (
                    <option key={s.idUtilisateur} value={s.idUtilisateur}>{s.nom + " " + s.postNom + " " + s.prenom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Niveau de priorité</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as "normale" | "urgente")}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {
                    (Object.keys(PIORITIES_LABELS) as Priorite[]).map((p) => (
                      <option key={p} value={p}>{PIORITIES_LABELS[p]}</option>
                    ))
                    
                  }
                </select>
              </div>{/* Échéance compatible Spring Boot LocalDate */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date d&apos;échéance
                </label>
                <input
                  type="date"
                  required
                  min={todayFormatted} // Bloque la sélection de dates passées
                  value={newEcheance}
                  onChange={(e) => setNewEcheance(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                
                {/* Raccourcis pratiques pour régler rapidement la date */}
                <div className="flex gap-1.5 mt-2">
                      {[
                        { label: "+24h", days: 1 },
                        { label: "+48h", days: 2 },
                        { label: "+3j", days: 3 },
                        { label: "+7j", days: 7 },
                        { label: "+1m", days: 30 },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            const targetDate = new Date();
                            targetDate.setDate(targetDate.getDate() + item.days);
                            setNewEcheance(targetDate.toISOString().split("T")[0]);
                          }}
                          className="text-[10px] bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 border border-slate-200 px-2 py-0.5 rounded transition-colors"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Annuler</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Créer le dossier</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2 : DETAILS DU DOSSIER */}
      {selectedDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between border-l-4 border-l-blue-600">
              <div>
                <span className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {selectedDossier.reference || selectedDossier.code}
                </span>
                <h3 className="font-bold text-lg text-slate-900 mt-1">{selectedDossier.title || selectedDossier.nom}</h3>
              </div>
              <button onClick={() => { setSelectedDossier(null); setIsTransferring(false); }} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between text-sm bg-slate-50 p-3 rounded-lg">
                <span className="text-slate-500 flex items-center gap-1.5"><Building2 className="h-4 w-4" /> Service Assigné</span>
                <span className="font-semibold text-slate-900">{selectedDossier.service?.nom || "Non défini"}</span>
              </div>

              {/* Modification du Statut */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Changer le statut :</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={selectedDossier.status === "en_cours" ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => handleUpdateStatus(selectedDossier.id, "en_cours")}
                    className="justify-start gap-2"
                  >
                    <Clock className="h-3.5 w-3.5" /> En cours
                  </Button>
                  <Button 
                    variant={selectedDossier.status === "traite" ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => handleUpdateStatus(selectedDossier.id, "traite")}
                    className="justify-start gap-2 text-emerald-600"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Traité
                  </Button>
                  <Button 
                    variant={selectedDossier.status === "urgent" ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => handleUpdateStatus(selectedDossier.id, "urgent")}
                    className="justify-start gap-2 text-rose-600"
                  >
                    <AlertCircle className="h-3.5 w-3.5" /> Urgent
                  </Button>
                  <Button 
                    variant={selectedDossier.status === "archive" ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => handleUpdateStatus(selectedDossier.id, "archive")}
                    className="justify-start gap-2"
                  >
                    <Archive className="h-3.5 w-3.5" /> Archivé
                  </Button>
                </div>
              </div>

              {/* Transfert vers un autre service */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTransferring(!isTransferring)}
                  className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
                >
                  <MoveHorizontal className="h-3.5 w-3.5" />
                  {isTransferring ? "Annuler le transfert" : "Transférer à un autre service"}
                </button>

                {isTransferring && (
                  <div className="mt-2 p-3 bg-slate-50 rounded-md border border-slate-200 space-y-2">
                    <label className="block text-xs font-medium text-slate-700">Choisir le service cible :</label>
                    <select
                      defaultValue=""
                      onChange={(e) => handleTransferService(selectedDossier.id, e.target.value)}
                      className="w-full h-8 px-2 rounded border border-slate-300 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                    >
                      <option value="" disabled>-- Sélectionner --</option>
                      {services.filter((s: any) => s.id !== selectedDossier.serviceId).map((s: any) => (
                        <option key={s.id} value={s.id}>{s.nom || s.code}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button onClick={() => { setSelectedDossier(null); setIsTransferring(false); }} className="w-full sm:w-auto">
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}