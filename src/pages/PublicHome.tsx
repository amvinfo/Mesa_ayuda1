import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../data/database';
import { KnowledgeArticle, Category } from '../data/types';
import { Search, FileText, ChevronRight, AlertCircle, CheckCircle, Eye } from 'lucide-react';

export function PublicHome() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<KnowledgeArticle[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showConsultForm, setShowConsultForm] = useState(false);
  const [consultNumber, setConsultNumber] = useState('');
  const [consultToken, setConsultToken] = useState('');
  const [consultResult, setConsultResult] = useState<any>(null);
  const [consultError, setConsultError] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const navigate = useNavigate();
  const categories = db.getCategories().filter(c => c.active && (c.scope === 'external' || c.scope === 'both'));
  const settings = db.getSettings();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const results = db.searchExternalArticles(searchQuery, selectedCategory || undefined);
    setSearchResults(results);
    setHasSearched(true);
  };

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId);
    const articles = db.getArticlesByScope('external').filter(a => a.categoryId === catId);
    setSearchResults(articles);
    setHasSearched(true);
    setSearchQuery('');
  };

  const handleConsult = (e: React.FormEvent) => {
    e.preventDefault();
    setConsultError('');
    setConsultResult(null);
    if (!consultNumber.trim() || !consultToken.trim()) {
      setConsultError('Ingrese el número de ticket y el token de acceso.');
      return;
    }
    const ticket = db.getTicketByToken(consultNumber.trim().toUpperCase(), consultToken.trim());
    if (!ticket) {
      setConsultError('No se encontró ninguna solicitud con esos datos. Verifique el número y el token.');
      return;
    }
    setConsultResult(ticket);
  };

  // Article detail view
  if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => setSelectedArticle(null)} className="text-blue-600 hover:text-blue-800 mb-4 text-sm flex items-center gap-1">
          ← Volver a resultados
        </button>
        <article className="bg-white rounded-xl shadow-sm border p-6 lg:p-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Eye size={14} />
            <span>{selectedArticle.views} visualizaciones</span>
            <span className="mx-2">•</span>
            <span>Actualizado: {new Date(selectedArticle.updatedAt).toLocaleDateString('es-CL')}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{selectedArticle.title}</h1>
          <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
          <div className="mt-6 pt-4 border-t flex items-center gap-4">
            <span className="text-sm text-gray-500">¿Le fue útil este artículo?</span>
            <button className="text-sm px-3 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100">✓ Sí</button>
            <button className="text-sm px-3 py-1 bg-red-50 text-red-700 rounded-full hover:bg-red-100">✗ No</button>
          </div>
        </article>
      </div>
    );
  }

  // Consult result view
  if (consultResult) {
    const cat = db.getCategories().find(c => c.id === consultResult.categoryId);
    const statusLabels: Record<string, { label: string; color: string }> = {
      new: { label: 'Nuevo', color: 'bg-blue-100 text-blue-700' },
      open: { label: 'Abierto', color: 'bg-blue-100 text-blue-700' },
      assigned: { label: 'Asignado', color: 'bg-indigo-100 text-indigo-700' },
      in_progress: { label: 'En atención', color: 'bg-yellow-100 text-yellow-700' },
      waiting_requester: { label: 'Esperando respuesta', color: 'bg-orange-100 text-orange-700' },
      resolved: { label: 'Resuelto', color: 'bg-green-100 text-green-700' },
      closed: { label: 'Cerrado', color: 'bg-gray-100 text-gray-700' },
      escalated: { label: 'Escalado', color: 'bg-red-100 text-red-700' },
    };
    const priorityLabels: Record<string, string> = { low: 'Baja', medium: 'Media', high: 'Alta', critical: 'Crítica' };
    const priorityColors: Record<string, string> = { low: 'bg-gray-100 text-gray-700', medium: 'bg-blue-100 text-blue-700', high: 'bg-orange-100 text-orange-700', critical: 'bg-red-100 text-red-700' };
    const publicMessages = consultResult.messages.filter((m: any) => m.type === 'public');

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => { setConsultResult(null); setConsultNumber(''); setConsultToken(''); }} className="text-blue-600 hover:text-blue-800 mb-4 text-sm">← Nueva consulta</button>
        <div className="bg-white rounded-xl shadow-sm border p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Ticket {consultResult.ticketNumber}</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusLabels[consultResult.status]?.color || 'bg-gray-100'}`}>
              {statusLabels[consultResult.status]?.label || consultResult.status}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div><span className="text-sm text-gray-500">Asunto:</span><p className="font-medium">{consultResult.subject}</p></div>
            <div><span className="text-sm text-gray-500">Categoría:</span><p className="font-medium">{cat?.name || '-'}</p></div>
            <div><span className="text-sm text-gray-500">Prioridad:</span><span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${priorityColors[consultResult.priority]}`}>{priorityLabels[consultResult.priority]}</span></div>
            <div><span className="text-sm text-gray-500">Fecha de creación:</span><p className="font-medium">{new Date(consultResult.createdAt).toLocaleString('es-CL')}</p></div>
            <div><span className="text-sm text-gray-500">Última actualización:</span><p className="font-medium">{new Date(consultResult.updatedAt).toLocaleString('es-CL')}</p></div>
          </div>
          {publicMessages.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Comunicaciones</h3>
              <div className="space-y-3">
                {publicMessages.map((msg: any) => (
                  <div key={msg.id} className={`p-3 rounded-lg ${msg.authorId ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50 border'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{msg.authorName}</span>
                      <span className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleString('es-CL')}</span>
                    </div>
                    <p className="text-sm text-gray-700">{msg.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Create ticket form
  if (showCreateForm) {
    return <CreateTicketForm onBack={() => setShowCreateForm(false)} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero / Search */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">¿En qué podemos ayudarte?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">Busca soluciones, guías y respuestas a las consultas más frecuentes antes de crear una solicitud de soporte.</p>
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar artículos de ayuda..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition text-sm">Buscar</button>
        </form>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="mb-8 bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              {selectedCategory ? `Artículos en: ${categories.find(c => c.id === selectedCategory)?.name}` : `Resultados para "${searchQuery}"`}
            </h3>
            <button onClick={() => { setHasSearched(false); setSearchResults([]); setSelectedCategory(''); }} className="text-sm text-blue-600 hover:text-blue-800">Limpiar</button>
          </div>
          {searchResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText size={40} className="mx-auto mb-3 opacity-50" />
              <p>No se encontraron artículos con los criterios de búsqueda.</p>
              <p className="text-sm mt-2">Intente con otras palabras clave o cree una solicitud de soporte.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map(article => (
                <button key={article.id} onClick={() => setSelectedArticle(article)} className="w-full text-left p-4 rounded-lg border hover:border-blue-300 hover:bg-blue-50/50 transition">
                  <h4 className="font-medium text-gray-900">{article.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{article.summary}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{categories.find(c => c.id === article.categoryId)?.name}</span>
                    <span>•</span>
                    <span>{article.views} vistas</span>
                    <span>•</span>
                    <span>{new Date(article.updatedAt).toLocaleDateString('es-CL')}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Categories */}
      <div className="mb-10">
        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Categorías de Ayuda</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => handleCategoryClick(cat.id)} className="bg-white p-5 rounded-xl shadow-sm border hover:shadow-md hover:border-blue-200 transition text-left group">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">{cat.name}</h4>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{cat.description}</p>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-500 mt-1" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Create Ticket Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">Solicitar Soporte Técnico</h3>
          <p className="text-blue-100 text-sm mb-5">¿Tienes un problema o necesitas asistencia? Registra tu solicitud para que nuestro equipo de soporte pueda ayudarte.</p>
          <button onClick={() => setShowCreateForm(true)} className="bg-white text-blue-700 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-50 transition">
            Crear solicitud
          </button>
        </div>

        {/* Consult Ticket Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <CheckCircle size={24} className="text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Consultar Estado de Ticket</h3>
          <p className="text-gray-600 text-sm mb-5">Revisa el progreso de tu solicitud ingresando el número asignado.</p>
          <form onSubmit={handleConsult} className="space-y-3">
            <input
              type="text"
              value={consultNumber}
              onChange={(e) => setConsultNumber(e.target.value)}
              placeholder="Número de ticket (ej: TK-AB12CD34)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <input
              type="text"
              value={consultToken}
              onChange={(e) => setConsultToken(e.target.value)}
              placeholder="Token de acceso (enviado a su correo)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            {consultError && <p className="text-red-600 text-xs">{consultError}</p>}
            <button type="submit" className="w-full bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-green-700 transition">
              Consultar solicitud
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Create Ticket Form Component
function CreateTicketForm({ onBack }: { onBack: () => void }) {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', department: '', location: '',
    categoryId: '', typeId: '', subject: '', description: '', priority: 'medium',
  });
  const [submitted, setSubmitted] = useState(false);
  const [ticketInfo, setTicketInfo] = useState<{ number: string; token: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = db.getCategories().filter(c => c.active && (c.scope === 'external' || c.scope === 'both'));
  const types = db.getTicketTypes().filter(t => t.active);
  const departments = db.getDepartments().filter(d => d.active);
  const locations = db.getLocations().filter(l => l.active);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!formData.email.trim()) newErrors.email = 'El correo es obligatorio';
    if (!formData.subject.trim()) newErrors.subject = 'El asunto es obligatorio';
    if (!formData.description.trim()) newErrors.description = 'La descripción es obligatoria';
    if (!formData.categoryId) newErrors.categoryId = 'Seleccione una categoría';
    if (!formData.typeId) newErrors.typeId = 'Seleccione un tipo';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const ticketNumber = db.generateTicketNumber();
    const accessToken = db.generateAccessToken();
    const now = new Date().toISOString();

    const ticket = {
      id: crypto.randomUUID(),
      ticketNumber,
      accessTokens: [accessToken],
      requesterName: formData.name,
      requesterEmail: formData.email,
      requesterPhone: formData.phone,
      department: formData.department,
      location: formData.location,
      categoryId: formData.categoryId,
      typeId: formData.typeId,
      subject: formData.subject,
      description: formData.description,
      priority: formData.priority as any,
      status: 'new' as const,
      createdAt: now,
      updatedAt: now,
      source: 'public' as const,
      messages: [],
      history: [{ id: crypto.randomUUID(), ticketId: '', action: 'created', description: 'Ticket creado desde portal público', userName: formData.name, createdAt: now }],
      attachments: [],
    };

    db.createTicket(ticket);
    setTicketInfo({ number: ticketNumber, token: accessToken });
    setSubmitted(true);
  };

  if (submitted && ticketInfo) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Solicitud registrada!</h2>
          <p className="text-gray-600 mb-6">Su solicitud ha sido creada exitosamente. Guarde esta información para consultar el estado.</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="mb-3">
              <span className="text-sm text-gray-500">Número de ticket:</span>
              <p className="text-lg font-bold text-blue-600">{ticketInfo.number}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Token de acceso (guárdelo de forma segura):</span>
              <p className="text-sm font-mono bg-white p-2 rounded border break-all">{ticketInfo.token}</p>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 text-left">
            <p className="text-sm text-yellow-800"><strong>Importante:</strong> Guarde el token de acceso. Lo necesitará junto con el número de ticket para consultar el estado de su solicitud. El token también ha sido enviado al correo registrado.</p>
          </div>
          <button onClick={onBack} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={onBack} className="text-blue-600 hover:text-blue-800 mb-4 text-sm">← Volver al inicio</button>
      <div className="bg-white rounded-xl shadow-sm border p-6 lg:p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Crear Solicitud de Soporte</h2>
        <p className="text-gray-600 text-sm mb-6">Complete el formulario con la información de su solicitud. Los campos marcados con * son obligatorios.</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono / Anexo</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
              <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar...</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación / Sede</label>
              <select value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar...</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
              <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
              {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de solicitud *</label>
              <select value={formData.typeId} onChange={e => setFormData({...formData, typeId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar...</option>
                {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {errors.typeId && <p className="text-red-500 text-xs mt-1">{errors.typeId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nivel de urgencia</label>
              <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asunto *</label>
            <input type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción detallada del problema *</label>
            <textarea rows={5} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="Describa el problema con el mayor detalle posible: qué estaba haciendo, qué error aparece, cuándo comenzó, etc." />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition text-sm">Enviar solicitud</button>
            <button type="button" onClick={onBack} className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
