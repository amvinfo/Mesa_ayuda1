import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../data/database';
import { Lock, Mail, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';

/* =====================================================
   LOGIN PAGE - Acceso Funcionarios
   Estándar Kit Digital - Gobierno de Chile
   ===================================================== */
export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const settings = db.getSettings();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    setTimeout(() => {
      const result = login(username, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F5F5' }}>
      {/* Barra superior institucional */}
      <header className="border-b border-gray-200" style={{ backgroundColor: '#004A83' }}>
        <div className="container-institutional">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center gap-2">
              <span className="text-white text-xs font-semibold tracking-wide">GOBIERNO DE CHILE</span>
              <span className="text-white/60 text-xs">|</span>
              <span className="text-white text-xs font-medium">HELPDESK</span>
            </div>
            <a href="#/" className="text-white text-xs font-medium hover:text-white/90 transition">
              ← Volver al portal
            </a>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-md">
          {/* Logo institucional */}
          <div className="text-center mb-8">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold"
              style={{ backgroundColor: '#0066B3' }}
            >
              {settings.logo}
            </div>
            <h1 className="text-xl font-bold" style={{ color: '#004A83' }}>
              Mesa de Ayuda
            </h1>
            <p className="text-sm text-gray-600 mt-1">Acceso para Funcionarios</p>
          </div>
          
          {/* Card de login */}
          <div className="card-institutional p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#E8F4FD' }}
              >
                <Shield size={20} style={{ color: '#0066B3' }} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Iniciar Sesión</h2>
                <p className="text-xs text-gray-500">Acceso seguro al panel de soporte</p>
              </div>
            </div>

            {error && (
              <div className="rounded-lg p-3 mb-4 flex items-start gap-2" style={{ backgroundColor: '#FFEBEE', border: '1px solid #FFCDD2' }} role="alert">
                <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-username" className="label-institutional">
                  Usuario o correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} aria-hidden="true" />
                  <input
                    id="login-username"
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="input-institutional pl-10"
                    placeholder="usuario@gob.cl"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="login-password" className="label-institutional">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} aria-hidden="true" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-institutional pl-10 pr-10"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Ingresando...' : 'Iniciar Sesión'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button className="text-sm font-medium transition hover:opacity-80" style={{ color: '#0066B3' }}>
                ¿Olvidó su contraseña?
              </button>
            </div>
          </div>

          {/* Credenciales demo */}
          <div className="mt-6 rounded-xl p-4 border" style={{ backgroundColor: '#E8F4FD', borderColor: '#B3D9F2' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: '#004A83' }}>
              Credenciales de demostración:
            </p>
            <div className="text-xs space-y-1" style={{ color: '#004A83' }}>
              <p><strong>Administrador:</strong> admin / admin123</p>
              <p><strong>Supervisor:</strong> supervisor / admin123</p>
              <p><strong>Técnico:</strong> tecnico / admin123</p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            <a href="#/" className="font-medium transition hover:opacity-80" style={{ color: '#0066B3' }}>
              ← Volver al portal público
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-4">
        <div className="container-institutional text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Gobierno de Chile - {settings.institutionName}
          </p>
        </div>
      </footer>
    </div>
  );
}
