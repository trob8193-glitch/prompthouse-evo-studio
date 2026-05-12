import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StudioLayout } from './components/layout/StudioLayout';
import { Dashboard } from './features/dashboard/Dashboard';
import { ImageGenerator } from './features/generation/ImageGenerator';
import { AssetGallery } from './features/assets/AssetGallery';
import { Login } from './features/auth/Login';

// SOVEREIGN AUTH GATE
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = { role: 'ADMIN', isAuthenticated: true }; // This will be replaced by real Auth Hook in Phase 2
  
  if (!user.isAuthenticated) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" />;
  
  return children;
};

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <StudioLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="generator" element={<ImageGenerator />} />
          <Route path="gallery" element={<AssetGallery />} />
          {/* Future phases will add more routes here */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
