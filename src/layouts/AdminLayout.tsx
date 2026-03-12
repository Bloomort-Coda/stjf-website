import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useTheme } from "../ThemeContext";
import {
  LogOut,
  LayoutDashboard,
  FileText,
  Calendar,
  Image as ImageIcon,
  FileUp,
  Moon,
  Sun,
  Users,
  FolderTree,
  Globe,
} from "lucide-react";

export default function AdminLayout() {
  const { logout, hasPermission } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
    // Use setTimeout to allow navigation to complete before state update triggers ProtectedRoute redirect
    setTimeout(() => {
      logout();
    }, 0);
  };

  return (
    <div className="min-h-screen flex bg-[var(--background)]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--border)] bg-[var(--card)] flex flex-col no-print shadow-sm z-10">
        <div className="h-20 flex items-center px-8 border-b border-[var(--border)]">
          <span className="text-xl font-sans font-bold tracking-tight">
            STJF CMS
          </span>
        </div>
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <Link
            to="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--border)] transition-colors font-medium text-sm"
          >
            <LayoutDashboard size={18} className="text-gray-500" /> Dashboard
          </Link>
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--primary)]/10 transition-colors text-[var(--primary)] font-bold text-sm"
          >
            <Globe size={18} /> View Site
          </Link>

          <div className="pt-6 pb-2">
            <p className="px-4 text-xs font-bold uppercase tracking-widest text-gray-400">
              Content
            </p>
          </div>
          <Link
            to="/admin/categories"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--border)] transition-colors font-medium text-sm"
          >
            <FolderTree size={18} className="text-gray-500" /> Categories
          </Link>
          <Link
            to="/admin/articles"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--border)] transition-colors font-medium text-sm"
          >
            <FileText size={18} className="text-gray-500" /> Articles
          </Link>
          <Link
            to="/admin/events"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--border)] transition-colors font-medium text-sm"
          >
            <Calendar size={18} className="text-gray-500" /> Events
          </Link>
          <Link
            to="/admin/galleries"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--border)] transition-colors font-medium text-sm"
          >
            <ImageIcon size={18} className="text-gray-500" /> Galleries
          </Link>

          <div className="pt-6 pb-2">
            <p className="px-4 text-xs font-bold uppercase tracking-widest text-gray-400">
              Tools
            </p>
          </div>
          <Link
            to="/admin/documents"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--border)] transition-colors font-medium text-sm"
          >
            <FileUp size={18} className="text-gray-500" /> Word Import
          </Link>
          {hasPermission("admin") && (
            <Link
              to="/admin/users"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--border)] transition-colors font-medium text-sm"
            >
              <Users size={18} className="text-gray-500" /> Manage Users
            </Link>
          )}
        </nav>
        <div className="p-6 border-t border-[var(--border)] flex items-center justify-between bg-[var(--background)]/50">
          <button
            onClick={toggleTheme}
            className="p-3 rounded-xl hover:bg-[var(--border)] transition-colors text-gray-500 hover:text-[var(--foreground)]"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl transition-colors font-bold text-sm uppercase tracking-wider"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8 md:p-12 bg-[var(--background)]">
        <Outlet />
      </main>
    </div>
  );
}
