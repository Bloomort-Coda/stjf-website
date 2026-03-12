import React, { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { useAuth } from "../AuthContext";
import { Moon, Sun, ChevronDown, ChevronRight, Menu, X } from "lucide-react";

export default function PublicLayout() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileCategories, setExpandedMobileCategories] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  const buildTree = (parentId: number | null = null): any[] => {
    return categories
      .filter((c) => c.parent_id === parentId)
      .map((c) => ({ ...c, children: buildTree(c.id) }));
  };

  const tree = buildTree();

  const toggleMobileCategory = (id: number) => {
    setExpandedMobileCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-md sticky top-0 no-print z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[5rem] py-4 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/"
            className="text-2xl font-sans font-bold tracking-tight text-[var(--primary)]"
          >
            STJF
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex flex-wrap items-center gap-4 lg:gap-6">
            <Link
              to="/galleries"
              className="text-sm font-semibold tracking-wide uppercase hover:text-[var(--primary)] transition-colors"
            >
              Galleries
            </Link>
            <Link
              to="/bulletins"
              className="text-sm font-semibold tracking-wide uppercase hover:text-[var(--primary)] transition-colors"
            >
              Bulletins
            </Link>

            {/* Dynamic Categories Nav */}
            {tree.map((item) => (
              <div key={item.id} className="relative group">
                <Link
                  to={`/category/${item.id}`}
                  className="flex items-center text-sm font-semibold tracking-wide uppercase hover:text-[var(--primary)] transition-colors py-2"
                >
                  {item.name}
                  {item.children.length > 0 && (
                    <ChevronDown size={14} className="ml-1 opacity-70" />
                  )}
                </Link>

                {/* Level 2 */}
                {item.children.length > 0 && (
                  <div className="absolute left-0 top-full hidden group-hover:block min-w-[200px] bg-[var(--card)] border border-[var(--border)] rounded-md shadow-lg py-1">
                    {item.children.map((child: any) => (
                      <div key={child.id} className="relative group/sub">
                        <Link
                          to={`/category/${child.id}`}
                          className="flex items-center justify-between px-4 py-2 text-sm hover:bg-[var(--border)]"
                        >
                          {child.name}
                          {child.children.length > 0 && (
                            <ChevronRight size={14} />
                          )}
                        </Link>

                        {/* Level 3 */}
                        {child.children.length > 0 && (
                          <div className="absolute left-full top-0 hidden group-hover/sub:block min-w-[200px] bg-[var(--card)] border border-[var(--border)] rounded-md shadow-lg py-1 ml-1">
                            {child.children.map((grandchild: any) => (
                              <Link
                                key={grandchild.id}
                                to={`/category/${grandchild.id}`}
                                className="block px-4 py-2 text-sm hover:bg-[var(--border)]"
                              >
                                {grandchild.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isAuthenticated ? (
              <Link
                to="/admin"
                className="text-sm font-semibold tracking-wide uppercase text-[var(--primary)] hover:opacity-80 transition-opacity"
              >
                Admin Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="text-sm font-semibold tracking-wide uppercase hover:text-[var(--primary)] transition-colors"
              >
                Admin Login
              </Link>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-[var(--border)] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-4 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-[var(--border)] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md hover:bg-[var(--border)] transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[var(--card)] border-b border-[var(--border)] shadow-lg max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="px-4 py-4 flex flex-col space-y-4">
              <Link
                to="/galleries"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-medium"
              >
                Galleries
              </Link>
              <Link
                to="/bulletins"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-medium"
              >
                Bulletins
              </Link>

              {tree.map((item) => (
                <div key={item.id} className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/category/${item.id}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-base font-medium"
                    >
                      {item.name}
                    </Link>
                    {item.children.length > 0 && (
                      <button
                        onClick={() => toggleMobileCategory(item.id)}
                        className="p-1"
                      >
                        <ChevronDown
                          size={18}
                          className={`transition-transform ${expandedMobileCategories[item.id] ? "rotate-180" : ""}`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Level 2 Mobile */}
                  {item.children.length > 0 &&
                    expandedMobileCategories[item.id] && (
                      <div className="pl-4 flex flex-col space-y-2 border-l-2 border-[var(--border)] ml-2">
                        {item.children.map((child: any) => (
                          <div
                            key={child.id}
                            className="flex flex-col space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <Link
                                to={`/category/${child.id}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-sm"
                              >
                                {child.name}
                              </Link>
                              {child.children.length > 0 && (
                                <button
                                  onClick={() => toggleMobileCategory(child.id)}
                                  className="p-1"
                                >
                                  <ChevronDown
                                    size={16}
                                    className={`transition-transform ${expandedMobileCategories[child.id] ? "rotate-180" : ""}`}
                                  />
                                </button>
                              )}
                            </div>

                            {/* Level 3 Mobile */}
                            {child.children.length > 0 &&
                              expandedMobileCategories[child.id] && (
                                <div className="pl-4 flex flex-col space-y-2 border-l-2 border-[var(--border)] ml-2">
                                  {child.children.map((grandchild: any) => (
                                    <Link
                                      key={grandchild.id}
                                      to={`/category/${grandchild.id}`}
                                      onClick={() => setIsMobileMenuOpen(false)}
                                      className="text-sm opacity-80"
                                    >
                                      {grandchild.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ))}

              <div className="pt-4 border-t border-[var(--border)]">
                {isAuthenticated ? (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-base font-medium text-[var(--primary)]"
                  >
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-base font-medium"
                  >
                    Admin Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-0">
        <Outlet />
      </main>
      <footer className="border-t border-[var(--border)] bg-[var(--card)] pt-16 pb-8 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-sans font-bold mb-6 text-[var(--primary)]">
                St. John Fisher Catholic Church
              </h3>
              <p className="text-base opacity-80 mb-6 max-w-md leading-relaxed">
                A welcoming Catholic community in Lynnwood, Pretoria. Join us
                for Mass, community events, and spiritual growth.
              </p>
              <div className="text-sm opacity-80 space-y-2">
                <p>
                  <strong className="font-semibold">Parish Priest:</strong> Fr.
                  Thomas Vanderkunnel
                </p>
                <p>
                  <strong className="font-semibold">Phone:</strong> 012 361 1561
                  (normal hours) / 068 481 4055
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-sans font-bold mb-6 uppercase tracking-wider">
                Quick Links
              </h3>
              <ul className="space-y-3 text-sm opacity-80">
                <li>
                  <Link
                    to="/"
                    className="hover:text-[var(--primary)] hover:translate-x-1 transition-transform inline-block"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/galleries"
                    className="hover:text-[var(--primary)] hover:translate-x-1 transition-transform inline-block"
                  >
                    Galleries
                  </Link>
                </li>
                <li>
                  <Link
                    to="/bulletins"
                    className="hover:text-[var(--primary)] hover:translate-x-1 transition-transform inline-block"
                  >
                    Bulletins
                  </Link>
                </li>
                <li>
                  <Link
                    to="/article/5"
                    className="hover:text-[var(--primary)] hover:translate-x-1 transition-transform inline-block"
                  >
                    Mass Times
                  </Link>
                </li>
                <li>
                  <a
                    href="https://stjf.co.za/site.php?articleid=43"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[var(--primary)] hover:translate-x-1 transition-transform inline-block"
                  >
                    Catechism Registration
                  </a>
                </li>
                {isAuthenticated ? (
                  <li>
                    <Link
                      to="/admin"
                      className="hover:text-[var(--primary)] hover:translate-x-1 transition-transform inline-block font-semibold"
                    >
                      Admin Dashboard
                    </Link>
                  </li>
                ) : (
                  <li>
                    <Link
                      to="/login"
                      className="hover:text-[var(--primary)] hover:translate-x-1 transition-transform inline-block"
                    >
                      Admin Login
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-sans font-bold mb-6 uppercase tracking-wider">
                Location
              </h3>
              <address className="text-sm opacity-80 not-italic leading-relaxed">
                321 Border Road
                <br />
                Lynnwood
                <br />
                Pretoria, 0081
                <br />
                South Africa
              </address>
            </div>
          </div>

          <div className="pt-8 border-t border-[var(--border)] text-center text-xs opacity-60 flex flex-col md:flex-row justify-between items-center gap-4 uppercase tracking-widest">
            <p>
              &copy; {new Date().getFullYear()} St. John Fisher Catholic Church
              Lynnwood. All rights reserved.
            </p>
            <p>Designed & Built by Stanley King and Ralph Enslin</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
