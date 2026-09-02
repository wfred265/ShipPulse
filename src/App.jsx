import React, { useState, useEffect } from 'react';
import { ShipmentProvider } from './context/ShipmentContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import ClientLanding from './components/ClientLanding';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import Footer from './components/Footer';

function MainApp() {
  const { isAuthenticated } = useAuth();
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  // Check URL hash or query params for secret hidden multi-segment admin route
  useEffect(() => {
    const checkAdminRoute = () => {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      const pathname = window.location.pathname || '';

      if (
        hash.includes('portal/admin') || 
        hash.includes('admin/auth') || 
        search.includes('portal/admin') ||
        pathname.includes('admin-console')
      ) {
        setIsAdminRoute(true);
      } else {
        setIsAdminRoute(false);
      }
    };

    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    window.addEventListener('popstate', checkAdminRoute);

    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
      window.removeEventListener('popstate', checkAdminRoute);
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Show Navbar on Public Client Site */}
      {!isAdminRoute && <Navbar />}

      <main style={{ flex: 1 }}>
        {isAdminRoute ? (
          isAuthenticated ? (
            <AdminDashboard />
          ) : (
            <AdminLogin onLoginSuccess={() => setIsAdminRoute(true)} />
          )
        ) : (
          <ClientLanding />
        )}
      </main>

      {/* Footer on Public Client Site */}
      {!isAdminRoute && <Footer />}

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ShipmentProvider>
          <MainApp />
        </ShipmentProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
