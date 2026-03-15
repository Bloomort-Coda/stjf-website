import React, { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext";
import { useTheme } from "../../ThemeContext";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import ReactQuill, { Quill } from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

// Fix for quill-image-resize-module-react requiring window.Quill
if (typeof window !== "undefined") {
  (window as any).Quill = Quill;
}

const QuillEditor = ReactQuill
  ? typeof ReactQuill === "object" &&
    ReactQuill !== null &&
    "default" in (ReactQuill as any)
    ? (ReactQuill as any).default
    : ReactQuill
  : () => (
      <div className="p-4 text-red-500">Error: ReactQuill failed to load.</div>
    );

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image", "video"],
    ["clean"],
  ],
};

export default function ManageArticles() {
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const { token, hasPermission, user } = useAuth();
  const { theme } = useTheme();

  // Form state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState(user?.username || "");
  const [categoryId, setCategoryId] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Delete modal state
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Editor ready state
  const [editorReady, setEditorReady] = useState(false);
  
  // Form visibility state
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEditorReady(true);
  }, []);

  const fetchArticles = () => {
    fetch(`/api/articles?t=${new Date().getTime()}`)
      .then((r) => r.json())
      .then(setArticles);
  };

  const fetchCategories = () => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  };

  const fetchImages = () => {
    fetch("/api/images", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setAvailableImages)
      .catch(console.error);
  };

  useEffect(() => {
    fetchArticles();
    fetchCategories();
    fetchImages();
  }, []);

  const buildCategoryOptions = (
    parentId: number | null = null,
    prefix = "",
    visited = new Set<number>(),
  ): { id: number; label: string }[] => {
    let options: { id: number; label: string }[] = [];
    const children = categories.filter((c) => c.parent_id === parentId);
    for (const child of children) {
      if (visited.has(child.id)) continue; // Prevent infinite loops
      const newVisited = new Set(visited);
      newVisited.add(child.id);

      const label = prefix ? `${prefix} > ${child.name}` : child.name;
      options.push({ id: child.id, label });
      options = options.concat(
        buildCategoryOptions(child.id, label, newVisited),
      );
    }
    return options;
  };

  const categoryOptions = buildCategoryOptions();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);
    
    try {
      const res = await fetch("/api/images/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setFeaturedImage(data.url);
        fetchImages();
      }
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!author.trim()) {
      setError("Author is required");
      return;
    }

    const url = editingId ? `/api/articles/${editingId}` : "/api/articles";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          author,
          featured_image: featuredImage,
          category_id: categoryId ? parseInt(categoryId) : null,
        }),
      });
      
      if (!res.ok) {
        let errorMessage = 'Unknown error';
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `HTTP Error ${res.status}: ${res.statusText}`;
        }
        setError(`Failed to save article: ${errorMessage}`);
        return;
      }
    } catch (err) {
      console.error("Failed to save article", err);
      setError("Failed to save article. Please check the console.");
      return;
    }

    setEditingId(null);
    setTitle("");
    setContent("");
    setAuthor(user?.username || "");
    setCategoryId("");
    setFeaturedImage("");
    setIsFormVisible(false);
    fetchArticles();
  };

  const handleEdit = (article: any) => {
    setEditingId(article.id);
    setTitle(article.title || "");
    setContent(article.content || "");
    setAuthor(article.author || "");
    setCategoryId(article.category_id ? article.category_id.toString() : "");
    setFeaturedImage(article.featured_image || "");
    setIsFormVisible(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmDelete = async () => {
    if (deletingId === null) return;
    await fetch(`/api/articles/${deletingId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeletingId(null);
    fetchArticles();
  };

  return (
    <ErrorBoundary>
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-center md:text-left">
          <div>
            <h1 className="text-4xl font-sans font-bold mb-2">
              Manage Articles
            </h1>
            <p className="text-gray-500">
              Create and edit news posts and articles.
            </p>
          </div>
          {!isFormVisible && (
            <button 
              onClick={() => setIsFormVisible(true)}
              className="bg-[var(--primary)] text-[var(--primary-foreground)] px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              + Create New Article
            </button>
          )}
        </div>

        {isFormVisible && (
          <form
            onSubmit={handleSubmit}
            className="bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] mb-10 shadow-sm space-y-6"
          >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-sans font-bold">
              {editingId ? "Edit Article" : "Create New Article"}
            </h2>
          </div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                placeholder="Article Title"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Author
              </label>
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                placeholder="Author Name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              >
                <option value="">None</option>
                {categoryOptions.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-[var(--border)] pt-6">
            <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Featured Image (Recommended size: 600x400px)
            </label>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div 
                onClick={() => setIsImageModalOpen(true)}
                className="cursor-pointer group relative w-full sm:w-64 h-40 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] transition-colors overflow-hidden flex items-center justify-center bg-[var(--background)]"
              >
                {featuredImage ? (
                  <>
                    <img src={featuredImage} alt="Featured Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-semibold">Change Image</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <span className="block text-3xl mb-2 opacity-50">🖼️</span>
                    <span className="text-sm font-medium text-gray-500 group-hover:text-[var(--primary)] transition-colors">Click to select image</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">Or upload a new image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full p-2 rounded-xl border border-[var(--border)] bg-[var(--background)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary)] file:text-[var(--primary-foreground)] hover:file:opacity-90 transition-all"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Uploading a new image will automatically set it as the featured image.
                </p>
                {featuredImage && (
                  <button
                    type="button"
                    onClick={() => setFeaturedImage("")}
                    className="mt-4 text-sm text-red-500 hover:text-red-700 font-semibold"
                  >
                    Remove Image
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="quill-wrapper border-t border-[var(--border)] pt-6">
            <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Content (Rich Text)
            </label>
            {editorReady ? (
              <QuillEditor
                theme="snow"
                value={content}
                onChange={setContent}
                className="bg-[var(--background)] text-[var(--foreground)] rounded-xl overflow-hidden border border-[var(--border)]"
                modules={quillModules}
              />
            ) : (
              <div className="p-4 border border-[var(--border)] rounded-xl opacity-50">
                Loading editor...
              </div>
            )}
            <p className="text-xs text-gray-500 mt-3 font-medium">
              Use the toolbar to format text, add links, and drag-and-drop
              images directly into the editor.
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="bg-[var(--primary)] text-[var(--primary-foreground)] px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              {editingId ? "Update Article" : "Publish Article"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setTitle("");
                setContent("");
                setAuthor(user?.username || "");
                setCategoryId("");
                setFeaturedImage("");
                setIsFormVisible(false);
                setError(null);
              }}
              className="bg-[var(--border)] px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
        )}

        <div className="space-y-4">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div>
                <h3 className="font-sans font-bold text-xl mb-1">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                  By {article.author} on{" "}
                  {new Date(article.created_at).toLocaleDateString()}
                  {article.category_name && (
                    <span className="ml-2 px-2 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded-md text-xs uppercase tracking-wider">
                      {article.category_name}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity w-full md:w-auto justify-end">
                {hasPermission("update") && (
                  <button
                    type="button"
                    onClick={() => handleEdit(article)}
                    className="bg-[var(--background)] border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    Edit
                  </button>
                )}
                {hasPermission("delete") && (
                  <button
                    onClick={() => setDeletingId(article.id)}
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
              <h3 className="text-xl font-bold mb-4">Delete Article?</h3>
              <p className="mb-6 opacity-80">
                Are you sure you want to delete this article? This action cannot
                be undone.
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
      {/* Image Selection Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--card)] rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[var(--border)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-sans font-bold">Select Featured Image</h3>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            {availableImages.length === 0 ? (
              <div className="text-center py-12 opacity-60">
                <p>No images uploaded yet.</p>
                <p className="text-sm mt-2">Use the upload button in the form to add images.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {availableImages.map((img, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      setFeaturedImage(img);
                      setIsImageModalOpen(false);
                    }}
                    className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${featuredImage === img ? 'border-[var(--primary)] shadow-lg scale-105' : 'border-transparent hover:border-[var(--border)] hover:scale-105'}`}
                  >
                    <img src={img} alt={`Upload ${idx}`} className="w-full h-32 object-cover" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t border-[var(--border)] flex justify-end">
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="bg-[var(--border)] px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
}
