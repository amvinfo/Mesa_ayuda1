import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../data/database';
import { Menu, X, Home, LayoutDashboard, Ticket, BookOpen, Settings, LogOut, User, ChevronDown } from 'lucide-react';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = db.getSettings();
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-3xl">{settings.logo}</span>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{settings.systemName}</h1>
                <p className="text-xs text-gray-500">{settings.institutionName}</p>
              </div>
            </Link>
            <nav className="flex items-center gap-4">
              <Link to="/" className="text-gray-600 hover:text-blue-600 text-sm font-medium">Inicio</Link>
              <Link to="/knowledge" className="text-gray-600 hover:text-blue-600 text-sm font-medium">Base de Conocimiento</Link>
              <Link to="/tickets" className="text-gray-600 hover:text-blue-600 text-sm font-medium hidden sm:inline">Mis Tickets</Link>
              <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">Iniciar Sesión</Link>
            </nav>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="bg-white border-t mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} {settings.institutionName} - {settings.systemName}</p>
          <p className="mt-1">Contacto: {settings.contactEmail} | {settings.contactPhone}</p>
        </div>
      </footer>
    </div>
  );
}

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
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:in-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-2 p-4 border-b">
          <span className="text-2xl">{settings.logo}</span>
          <div>
            <h2 className="font-bold text-gray-900 text-sm">{settings.systemName}</h2>
            <p className="text-xs text-gray-500">{settings.institutionName}</p>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {filteredNav.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                location.pathname.startsWith(item.path)
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition">
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm border-b h-14 flex items-center justify-between px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <div className="relative">
            <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <User size={16} className="text-blue-600" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role === 'admin' ? 'Administrador' : user?.role === 'supervisor' ? 'Supervisor' : user?.role === 'technician' ? 'Técnico' : user?.role === 'editor' ? 'Editor' : 'Solicitante'}</p>
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium">{user?.fullName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
