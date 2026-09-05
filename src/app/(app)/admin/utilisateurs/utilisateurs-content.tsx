"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { 
  Search, 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown, 
  Building2, 
  Users, 
  ShieldCheck, 
  UserPlus, 
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGED, UtilisateurModel, Role, ROLE_LABELS } from "@/components/providers/data-provider";
import { useAuth, RegisterInput } from "@/components/providers/auth-provider";

export default function UtilisateursContent() {
  const { utilisateurs, services, loadServicesAndUtilisateurs } = useGED();
  const { register } = useAuth();

  const [globalFilter, setGlobalFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Formulaire Nouvel Utilisateur avec le type Role
  const [nom, setNom] = useState("");
  const [postNom, setPostNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("AGENT");
  const [idServiceSelect, setIdServiceSelect] = useState<number | undefined>(undefined);

  const filteredUtilisateurs = useMemo(() => {
    return utilisateurs.filter((u) => {
      if (roleFilter !== "all" && u.roles?.includes(roleFilter)) return false;
      if (serviceFilter !== "all" && String(u.service?.nom) !== serviceFilter) return false;
      return true;
    });
  }, [utilisateurs, roleFilter, serviceFilter]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || !phoneNumber) return;
    const dataForm : RegisterInput = {
        prenom: prenom,
        nom: nom,
        postNom: postNom,
        email: email,
        phoneNumber: phoneNumber,
        roles: [role],
        motDePasse: motDePasse,
        idService: idServiceSelect
    }

    const user : UtilisateurModel = await register(dataForm)
    await loadServicesAndUtilisateurs(1, 100)
    alert(`Utilisateur ${user.prenom} ${user.nom} ${user.postNom} (${ROLE_LABELS[role]}) créé avec succès !`);
    
    setNom("");
    setPrenom("");
    setPostNom("");
    setPhoneNumber("");
    setEmail("");
    setRole("AGENT");
    setShowAddUserModal(false);
  };

  const userColumns: ColumnDef<UtilisateurModel>[] = [
    {
      accessorKey: "nom",
      header: "Utilisateur",
      cell: ({ row }) => {
        const u = row.original;
        const initiales = `${u.nom?.charAt(0) || ""}${u.prenom?.charAt(0) || ""}`.toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-bold text-xs text-blue-700">
              {initiales || "U"}
            </div>
            <div>
              <p className="font-medium text-slate-900 leading-none">{u.nom} {u.postNom} {u.prenom}</p>
              <p className="text-xs text-slate-500 mt-0.5">{u.email}</p>
              <p className="text-xs text-slate-500 mt-0.5">{u.phoneNumber}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Rôle",
      cell: ({ getValue }) => {
        const r = getValue() as Role;
        const isAdmin = r === "ADMINISTRATEUR";
        return (
          <Badge variant={isAdmin ? "danger" : "outline"} className="text-[10px]">
            {ROLE_LABELS[r] || r}
          </Badge>
        );
      },
    },
    {
      id: "service",
      header: "Service Rattaché",
      cell: ({ row }) => {
        const u = row.original;
        const s = services.find((serv) => serv.idService === u.service?.idService);
        return (
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-slate-400" />
            {s ? s.nom : u.service?.nom || "Non rattaché"}
          </span>
        );
      },
    },
    {
      id: "statut",
      header: "État Compte",
      cell: () => (
        <Badge variant="success" className="text-[10px] gap-1">
          <CheckCircle2 className="h-3 w-3" /> Actif
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: () => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600 hover:text-blue-800">
            Éditer
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-500 hover:text-red-700">
            Désactiver
          </Button>
        </div>
      ),
    },
  ];

  const tableUtilisateurs = useReactTable({
    data: filteredUtilisateurs,
    columns: userColumns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des Utilisateurs</h1>
          <p className="text-slate-500 text-sm mt-1">
            Gérez les comptes, l&apos;attribution des rôles et les accès aux services.
          </p>
        </div>

        <Button
          className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold h-9"
          onClick={() => setShowAddUserModal(!showAddUserModal)}
        >
          <UserPlus className="h-4 w-4" /> Nouvel Utilisateur
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-blue-50/50 border-blue-100">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600 uppercase">Utilisateurs inscrits</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{utilisateurs.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500/40" />
          </CardContent>
        </Card>

        <Card className="bg-amber-50/50 border-amber-100">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-600 uppercase">Administrateurs</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {utilisateurs.filter((u) => u.roles?.includes("ADMINISTRATEUR")).length}
              </p>
            </div>
            <ShieldCheck className="h-8 w-8 text-amber-500/40" />
          </CardContent>
        </Card>
      </div>

      {showAddUserModal && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-blue-900 flex justify-between items-center">
              Nouveau Compte Utilisateur
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowAddUserModal(false)}>
                <XCircle className="h-4 w-4 text-slate-400" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <Input placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} required className="h-8 text-xs bg-white" />
              <Input placeholder="Post Nom" value={postNom} onChange={(e) => setPostNom(e.target.value)} className="h-8 text-xs bg-white" />
              <Input placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} className="h-8 text-xs bg-white" />
              <Input placeholder="Numero telephone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required className="h-8 text-xs bg-white" />
              <Input placeholder="Mot de passe" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} required className="h-8 text-xs bg-white" />
              <Input type="email" placeholder="Adresse Email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-8 text-xs bg-white" />
              
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value as Role)} 
                className="h-8 text-xs bg-white border border-slate-200 rounded px-2"
              >
                {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>

              <div className="sm:col-span-3">
                <select value={idServiceSelect} onChange={(e) => setIdServiceSelect(e.target.value ? Number(e.target.value) : 0)} className="w-full h-8 text-xs bg-white border border-slate-200 rounded px-2">
                  <option value="">-- Rattacher à un service --</option>
                  {services.map((s) => (
                    <option key={s.idService} value={s.idService}>{s.nom} ({s.code})</option>
                  ))}
                </select>
              </div>
              <Button type="submit" size="sm" className="h-8 text-xs bg-blue-600 text-white">Créer le compte</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Rechercher par nom, email..."
            className="pl-9 h-9 text-xs bg-white"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as Role | "all")}
          className="w-48 text-xs bg-white border border-slate-200 rounded-lg px-3 h-9"
        >
          <option value="all">Tous les rôles</option>
          {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>

        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="w-48 text-xs bg-white border border-slate-200 rounded-lg px-3 h-9"
        >
          <option value="all">Tous les services</option>
          {services.map((s) => (
            <option key={s.idService} value={s.idService}>{s.nom}</option>
          ))}
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                {tableUtilisateurs.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b border-slate-200 bg-slate-50">
                    {hg.headers.map((header) => (
                      <th key={header.id} className="px-4 py-3 text-left font-semibold text-slate-600">
                        {header.isPlaceholder ? null : (
                          <button
                            className="flex items-center gap-1 hover:text-slate-900"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() === "asc" ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : header.column.getCanSort() ? (
                              <ChevronsUpDown className="h-3 w-3 opacity-40" />
                            ) : null}
                          </button>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {tableUtilisateurs.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={userColumns.length} className="px-4 py-12 text-center text-slate-400">
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                ) : (
                  tableUtilisateurs.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 text-xs text-slate-500">
            <p>
              Page {tableUtilisateurs.getState().pagination.pageIndex + 1} sur{" "}
              {tableUtilisateurs.getPageCount()} · {filteredUtilisateurs.length} résultats
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => tableUtilisateurs.previousPage()}
                disabled={!tableUtilisateurs.getCanPreviousPage()}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => tableUtilisateurs.nextPage()}
                disabled={!tableUtilisateurs.getCanNextPage()}
              >
                Suivant
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}