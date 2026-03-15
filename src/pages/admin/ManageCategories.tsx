import React, { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext";

export default function ManageCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const { token, hasPermission } = useAuth();

  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchCategories = () => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await fetch(`/api/categories/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          parent_id: parentId ? parseInt(parentId) : null,
        }),
      });
    } else {
      await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          parent_id: parentId ? parseInt(parentId) : null,
        }),
      });
    }

    setName("");
    setParentId("");
    setEditingId(null);
    setIsFormVisible(false);
    fetchCategories();
  };

  const handleEdit = (cat: any) => {
    setEditingId(cat.id);
    setName(cat.name);
    setParentId(cat.parent_id ? cat.parent_id.toString() : "");
    setIsFormVisible(true);
  };

  const confirmDelete = async () => {
    if (deletingId === null) return;
    await fetch(`/api/categories/${deletingId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeletingId(null);
    fetchCategories();
  };

  // Helper to build hierarchy for display
  const buildHierarchy = (
    cats: any[],
    parentId: number | null = null,
    level = 0,
  ): any[] => {
    let result: any[] = [];
    const children = cats.filter((c) => c.parent_id === parentId);
    for (const child of children) {
      result.push({ ...child, level });
      result = result.concat(buildHierarchy(cats, child.id, level + 1));
    }
    return result;
  };

  const hierarchicalCategories = buildHierarchy(categories);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-center md:text-left">
        <div>
          <h1 className="text-4xl font-sans font-bold mb-2">
            Manage Categories
          </h1>
          <p className="text-gray-500">
            Organize your website's content structure.
          </p>
        </div>
        {hasPermission("create") && !isFormVisible && (
          <button 
            onClick={() => setIsFormVisible(true)}
            className="bg-[var(--primary)] text-[var(--primary-foreground)] px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            + Create New Category
          </button>
        )}
      </div>

      {hasPermission("create") && isFormVisible && (
        <form
          onSubmit={handleSubmit}
          className="bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] mb-10 shadow-sm space-y-6"
        >
          <h2 className="text-2xl font-sans font-bold mb-2">
            {editingId ? "Edit Category" : "Create New Category"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Category Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                placeholder="e.g. Parish News"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Parent Category
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              >
                <option value="">None (Top Level)</option>
                {hierarchicalCategories.map((cat) => (
                  <option
                    key={cat.id}
                    value={cat.id}
                    disabled={cat.id === editingId}
                  >
                    {"-".repeat(cat.level * 2)} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-[var(--primary)] text-[var(--primary-foreground)] px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              {editingId ? "Update Category" : "Create Category"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setName("");
                  setParentId("");
                  setIsFormVisible(false);
                }}
                className="bg-[var(--border)] px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            )}
            {!editingId && (
              <button
                type="button"
                onClick={() => {
                  setName("");
                  setParentId("");
                  setIsFormVisible(false);
                }}
                className="bg-[var(--border)] px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className="space-y-3">
        {hierarchicalCategories.map((cat) => (
          <div
            key={cat.id}
            style={{ marginLeft: `${cat.level * 2}rem` }}
            className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] flex justify-between items-center shadow-sm hover:shadow-md transition-shadow group"
          >
            <h3 className="font-sans font-bold text-lg">
              {cat.name}
            </h3>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {hasPermission("update") && (
                <button
                  onClick={() => handleEdit(cat)}
                  className="bg-[var(--background)] border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Edit
                </button>
              )}
              {hasPermission("delete") && (
                <button
                  onClick={() => setDeletingId(cat.id)}
                  disabled={cat.subcategory_count > 0 || cat.article_count > 0}
                  title={
                    cat.subcategory_count > 0
                      ? "Cannot delete: Category has sub-categories"
                      : cat.article_count > 0
                        ? "Cannot delete: Category has linked articles"
                        : "Delete category"
                  }
                  className="text-red-500 hover:bg-red-500 hover:text-white border border-transparent hover:border-red-500 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-red-500 disabled:hover:border-transparent"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {deletingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] p-6 rounded-2xl max-w-sm w-full border border-[var(--border)]">
            <h3 className="text-xl font-bold mb-4">Delete Category?</h3>
            <p className="mb-6 opacity-80">
              Are you sure you want to delete this category? This might orphan articles.
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
