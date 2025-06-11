import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoginPage } from '@/pages/LoginPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CoffeeSystem } from '@/components/coffee/CoffeeSystem';
import './index.css'; // Keep existing global styles

function App() {
  const { isAuthenticated } = useAuth(); // To handle initial redirect if already auth

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route element={<ProtectedRoute />}>
          {/* Protected routes go here */}
          <Route path="/" element={<CoffeeSystem />} />
          {/* Add other protected routes as needed */}
        </Route>
        {/* Optional: A catch-all for 404 or redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
