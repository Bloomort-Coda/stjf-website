import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext';
import { AuthProvider, useAuth } from './AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import CategoryView from './pages/CategoryView';
import ArticleView from './pages/ArticleView';
import GalleriesView from './pages/GalleriesView';
import BulletinsView from './pages/BulletinsView';
import BulletinDetailView from './pages/BulletinDetailView';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import ManageArticles from './pages/admin/ManageArticles';
import ManageEvents from './pages/admin/ManageEvents';
import ManageGalleries from './pages/admin/ManageGalleries';
import ManageUsers from './pages/admin/ManageUsers';
import ManageCategories from './pages/admin/ManageCategories';
import DocumentImport from './pages/admin/DocumentImport';
import PrintView from './pages/PrintView';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/category/:id" element={<CategoryView />} />
              <Route path="/article/:id" element={<ArticleView />} />
              <Route path="/galleries" element={<GalleriesView />} />
              <Route path="/bulletins" element={<BulletinsView />} />
              <Route path="/bulletin/:id" element={<BulletinDetailView />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="categories" element={<ManageCategories />} />
              <Route path="articles" element={<ManageArticles />} />
              <Route path="events" element={<ManageEvents />} />
              <Route path="galleries" element={<ManageGalleries />} />
              <Route path="documents" element={<DocumentImport />} />
            </Route>

            {/* Isolated Print Route */}
            <Route path="/print/:id" element={<ProtectedRoute><PrintView /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
