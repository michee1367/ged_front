"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  FileText, 
  Building2, 
  Calendar, 
  Send, 
  Paperclip, 
  Download, 
  MessageSquare, 
  Clock, 
  UserCheck,
  History,
  MessageCircle,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight, 
  FolderOpen, 
  X, 
  Link2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  useGED, 
  ReponseDossier, 
  ReponseReponse,
  ReponseDocument, 
  HistoriqueTransmissionModel,
  ModifierDossierCommand,
  Priorite,
  StatutDossier
} from "@/components/providers/data-provider";

interface CommentaireItem {
  id?: number;
  auteur?: string;
  date?: string;
  contenu?: string;
}

export default function DossierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const dossierId = Number(id);
  const todayFormatted = new Date().toISOString().split("T")[0];

  const {
    getDossierById,
    repondreDossier,
    transmettreDossier,
    commenterDossier,
    modifierDossier,
    getHistoriqueDossier,
    getDocumentsDossier,
    getReponse,
    getCommentaires,
    joindreDocument,
    telechargerDocument,
    services,
    utilisateurs
  } = useGED();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [dossier, setDossier] = useState<ReponseDossier | null>(null);
  const [documents, setDocuments] = useState<ReponseDocument[]>([]);
  const [historiques, setHistoriques] = useState<HistoriqueTransmissionModel[]>([]);
  const [commentaires, setCommentaires] = useState<CommentaireItem[]>([]);
  const [reponse, setReponse] = useState<ReponseReponse>({});
  const [loading, setLoading] = useState(true);

  // Formulaires locaux
  const [nouveauCommentaire, setNouveauCommentaire] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<number | "">("");
  const [selectedAgentId, setSelectedAgentId] = useState<number | "">("");
  const [observationTransmission, setObservationTransmission] = useState("");
  // Formulaire modification
    const [newTitle, setNewTitle] = useState("");
    const [newStatut, setNewStatut] = useState<StatutDossier>("RECU");
    const [newPriority, setNewPriority] = useState<Priorite>("NORMALE");
    const [newEcheance, setNewEcheance] = useState<string>(todayFormatted);

  
  // Upload document
  const [titreDoc, setTitreDoc] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Éditeur WYSIWYG
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [dData, docsData, histData, res, commets] = await Promise.all([
          getDossierById(dossierId),
          getDocumentsDossier(dossierId),
          getHistoriqueDossier(dossierId),
          getReponse(dossierId),
          getCommentaires(dossierId)
        ]);
        setDossier(dData);
        setDocuments(docsData);
        setHistoriques(histData);
        setCommentaires(commets.map(v => {return {
          id: v.idCommentaire,
          auteur: "",
          date: "",
          contenu: v.contenu
        }}));
        setReponse(res);
        if (editorRef.current) editorRef.current.innerHTML = res.contenu || ""
      } catch (err) {
        console.error("Erreur de chargement du dossier", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [dossierId, getDossierById, getDocumentsDossier, getHistoriqueDossier, getReponse, getCommentaires]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Dossier introuvable</p>
        <Link href="/dossiers"><Button className="mt-4">Retour à la liste</Button></Link>
      </div>
    );
  }

  // Application des commandes de mise en forme (type Rich Text Email)
  const execCommand = (command: string, value: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, value);
    
  };
  
  // Action : Envoyer la réponse officielle avec la mise en forme HTML
  const handleSetModifModal = async (isShow:boolean) => {

    if (!dossier) return
    setNewTitle(dossier.objet || "")
    setNewStatut(dossier.statutActuel || 'EN_TRAITEMENT')
    setNewPriority(dossier.priorite || 'NORMALE')
    setNewEcheance(dossier.echeance || "")

    setIsAddModalOpen(isShow)
  };
  // handleModifDossier
  const handleModifDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const dossierData : ModifierDossierCommand = {
        objet: newTitle,
        status: newStatut,
        echeance:newEcheance,
        priorite: newPriority || "NORMALE"
      };
      const updated = await modifierDossier(dossierId, dossierData)
      setDossier(updated);
      alert("Réponse enregistrée avec succès !");
      await handleSetModifModal(false)
    } catch (error) {
      alert("Échec de l'envoi de la réponse");
      
    }
    
  }

  // Action : Envoyer la réponse officielle avec la mise en forme HTML
  const handleSoumettreReponse = async (e: React.FormEvent) => {
    e.preventDefault();
    const htmlContent = editorRef.current?.innerHTML || "";
    if (!htmlContent.trim() || htmlContent === "<br>") return;

    try {
      const updated = await repondreDossier(dossierId, htmlContent);
      setDossier(updated);
      //if (editorRef.current) editorRef.current.innerHTML = "";
      alert("Réponse enregistrée avec succès !");
    } catch (err) {
      alert("Échec de l'envoi de la réponse");
    }
  };

  // Action : Transmettre le dossier
  const handleTransmettre = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await transmettreDossier(dossierId, {
        idDossier: dossierId,
        idServiceDestinataire: selectedServiceId ? Number(selectedServiceId) : undefined,
        idDestinateur: selectedAgentId ? Number(selectedAgentId) : undefined,
        observation: observationTransmission
      });
      setDossier(updated);
      setObservationTransmission("");
      const updatedHist = await getHistoriqueDossier(dossierId);
      setHistoriques(updatedHist);
      alert("Dossier transmis avec succès !");
    } catch (err) {
      alert("Erreur lors de la transmission");
    }
  };

  // Action : Ajouter un commentaire
  const handleAjouterCommentaire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouveauCommentaire.trim()) return;
    try {
      await commenterDossier(dossierId, nouveauCommentaire);
      
      const newComment: CommentaireItem = {
        id: Date.now(),
        auteur: "Vous",
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        contenu: nouveauCommentaire
      };
      setCommentaires((prev) => [newComment, ...prev]);
      setNouveauCommentaire("");
      
      const updatedHist = await getHistoriqueDossier(dossierId);
      setHistoriques(updatedHist);
    } catch (err) {
      alert("Erreur d'ajout de commentaire");
    }
  };

  // Action : Upload document
  const handleJoindreDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !titreDoc) return;
    try {
      await joindreDocument(dossierId, titreDoc, selectedFile);
      setTitreDoc("");
      setSelectedFile(null);
      const updatedDocs = await getDocumentsDossier(dossierId);
      setDocuments(updatedDocs);
      alert("Document joint avec succès !");
    } catch (err) {
      alert("Erreur de téléversement du document");
    }
  };

  // Action : Download document
  const handleDownload = async (docId: number, fileName?: string) => {
    try {
      const blob = await telechargerDocument(docId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || `document-${docId}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert("Erreur lors du téléchargement");
    }
  };


  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* En-tête du Dossier */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <Link href="/dossiers">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {dossier.numeroDossier || `DOS-${dossier.idDossier}`}
              </span>
              <Badge variant={dossier.statutActuel === "TRAITE" ? "success" : "warning"}>
                {dossier.statutActuel || "EN_COURS"}
              </Badge>
              {dossier.priorite && (
                <Badge variant={dossier.priorite === "URGENTE" ? "danger" : "outline"}>
                  {dossier.priorite}
                </Badge>
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">{dossier.objet}</h1>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-slate-400" />
            <span>Service : <strong>{dossier.nomService || "Non assigné"}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <UserCheck className="h-4 w-4 text-slate-400" />
            <span>Agent : <strong>{dossier.nomsAgent || "Non assigné"}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>Échéance : <strong>{dossier.echeance || "N/A"}</strong></span>
          </div>
        </div>
      </div>

      {/* Disposition sur 2 Colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLONNE GAUCHE (7/12) : Réponse Formatée & Transmission */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Formulaire de Réponse façon Client Email */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" /> Rédaction de la Réponse Officielle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSoumettreReponse} className="space-y-3">
                {/* Barre d'outils d'édition type Email */}
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 text-slate-700">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => execCommand("bold")}
                      title="Gras"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => execCommand("italic")}
                      title="Italique"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => execCommand("underline")}
                      title="Souligné"
                    >
                      <Underline className="h-4 w-4" />
                    </Button>

                    <div className="h-4 w-[1px] bg-slate-300 mx-1" />

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => execCommand("insertUnorderedList")}
                      title="Puces"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => execCommand("insertOrderedList")}
                      title="Numérotation"
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>

                    <div className="h-4 w-[1px] bg-slate-300 mx-1" />

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => execCommand("justifyLeft")}
                      title="Aligner à gauche"
                    >
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => execCommand("justifyCenter")}
                      title="Centrer"
                    >
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => execCommand("justifyRight")}
                      title="Aligner à droite"
                    >
                      <AlignRight className="h-4 w-4" />
                    </Button>

                    <div className="h-4 w-[1px] bg-slate-300 mx-1" />

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        const url = prompt("Saisissez l'URL du lien :");
                        if (url) execCommand("createLink", url);
                      }}
                      title="Insérer un lien"
                    >
                      <Link2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Zone d'édition de contenu HTML */}
                  <div
                    ref={editorRef}
                    contentEditable
                    className="min-h-[220px] p-3 text-sm focus:outline-none focus:ring-0 font-sans leading-relaxed text-slate-800"
                    placeholder="Saisissez votre réponse officielle ici..."
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 gap-2">
                    <Send className="h-4 w-4" /> Envoyer la réponse
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Formulaire de Transmission */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" /> Transmettre à un autre département
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTransmettre} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Service destinataire</label>
                    <select
                      value={selectedServiceId}
                      onChange={(e) => setSelectedServiceId(e.target.value ? Number(e.target.value) : "")}
                      className="w-full h-9 px-2 rounded-md border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">-- Choisir un service --</option>
                      {services.map((s) => (
                        <option key={s.idService} value={s.idService}>{s.nom || s.code}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Agent destinataire</label>
                    <select
                      value={selectedAgentId}
                      onChange={(e) => setSelectedAgentId(e.target.value ? Number(e.target.value) : "")}
                      className="w-full h-9 px-2 rounded-md border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">-- Choisir un agent --</option>
                      {utilisateurs.map((u) => (
                        <option key={u.idUtilisateur} value={u.idUtilisateur}>
                          {u.nom} {u.prenom}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Observation / Instruction</label>
                  <input
                    type="text"
                    value={observationTransmission}
                    onChange={(e) => setObservationTransmission(e.target.value)}
                    placeholder="Instructions pour le destinataire..."
                    className="w-full h-9 px-3 rounded-md border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" variant="outline" size="sm">
                    Confirmer le transfert
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* COLONNE DROITE (5/12) : Documents, Notes & Historique */}
        <div className="lg:col-span-5 space-y-6">
          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="grid w-full grid-cols-3 text-xs">
              <TabsTrigger value="documents" className="flex items-center gap-1.5 px-2 py-1.5">
                <Paperclip className="h-3.5 w-3.5" /> Docs ({documents.length})
              </TabsTrigger>
              <TabsTrigger value="commentaires" className="flex items-center gap-1.5 px-2 py-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> Notes ({commentaires.length})
              </TabsTrigger>
              <TabsTrigger value="historique" className="flex items-center gap-1.5 px-2 py-1.5">
                <History className="h-3.5 w-3.5" /> Historique ({historiques.length})
              </TabsTrigger>
            </TabsList>

            {/* TAB 1 : DOCUMENTS */}
            <TabsContent value="documents" className="mt-4 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Joindre un document</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleJoindreDoc} className="space-y-3">
                    <input
                      type="text"
                      required
                      placeholder="Intitulé du document..."
                      value={titreDoc}
                      onChange={(e) => setTitreDoc(e.target.value)}
                      className="w-full h-8 px-3 rounded border border-slate-200 text-xs focus:ring-1 focus:ring-blue-600"
                    />
                    <input
                      type="file"
                      required
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <Button type="submit" size="sm" className="w-full bg-slate-900 text-white hover:bg-slate-800">
                      Téléverser le fichier
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-2">
                {documents.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Aucun document joint</p>
                ) : (
                  documents.map((doc) => (
                    <div
                      key={doc.idDocument}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 text-xs hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center gap-2 overflow-hidden pr-2">
                        <Paperclip className="h-4 w-4 text-blue-600 shrink-0" />
                        <div className="truncate">
                          <p className="font-medium text-slate-800 truncate">{doc.nomFichier || "Document sans nom"}</p>
                          <p className="text-[10px] text-slate-400">{doc.dateAjout || "Date inconnue"}</p>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDownload(doc.idDocument!, doc.nomFichier)}
                        title="Télécharger"
                      >
                        <Download className="h-4 w-4 text-slate-600" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* TAB 2 : COMMENTAIRES */}
            <TabsContent value="commentaires" className="mt-4 space-y-4">
              <Card>
                <CardContent className="pt-4">
                  <form onSubmit={handleAjouterCommentaire} className="space-y-2">
                    <textarea
                      rows={2}
                      value={nouveauCommentaire}
                      onChange={(e) => setNouveauCommentaire(e.target.value)}
                      placeholder="Ajouter une remarque ou instruction interne..."
                      className="w-full p-2 rounded border border-slate-200 text-xs focus:ring-1 focus:ring-blue-600"
                    />
                    <Button type="submit" size="sm" variant="secondary" className="w-full text-xs">
                      Publier le commentaire
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {commentaires.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Aucun commentaire rédigé pour le moment</p>
                ) : (
                  commentaires.map((c) => (
                    <div key={c.id} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span className="font-semibold text-blue-600 flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" /> {c.auteur}
                        </span>
                        <span>{c.date}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{c.contenu}</p>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* TAB 3 : HISTORIQUE DES TRANSMISSIONS */}
            <TabsContent value="historique" className="mt-4 space-y-3">
              {historiques.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Aucune trace d'historique de transmission</p>
              ) : (
                historiques.map((h) => (
                  <div key={h.idHistorique} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="h-3 w-3" /> {h.dateHeureTransmission}
                      </span>
                      {h.statutApresAction && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {h.statutApresAction}
                        </Badge>
                      )}
                    </div>
                    <div className="font-medium text-slate-800 text-[11px]">
                      {h.expediteur?.nom || "Système"} ➔ {h.destinataire?.nom || h.serviceDestinataire?.nom || "Service"}
                    </div>
                    {h.actionEffectuee && (
                      <p className="text-slate-600 text-[11px] italic bg-slate-50 p-1.5 rounded">
                        {h.actionEffectuee}
                      </p>
                    )}
                    {h.commentaire && (
                      <p className="text-slate-500 text-[11px]">
                        <strong>Obs:</strong> {h.commentaire}
                      </p>
                    )}
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

      </div>
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
            <form onSubmit={handleModifDossier} className="p-6 space-y-4">
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
    </div>
  );
}