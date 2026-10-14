import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../data/database';
import { Menu, X, LayoutDashboard, Ticket, BookOpen, Settings, LogOut, User, ChevronDown, Search } from 'lucide-react';

/* =====================================================
   PUBLIC LAYOUT - Estándar Kit Digital Gob.cl
   ===================================================== */
export function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = db.getSettings();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F5F5' }}>
      {/* Skip link para accesibilidad */}
      <a href="#main-content" className="skip-link">Saltar al contenido principal</a>

      {/* Barra superior institucional Gob.cl */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        {/* Barra superior - Identidad oficial */}
        <div className="border-b border-gray-100" style={{ backgroundColor: '#004A83' }}>
          <div className="container-institutional">
            <div className="flex items-center justify-between h-10">
              <div className="flex items-center gap-2">
                <span className="text-white text-xs font-semibold tracking-wide">
                  GOBIERNO DE CHILE
                </span>
                <span className="text-white/60 text-xs">|</span>
                <span className="text-white text-xs font-medium">
                  HELPDESK
                </span>
              </div>
              <Link 
                to="/login" 
                className="text-white text-xs font-medium hover:text-white/90 transition flex items-center gap-1.5"
                aria-label="Acceso para funcionarios"
              >
                <User size={14} />
                <span className="hidden sm:inline">Acceso Funcionarios</span>
                <span className="sm:hidden">Funcionarios</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Barra principal con logo y navegación */}
        <div className="container-institutional">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo institucional */}
            <Link to="/" className="flex items-center gap-3 group">
              <div 
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg md:text-xl transition group-hover:scale-105"
                style={{ backgroundColor: '#0066B3' }}
              >
                {settings.logo}
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base md:text-lg font-bold leading-tight" style={{ color: '#004A83' }}>
                  Mesa de Ayuda
                </h1>
                <p className="text-xs text-gray-500 leading-tight">
                  Sistema de Soporte Técnico
                </p>
              </div>
            </Link>

            {/* Navegación desktop */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Navegación principal">
              <Link 
                to="/" 
                className="px-4 py-2 rounded-lg text-sm font-medium transition"
                style={{ color: '#424242' }}
              >
                Inicio
              </Link>
              <Link 
                to="/knowledge" 
                className="px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-blue-50"
                style={{ color: '#424242' }}
              >
                Base de Conocimiento
              </Link>
              <Link 
                to="/login"
                className="ml-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: '#0066B3' }}
              >
                Iniciar Sesión
              </Link>
            </nav>

            {/* Menú mobile */}
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" aria-label="Abrir menú">
              <Menu size={24} style={{ color: '#424242' }} />
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main id="main-content" className="flex-1">
        {children}
      </main>

      {/* Footer institucional */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="container-institutional py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-bold mb-3" style={{ color: '#004A83' }}>
                Mesa de Ayuda
              </h3>
              <p className="text-sm text-gray-600">
                Sistema de soporte técnico institucional para la ciudadanía y funcionarios.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-3" style={{ color: '#004A83' }}>
                Contacto
              </h3>
              <p className="text-sm text-gray-600">
                {settings.contactEmail}<br />
                {settings.contactPhone}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-3" style={{ color: '#004A83' }}>
                Enlaces
              </h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="text-gray-600 hover:text-blue-700">Inicio</Link></li>
                <li><Link to="/knowledge" className="text-gray-600 hover:text-blue-700">Base de Conocimiento</Link></li>
                <li><Link to="/login" className="text-gray-600 hover:text-blue-700">Acceso Funcionarios</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-6 text-center">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Gobierno de Chile - {settings.institutionName}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* =====================================================
   INTERNAL LAYOUT - Panel de Funcionarios
   ===================================================== */
export function InternalLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const settings = db.getSettings();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Panel Principal', icon: LayoutDashboard, roles: ['admin', 'supervisor', 'technician', 'requester'] },
    { path: '/tickets', label: 'Tickets', icon: Ticket, roles: ['admin', 'supervisor', 'technician', 'requester'] },
    { path: '/knowledge-internal', label: 'Base de Conocimiento', icon: BookOpen, roles: ['admin', 'supervisor', 'technician', 'editor'] },
    { path: '/admin', label: 'Administración', icon: Settings, roles: ['admin'] },
  ];

  const filteredNav = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F5F5F5' }}>
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="navigation"
        aria-label="Menú principal"
      >
        {/* Header del sidebar */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: '#0066B3' }}
          >
            {settings.logo}
          </div>
          <div>
            <h2 className="font-bold text-sm" style={{ color: '#004A83' }}>Mesa de Ayuda</h2>
            <p className="text-xs text-gray-500">Panel Funcionarios</p>
          </div>
        </div>

        {/* Navegación */}
        <nav className="p-4 space-y-1">
          {filteredNav.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                location.pathname.startsWith(item.path)
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={location.pathname.startsWith(item.path) ? { backgroundColor: '#0066B3' } : {}}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header interno */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-14 flex items-center justify-between px-4 lg:px-6">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Abrir menú lateral"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex-1" />
          
          {/* User menu */}
          <div className="relative">
            <button 
              onClick={() => setUserMenuOpen(!userMenuOpen)} 
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#E8F4FD' }}
              >
                <User size={16} style={{ color: '#0066B3' }} />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role === 'admin' ? 'Administrador' : 
                   user?.role === 'supervisor' ? 'Supervisor' : 
                   user?.role === 'technician' ? 'Técnico' : 
                   user?.role === 'editor' ? 'Editor' : 'Solicitante'}
                </p>
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
            
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium">{user?.fullName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
