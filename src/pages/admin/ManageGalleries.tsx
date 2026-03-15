import React, { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext";

export default function ManageGalleries() {
  const [galleries, setGalleries] = useState<any[]>([]);
  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [cover, setCover] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchGalleries = () => {
    fetch("/api/galleries")
      .then((r) => r.json())
      .then(setGalleries);
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/galleries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          album_title: title,
          cover_image_url: cover,
          facebook_link: link,
        }),
      });
      if (!res.ok) throw new Error("Failed to add gallery");
      setTitle("");
      setCover("");
      setLink("");
      fetchGalleries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const confirmDelete = async () => {
    if (deletingId === null) return;
    await fetch(`/api/galleries/${deletingId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeletingId(null);
    fetchGalleries();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-sans font-bold mb-2">
          Manage Galleries
        </h1>
        <p className="text-gray-500">Link and display Facebook photo albums.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] mb-10 shadow-sm space-y-6"
      >
        <h2 className="text-2xl font-sans font-bold mb-2">
          Add Facebook Gallery
        </h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <div>
          <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Album Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
            placeholder="e.g. Easter Vigil 2026"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Cover Image URL
          </label>
          <input
            value={cover}
            onChange={(e) => setCover(e.target.value)}
            required
            className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Facebook Album Link
          </label>
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            required
            className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
            placeholder="https://facebook.com/..."
          />
        </div>
        <div className="pt-2">
          <button
            type="submit"
            className="bg-[var(--primary)] text-[var(--primary-foreground)] px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Add Gallery
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {galleries.map((gallery) => (
          <div
            key={gallery.id}
            className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] flex gap-5 items-center shadow-sm hover:shadow-md transition-shadow group"
          >
            <img
              src={gallery.cover_image_url}
              alt={gallery.album_title}
              className="w-24 h-24 object-cover rounded-xl shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-sans font-bold text-lg line-clamp-2 mb-1">
                {gallery.album_title}
              </h3>
              <a
                href={gallery.facebook_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] hover:opacity-80 transition-opacity"
              >
                View on Facebook
              </a>
            </div>
            <div className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setDeletingId(gallery.id)}
                className="text-red-500 hover:bg-red-500 hover:text-white border border-transparent hover:border-red-500 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {deletingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] p-6 rounded-2xl max-w-sm w-full border border-[var(--border)]">
            <h3 className="text-xl font-bold mb-4">Delete Gallery?</h3>
            <p className="mb-6 opacity-80">
              Are you sure you want to delete this gallery? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-lg font-medium hover:bg-[var(--background)]"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
