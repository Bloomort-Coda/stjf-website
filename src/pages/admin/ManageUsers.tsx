import React, { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext";

export default function ManageUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const { token, hasPermission } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [permissions, setPermissions] = useState<string[]>(["read"]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const availablePermissions = ["admin", "read", "create", "update", "delete"];

  const fetchUsers = () => {
    fetch("/api/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setUsers);
  };

  useEffect(() => {
    if (hasPermission("admin")) {
      fetchUsers();
    }
  }, []);

  const handlePermissionChange = (perm: string) => {
    if (perm === "admin") {
      setPermissions(["admin"]);
      return;
    }
    let newPerms = [...permissions].filter((p) => p !== "admin");
    if (newPerms.includes(perm)) {
      newPerms = newPerms.filter((p) => p !== perm);
    } else {
      newPerms.push(perm);
    }
    if (newPerms.length === 0) newPerms = ["read"];
    setPermissions(newPerms);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const role = permissions.join(",");

    try {
      if (editingId) {
        const res = await fetch(`/api/users/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role, password: password || undefined }),
        });
        if (!res.ok) throw new Error("Failed to update user");
      } else {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username, password, role }),
        });
        if (!res.ok) throw new Error("Failed to create user");
      }

      setUsername("");
      setPassword("");
      setPermissions(["read"]);
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleEdit = (user: any) => {
    setEditingId(user.id);
    setUsername(user.username);
    setPassword("");
    setPermissions(user.role.split(","));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmDelete = async () => {
    if (deletingId === null) return;
    await fetch(`/api/users/${deletingId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeletingId(null);
    fetchUsers();
  };

  if (!hasPermission("admin")) {
    return <div>Access Denied</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-sans font-bold mb-2">
          Manage Users
        </h1>
        <p className="text-gray-500">Add and manage administrator accounts.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] mb-10 shadow-sm space-y-6"
      >
        <h2 className="text-2xl font-sans font-bold mb-2">
          {editingId ? "Edit User" : "Create New User"}
        </h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={!!editingId}
              required
              className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all disabled:opacity-50"
              placeholder="Username"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Password{" "}
              {editingId && (
                <span className="text-xs font-normal lowercase tracking-normal">
                  (leave blank to keep current)
                </span>
              )}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!editingId}
              className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              placeholder={editingId ? "••••••••" : "Password"}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Permissions
          </label>
          <div className="flex flex-wrap gap-3">
            {availablePermissions.map((perm) => (
              <label
                key={perm}
                className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl border transition-all ${permissions.includes(perm) ? "bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]" : "bg-[var(--background)] border-[var(--border)] hover:border-gray-400"}`}
              >
                <input
                  type="checkbox"
                  checked={permissions.includes(perm)}
                  onChange={() => handlePermissionChange(perm)}
                  className="sr-only"
                />
                <span className="capitalize font-medium text-sm">{perm}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="bg-[var(--primary)] text-[var(--primary-foreground)] px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            {editingId ? "Update User" : "Create User"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setUsername("");
                setPassword("");
                setPermissions(["read"]);
              }}
              className="bg-[var(--border)] px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div>
              <h3 className="font-sans font-bold text-xl mb-2">
                {user.username}
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.role.split(",").map((r: string) => (
                  <span
                    key={r}
                    className="text-xs font-bold uppercase tracking-wider bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1 rounded-lg"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity w-full md:w-auto justify-end">
              <button
                onClick={() => handleEdit(user)}
                className="bg-[var(--background)] border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
              >
                Edit
              </button>
              {user.username !== "admin" && (
                <button
                  onClick={() => setDeletingId(user.id)}
                  className="text-red-500 hover:bg-red-500 hover:text-white border border-transparent hover:border-red-500 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
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
            <h3 className="text-xl font-bold mb-4">Delete User?</h3>
            <p className="mb-6 opacity-80">
              Are you sure you want to delete this user? This action cannot be undone.
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
