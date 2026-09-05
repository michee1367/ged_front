"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Bell, LogOut, ChevronDown, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/auth-provider";
import { useGED } from "@/components/providers/data-provider";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const { notifications = [] } = useGED();
  const router = useRouter();
  
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/dossiers?q=${encodeURIComponent(search.trim())}`);
    }
  };

  const displayName = user?.fullName || user?.username || "Utilisateur";
  const displayEmail = user?.email || "";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white/80 backdrop-blur-sm px-4 md:px-6 gap-2">
      {/* Bouton Menu Burger pour Mobile */}
      <button 
        type="button"
        onClick={onMenuToggle}
        className="lg:hidden text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition shrink-0"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Barre de Recherche Globale */}
      <form onSubmit={handleSearch} className="relative w-full max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Rechercher un dossier, un document..."
          className="pl-9 bg-slate-50 border-transparent focus:bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      {/* Zone Utilisateur & Notifications */}
      <div className="flex items-center gap-3 shrink-0">
        <Link href="/notifications" className="relative rounded-lg p-2 hover:bg-slate-100 transition-colors">
          <Bell className="h-5 w-5 text-slate-600" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-red-600 text-white">
              {unreadCount}
            </Badge>
          )}
        </Link>

        {/* Dropdown Profil */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} alt={displayName} />
              <AvatarFallback className="bg-blue-600 text-white text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-900 leading-tight">{displayName}</p>
              <p className="text-xs text-slate-500 leading-tight">{displayEmail}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400 hidden md:block" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-lg border border-border bg-white py-1 shadow-lg">
                <div className="px-4 py-2 border-b border-slate-100 md:hidden">
                  <p className="text-sm font-medium text-slate-900">{displayName}</p>
                  <p className="text-xs text-slate-500 truncate">{displayEmail}</p>
                </div>
                <Link
                  href="/parametres"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Paramètres
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}