import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/layout/ThemeProvider';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Services } from './pages/Services';
import { Products } from './pages/Products';
import { Appointments } from './pages/Appointments';
import { Booking } from './pages/Booking';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="services" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <Services />
                </ProtectedRoute>
              } />
              <Route path="products" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <Products />
                </ProtectedRoute>
              } />
              <Route path="appointments" element={
                <ProtectedRoute>
                  <Appointments />
                </ProtectedRoute>
              } />
              {/* Additional routes will be added here */}
            </Route>
            
            {/* Public booking route */}
            <Route path="/booking" element={<Booking />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;