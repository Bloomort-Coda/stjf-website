import React from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Calendar,
  Image as ImageIcon,
  FileUp,
  Users,
  FolderTree,
} from "lucide-react";
import { useAuth } from "../../AuthContext";

export default function Dashboard() {
  const { hasPermission } = useAuth();

  return (
    <div>
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-sans font-bold mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-500">
          Manage your parish website content and settings.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {hasPermission("admin") && (
          <Link
            to="/admin/users"
            className="bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center text-center gap-5 group"
          >
            <div className="p-5 bg-[var(--primary)]/5 text-[var(--primary)] rounded-full group-hover:bg-[var(--primary)]/10 transition-colors">
              <Users size={36} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-sans font-bold text-xl mb-1 group-hover:text-[var(--primary)] transition-colors">
                Manage Users
              </h2>
              <p className="text-sm text-gray-500">Add and edit admin users</p>
            </div>
          </Link>
        )}

        <Link
          to="/admin/categories"
          className="bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center text-center gap-5 group"
        >
          <div className="p-5 bg-[var(--primary)]/5 text-[var(--primary)] rounded-full group-hover:bg-[var(--primary)]/10 transition-colors">
            <FolderTree size={36} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-sans font-bold text-xl mb-1 group-hover:text-[var(--primary)] transition-colors">
              Manage Categories
            </h2>
            <p className="text-sm text-gray-500">Organize content structure</p>
          </div>
        </Link>

        <Link
          to="/admin/articles"
          className="bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center text-center gap-5 group"
        >
          <div className="p-5 bg-[var(--primary)]/5 text-[var(--primary)] rounded-full group-hover:bg-[var(--primary)]/10 transition-colors">
            <FileText size={36} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-sans font-bold text-xl mb-1 group-hover:text-[var(--primary)] transition-colors">
              Manage Articles
            </h2>
            <p className="text-sm text-gray-500">Create and edit news posts</p>
          </div>
        </Link>

        <Link
          to="/admin/events"
          className="bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center text-center gap-5 group"
        >
          <div className="p-5 bg-[var(--primary)]/5 text-[var(--primary)] rounded-full group-hover:bg-[var(--primary)]/10 transition-colors">
            <Calendar size={36} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-sans font-bold text-xl mb-1 group-hover:text-[var(--primary)] transition-colors">
              Manage Events
            </h2>
            <p className="text-sm text-gray-500">Update upcoming events</p>
          </div>
        </Link>

        <Link
          to="/admin/galleries"
          className="bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center text-center gap-5 group"
        >
          <div className="p-5 bg-[var(--primary)]/5 text-[var(--primary)] rounded-full group-hover:bg-[var(--primary)]/10 transition-colors">
            <ImageIcon size={36} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-sans font-bold text-xl mb-1 group-hover:text-[var(--primary)] transition-colors">
              Manage Galleries
            </h2>
            <p className="text-sm text-gray-500">Link Facebook photo albums</p>
          </div>
        </Link>

        <Link
          to="/admin/documents"
          className="bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center text-center gap-5 group"
        >
          <div className="p-5 bg-[var(--primary)]/5 text-[var(--primary)] rounded-full group-hover:bg-[var(--primary)]/10 transition-colors">
            <FileUp size={36} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-sans font-bold text-xl mb-1 group-hover:text-[var(--primary)] transition-colors">
              Word Import
            </h2>
            <p className="text-sm text-gray-500">
              Upload .docx for A4 printing
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
