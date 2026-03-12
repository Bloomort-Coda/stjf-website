import React, { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext";
import { Printer, Trash2, Eye } from "lucide-react";

export default function DocumentImport() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const { token } = useAuth();

  const fetchDocuments = () => {
    fetch("/api/documents")
      .then((r) => r.json())
      .then(setDocuments);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("document", file);
    if (title) {
      formData.append("title", title);
    }

    try {
      await fetch("/api/documents/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      setFile(null);
      setTitle("");
      fetchDocuments();
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/documents/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchDocuments();
  };

  const handlePrint = (id: number) => {
    window.open(`/print/${id}`, "_blank");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-sans font-bold mb-2">
          Word Document Import
        </h1>
        <p className="text-gray-500">
          Upload and convert Microsoft Word documents to HTML.
        </p>
      </div>

      <div className="bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] mb-10 shadow-sm">
        <h2 className="text-2xl font-sans font-bold mb-2">
          Upload .docx File
        </h2>
        <p className="text-sm text-gray-500 mb-6 font-medium">
          Upload a Microsoft Word document to convert it to HTML. This is
          typically used for weekly bulletins.
        </p>
        <form onSubmit={handleUpload} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Document Title
            </label>
            <input
              type="text"
              placeholder="e.g., Bulletin - March 11, 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-[var(--border)] rounded-xl bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Select File
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <input
                type="file"
                accept=".docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="flex-1 w-full p-3 border border-[var(--border)] rounded-xl bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary)]/10 file:text-[var(--primary)] hover:file:bg-[var(--primary)]/20"
                required
              />
              <button
                type="submit"
                disabled={!file || uploading}
                className="w-full sm:w-auto bg-[var(--primary)] text-[var(--primary-foreground)] px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md"
              >
                {uploading ? "Processing..." : "Upload & Convert"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-sans font-bold mb-6">
          Imported Documents
        </h2>
        {documents.length === 0 ? (
          <div className="bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] text-center">
            <p className="text-gray-500 font-medium">
              No documents imported yet.
            </p>
          </div>
        ) : null}
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div>
              <h3 className="font-sans font-bold text-xl mb-1">
                {doc.title}
              </h3>
              <p className="text-sm text-gray-500 font-medium">
                Imported on {new Date(doc.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity w-full md:w-auto justify-end">
              <button
                onClick={() => window.open(`/bulletin/${doc.id}`, "_blank")}
                className="flex items-center gap-2 bg-[var(--background)] border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
              >
                <Eye size={16} /> View
              </button>
              <button
                onClick={() => handlePrint(doc.id)}
                className="flex items-center gap-2 bg-[var(--background)] border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
              >
                <Printer size={16} /> Print A4
              </button>
              <button
                onClick={() => handleDelete(doc.id)}
                className="flex items-center gap-2 text-red-500 hover:bg-red-500 hover:text-white border border-transparent hover:border-red-500 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
