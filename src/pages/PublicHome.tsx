import React, { useState } from 'react';
import { db } from '../data/database';
import { KnowledgeArticle } from '../data/types';
import { Search, FileText, ChevronRight, AlertCircle, CheckCircle, Eye, Headphones, Search as SearchIcon, Send, X, Clock, User, Tag, MessageSquare } from 'lucide-react';

export function PublicHome() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<KnowledgeArticle[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [expandedCard, setExpandedCard] = useState<'none' | 'create' | 'consult'>('none');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', department: '', location: '',
    categoryId: '', typeId: '', subject: '', description: '', priority: 'medium',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [ticketInfo, setTicketInfo] = useState<{ number: string; token: string } | null>(null);
  
  // Consult states
  const [consultNumber, setConsultNumber] = useState('');
  const [consultToken, setConsultToken] = useState('');
  const [consultResult, setConsultResult] = useState<any>(null);
  const [consultError, setConsultError] = useState('');

  const categories = db.getCategories().filter(c => c.active && (c.scope === 'external' || c.scope === 'both'));
  const types = db.getTicketTypes().filter(t => t.active);
  const departments = db.getDepartments().filter(d => d.active);
  const locations = db.getLocations().filter(l => l.active);
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

  const toggleCard = (card: 'create' | 'consult') => {
    if (expandedCard === card) {
      setExpandedCard('none');
    } else {
      setExpandedCard(card);
    }
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'El nombre es obligatorio';
    if (!formData.email.trim()) errors.email = 'El correo es obligatorio';
    if (!formData.subject.trim()) errors.subject = 'El asunto es obligatorio';
    if (!formData.description.trim()) errors.description = 'La descripción es obligatoria';
    if (!formData.categoryId) errors.categoryId = 'Seleccione una categoría';
    if (!formData.typeId) errors.typeId = 'Seleccione un tipo';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
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

  const handleConsult = (e: React.FormEvent) => {
    e.preventDefault();
    setConsultError('');
    setConsultResult(null);
    
    if (!consultNumber.trim()) {
      setConsultError('Ingrese el número de ticket.');
      return;
    }
    
    // Allow consultation with just ticket number for demo
    let ticket = db.getTicketByNumber(consultNumber.trim().toUpperCase());
    
    // If token provided, verify it
    if (consultToken.trim() && ticket) {
      ticket = db.getTicketByToken(consultNumber.trim().toUpperCase(), consultToken.trim());
    }
    
    if (!ticket) {
      setConsultError('No se encontró ninguna solicitud con esos datos. Verifique el número ingresado.');
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

  return (
    <div className="min-h-screen">
      {/* Hero Section with Search */}
      <div className="bg-gradient-to-b from-blue-50 to-white pt-12 pb-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            ¿En qué podemos ayudarte?
          </h1>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Busca soluciones, guías y respuestas a las consultas más frecuentes antes de crear una solicitud de soporte.
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar artículos de ayuda..."
                className="w-full pl-12 pr-32 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base shadow-sm bg-white"
              />
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition text-sm"
              >
                Buscar
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Results */}
        {hasSearched && (
          <div className="mb-8 bg-white rounded-2xl shadow-sm border p-6">
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
                  <button key={article.id} onClick={() => setSelectedArticle(article)} className="w-full text-left p-4 rounded-xl border hover:border-blue-300 hover:bg-blue-50/50 transition">
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
            {categories.slice(0, 6).map(cat => (
              <button key={cat.id} onClick={() => handleCategoryClick(cat.id)} className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md hover:border-blue-200 transition text-left group">
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

        {/* Action Cards - Inline Expansion */}
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Card 1: Solicitar Soporte Técnico */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-300">
            <button 
              onClick={() => toggleCard('create')}
              className="w-full p-6 md:p-8 text-left hover:bg-gray-50/50 transition"
            >
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Headphones size={26} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Solicitar Soporte Técnico</h3>
                  <p className="text-gray-600 text-sm">
                    ¿Tienes un problema o necesitas asistencia? Registra tu solicitud para que nuestro equipo de soporte pueda ayudarte.
                  </p>
                </div>
                <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-transform ${expandedCard === 'create' ? 'rotate-180' : ''}`}>
                  <ChevronRight size={18} className="text-gray-500 -rotate-90" />
                </div>
              </div>
            </button>

            {/* Inline Form - Create Ticket */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedCard === 'create' ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="border-t px-6 md:px-8 py-6 bg-gray-50/50">
                {submitted && ticketInfo ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={32} className="text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">¡Solicitud registrada!</h3>
                    <p className="text-gray-600 mb-6">Su solicitud ha sido creada exitosamente.</p>
                    <div className="bg-white rounded-xl p-4 mb-4 text-left max-w-md mx-auto border">
                      <div className="mb-3">
                        <span className="text-sm text-gray-500">Número de ticket:</span>
                        <p className="text-lg font-bold text-blue-600">{ticketInfo.number}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Token de acceso:</span>
                        <p className="text-xs font-mono bg-gray-50 p-2 rounded border break-all">{ticketInfo.token}</p>
                      </div>
                    </div>
                    <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg mb-4 max-w-md mx-auto">
                      <strong>Importante:</strong> Guarde el token de acceso. Lo necesitará para consultar el estado de su solicitud.
                    </p>
                    <button 
                      onClick={() => { setSubmitted(false); setTicketInfo(null); setExpandedCard('none'); setFormData({ name: '', email: '', phone: '', department: '', location: '', categoryId: '', typeId: '', subject: '', description: '', priority: 'medium' }); }}
                      className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition"
                    >
                      Volver al inicio
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCreateTicket} className="max-w-2xl mx-auto space-y-4">
                    <h4 className="font-semibold text-gray-900 mb-4">Crear Nueva Solicitud</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                        <input 
                          type="text" 
                          value={formData.name} 
                          onChange={e => setFormData({...formData, name: e.target.value})} 
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          placeholder="Juan Pérez"
                        />
                        {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico *</label>
                        <input 
                          type="email" 
                          value={formData.email} 
                          onChange={e => setFormData({...formData, email: e.target.value})} 
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          placeholder="juan.perez@ejemplo.cl"
                        />
                        {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono / Anexo</label>
                        <input 
                          type="text" 
                          value={formData.phone} 
                          onChange={e => setFormData({...formData, phone: e.target.value})} 
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          placeholder="+56 9 1234 5678"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                        <select 
                          value={formData.department} 
                          onChange={e => setFormData({...formData, department: e.target.value})} 
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="">Seleccionar...</option>
                          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                        <select 
                          value={formData.categoryId} 
                          onChange={e => setFormData({...formData, categoryId: e.target.value})} 
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="">Seleccionar...</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                        </select>
                        {formErrors.categoryId && <p className="text-red-500 text-xs mt-1">{formErrors.categoryId}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de solicitud *</label>
                        <select 
                          value={formData.typeId} 
                          onChange={e => setFormData({...formData, typeId: e.target.value})} 
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="">Seleccionar...</option>
                          {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        {formErrors.typeId && <p className="text-red-500 text-xs mt-1">{formErrors.typeId}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación / Sede</label>
                        <select 
                          value={formData.location} 
                          onChange={e => setFormData({...formData, location: e.target.value})} 
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="">Seleccionar...</option>
                          {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nivel de urgencia</label>
                        <select 
                          value={formData.priority} 
                          onChange={e => setFormData({...formData, priority: e.target.value})} 
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="low">Baja</option>
                          <option value="medium">Media</option>
                          <option value="high">Alta</option>
                          <option value="critical">Crítica</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Asunto *</label>
                      <input 
                        type="text" 
                        value={formData.subject} 
                        onChange={e => setFormData({...formData, subject: e.target.value})} 
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="Describa brevemente el problema"
                      />
                      {formErrors.subject && <p className="text-red-500 text-xs mt-1">{formErrors.subject}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Detallada *</label>
                      <textarea 
                        rows={4} 
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})} 
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-white resize-none"
                        placeholder="Describa el problema con el mayor detalle posible: qué estaba haciendo, qué error aparece, cuándo comenzó..."
                      />
                      {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                      <button 
                        type="submit" 
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        <Send size={16} />
                        Enviar Solicitud de Soporte
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setExpandedCard('none')} 
                        className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Consultar Estado de Ticket */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-300">
            <button 
              onClick={() => toggleCard('consult')}
              className="w-full p-6 md:p-8 text-left hover:bg-gray-50/50 transition"
            >
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <SearchIcon size={26} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Consultar Estado de Ticket</h3>
                  <p className="text-gray-600 text-sm">
                    Revisa el progreso de tu solicitud ingresando el número asignado.
                  </p>
                </div>
                <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-transform ${expandedCard === 'consult' ? 'rotate-180' : ''}`}>
                  <ChevronRight size={18} className="text-gray-500 -rotate-90" />
                </div>
              </div>
            </button>

            {/* Inline Form - Consult Ticket */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedCard === 'consult' ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="border-t px-6 md:px-8 py-6 bg-gray-50/50">
                <div className="max-w-2xl mx-auto">
                  <h4 className="font-semibold text-gray-900 mb-4">Buscar mi Ticket</h4>
                  
                  <form onSubmit={handleConsult} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Número de Ticket</label>
                      <input 
                        type="text" 
                        value={consultNumber} 
                        onChange={e => setConsultNumber(e.target.value)} 
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                        placeholder="Ej: TK-AB12CD34"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Token de Acceso (opcional)</label>
                      <input 
                        type="text" 
                        value={consultToken} 
                        onChange={e => setConsultToken(e.target.value)} 
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                        placeholder="Token enviado a su correo"
                      />
                    </div>
                    {consultError && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                        {consultError}
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button 
                        type="submit" 
                        className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition flex items-center gap-2"
                      >
                        <SearchIcon size={16} />
                        Consultar Estado
                      </button>
                      <button 
                        type="button" 
                        onClick={() => { setExpandedCard('none'); setConsultResult(null); setConsultError(''); }} 
                        className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>

                  {/* Ticket Result */}
                  {consultResult && (
                    <div className="mt-6 bg-white rounded-xl border p-5">
                      <div className="flex items-center justify-between mb-4 pb-4 border-b">
                        <div>
                          <p className="text-sm text-gray-500">Ticket</p>
                          <p className="text-lg font-bold text-gray-900">{consultResult.ticketNumber}</p>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                          consultResult.status === 'resolved' ? 'bg-green-100 text-green-700' :
                          consultResult.status === 'closed' ? 'bg-gray-100 text-gray-700' :
                          consultResult.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {consultResult.status === 'new' ? 'Nuevo' :
                           consultResult.status === 'open' ? 'Abierto' :
                           consultResult.status === 'assigned' ? 'Asignado' :
                           consultResult.status === 'in_progress' ? 'En atención' :
                           consultResult.status === 'waiting_requester' ? 'Esperando respuesta' :
                           consultResult.status === 'resolved' ? 'Resuelto' :
                           consultResult.status === 'closed' ? 'Cerrado' :
                           consultResult.status}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Tag size={16} className="text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Asunto</p>
                            <p className="font-medium text-gray-900">{consultResult.subject}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Clock size={16} className="text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Fecha de creación</p>
                            <p className="font-medium text-gray-900">{new Date(consultResult.createdAt).toLocaleString('es-CL')}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <User size={16} className="text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Solicitante</p>
                            <p className="font-medium text-gray-900">{consultResult.requesterName}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-4 h-4 rounded-full bg-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Prioridad</p>
                            <p className="font-medium text-gray-900 capitalize">
                              {consultResult.priority === 'low' ? 'Baja' :
                               consultResult.priority === 'medium' ? 'Media' :
                               consultResult.priority === 'high' ? 'Alta' : 'Crítica'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Messages */}
                      {consultResult.messages.filter((m: any) => m.type === 'public').length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <MessageSquare size={14} /> Comunicaciones
                          </p>
                          <div className="space-y-2">
                            {consultResult.messages.filter((m: any) => m.type === 'public').map((msg: any) => (
                              <div key={msg.id} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium text-gray-900">{msg.authorName}</span>
                                  <span className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleString('es-CL')}</span>
                                </div>
                                <p className="text-sm text-gray-700">{msg.content}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <button 
                        onClick={() => { setConsultResult(null); setConsultNumber(''); setConsultToken(''); }}
                        className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        ← Buscar otro ticket
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
