import React, { useState, useRef, useEffect } from 'react';
import { db } from '../data/database';
import { KnowledgeArticle } from '../data/types';
import { Search, FileText, ChevronRight, CheckCircle, Eye, Headphones, Send, Clock, User, Tag, MessageSquare, AlertCircle, ArrowDown } from 'lucide-react';

/* =====================================================
   PUBLIC HOME - Página Principal
   Estándar Kit Digital - Gobierno de Chile
   ===================================================== */
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

  const createFormRef = useRef<HTMLDivElement>(null);
  const consultFormRef = useRef<HTMLDivElement>(null);

  // Scroll suave al expandir
  useEffect(() => {
    if (expandedCard === 'create' && createFormRef.current) {
      setTimeout(() => {
        createFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else if (expandedCard === 'consult' && consultFormRef.current) {
      setTimeout(() => {
        consultFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [expandedCard]);

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
    if (!formData.name.trim()) errors.name = 'El nombre completo es obligatorio';
    if (!formData.email.trim()) errors.email = 'El correo electrónico es obligatorio';
    if (!formData.subject.trim()) errors.subject = 'El asunto es obligatorio';
    if (!formData.description.trim()) errors.description = 'La descripción es obligatoria';
    if (!formData.categoryId) errors.categoryId = 'Seleccione una categoría';
    if (!formData.typeId) errors.typeId = 'Seleccione un tipo de solicitud';

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
    
    let ticket = db.getTicketByNumber(consultNumber.trim().toUpperCase());
    
    if (consultToken.trim() && ticket) {
      ticket = db.getTicketByToken(consultNumber.trim().toUpperCase(), consultToken.trim());
    }
    
    if (!ticket) {
      setConsultError('No se encontró ninguna solicitud con esos datos. Verifique el número ingresado.');
      return;
    }
    setConsultResult(ticket);
  };

  // Vista detalle de artículo
  if (selectedArticle) {
    return (
      <div className="container-institutional py-8">
        <button 
          onClick={() => setSelectedArticle(null)} 
          className="text-sm font-medium mb-4 inline-flex items-center gap-1 transition hover:opacity-80"
          style={{ color: '#0066B3' }}
        >
          ← Volver a resultados
        </button>
        <article className="card-institutional p-6 md:p-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Eye size={14} />
            <span>{selectedArticle.views} visualizaciones</span>
            <span className="mx-2">•</span>
            <span>Actualizado: {new Date(selectedArticle.updatedAt).toLocaleDateString('es-CL')}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#004A83' }}>
            {selectedArticle.title}
          </h1>
          <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
          <div className="mt-6 pt-4 border-t border-gray-200 flex items-center gap-4">
            <span className="text-sm text-gray-500">¿Le fue útil este artículo?</span>
            <button className="text-sm px-3 py-1.5 rounded-full font-medium transition" style={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}>✓ Sí</button>
            <button className="text-sm px-3 py-1.5 rounded-full font-medium transition" style={{ backgroundColor: '#FFEBEE', color: '#C62828' }}>✗ No</button>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="pb-12">
      {/* Hero Section - Buscador Principal */}
      <section className="py-10 md:py-16" style={{ background: 'linear-gradient(180deg, #E8F4FD 0%, #F5F5F5 100%)' }}>
        <div className="container-institutional text-center">
          <h1 className="text-2xl md:text-4xl font-bold mb-3" style={{ color: '#004A83' }}>
            ¿En qué podemos ayudarte?
          </h1>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-sm md:text-base">
            Busca soluciones, guías y respuestas a las consultas más frecuentes antes de crear una solicitud de soporte.
          </p>
          
          {/* Buscador destacado */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search 
                className="absolute left-4 top-1/2 -translate-y-1/2" 
                size={20} 
                style={{ color: '#9E9E9E' }}
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar artículos de ayuda..."
                className="input-institutional pl-12 pr-36 py-4 text-base rounded-xl"
                aria-label="Buscar en la base de conocimiento"
              />
              <button 
                type="submit" 
                className="btn-primary absolute right-2 top-1/2 -translate-y-1/2 py-2.5 px-5 rounded-lg"
              >
                Buscar
              </button>
            </div>
          </form>
        </div>
      </section>

      <div className="container-institutional py-8">
        {/* Resultados de búsqueda */}
        {hasSearched && (
          <div className="card-institutional p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: '#004A83' }}>
                {selectedCategory 
                  ? `Artículos en: ${categories.find(c => c.id === selectedCategory)?.name}` 
                  : `Resultados para "${searchQuery}"`}
              </h2>
              <button 
                onClick={() => { setHasSearched(false); setSearchResults([]); setSelectedCategory(''); }} 
                className="text-sm font-medium transition hover:opacity-80"
                style={{ color: '#0066B3' }}
              >
                Limpiar
              </button>
            </div>
            {searchResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText size={40} className="mx-auto mb-3 opacity-50" />
                <p className="font-medium">No se encontraron artículos</p>
                <p className="text-sm mt-2">Intente con otras palabras clave o cree una solicitud de soporte.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map(article => (
                  <button 
                    key={article.id} 
                    onClick={() => setSelectedArticle(article)} 
                    className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition text-left"
                    style={{ backgroundColor: '#FAFAFA' }}
                  >
                    <h4 className="font-semibold text-gray-900">{article.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{article.summary}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>{categories.find(c => c.id === article.categoryId)?.name}</span>
                      <span>•</span>
                      <span>{article.views} vistas</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Categorías de ayuda */}
        <section className="mb-10" aria-labelledby="categories-heading">
          <h2 id="categories-heading" className="text-xl font-bold text-center mb-6" style={{ color: '#004A83' }}>
            Categorías de Ayuda
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.slice(0, 6).map(cat => (
              <button 
                key={cat.id} 
                onClick={() => handleCategoryClick(cat.id)} 
                className="card-institutional p-5 text-left group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{cat.description}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-500 mt-1 transition" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* =====================================================
            TARJETAS DE ACCIÓN RÁPIDA - Comportamiento Inline
            ===================================================== */}
        <section className="max-w-4xl mx-auto" aria-labelledby="quick-actions-heading">
          <h2 id="quick-actions-heading" className="sr-only">Acciones rápidas</h2>
          
          <div className="space-y-5">
            {/* TARJETA 1: Solicitar Soporte Técnico */}
            <div className="card-institutional">
              <button 
                onClick={() => toggleCard('create')}
                className="w-full p-6 md:p-8 text-left transition group"
                aria-expanded={expandedCard === 'create'}
                aria-controls="create-form-panel"
              >
                <div className="flex items-start gap-4 md:gap-5">
                  {/* Ícono circular */}
                  <div 
                    className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shrink-0 transition group-hover:scale-105"
                    style={{ backgroundColor: '#E8F4FD' }}
                    aria-hidden="true"
                  >
                    <Headphones size={28} style={{ color: '#0066B3' }} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                      Solicitar Soporte Técnico
                    </h3>
                    <p className="text-sm md:text-base text-gray-600">
                      ¿Tienes un problema o necesitas asistencia? Registra tu solicitud para que nuestro equipo de soporte pueda ayudarte.
                    </p>
                  </div>
                  
                  {/* Indicador de expansión */}
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${expandedCard === 'create' ? 'rotate-180' : ''}`}
                    style={{ backgroundColor: '#F5F5F5' }}
                    aria-hidden="true"
                  >
                    <ArrowDown size={18} style={{ color: '#616161' }} />
                  </div>
                </div>
              </button>

              {/* Panel de formulario inline */}
              <div 
                id="create-form-panel"
                ref={createFormRef}
                className={`transition-all duration-400 ease-in-out overflow-hidden ${expandedCard === 'create' ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
                role="region"
                aria-label="Formulario de solicitud de soporte"
              >
                <div className="border-t border-gray-200 px-6 md:px-8 py-6 md:py-8" style={{ backgroundColor: '#FAFAFA' }}>
                  {submitted && ticketInfo ? (
                    /* Mensaje de confirmación */
                    <div className="text-center py-6 max-w-md mx-auto">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{ backgroundColor: '#E8F5E9' }}
                      >
                        <CheckCircle size={32} style={{ color: '#2E7D32' }} />
                      </div>
                      <h3 className="text-xl font-bold mb-2" style={{ color: '#004A83' }}>
                        ¡Solicitud registrada exitosamente!
                      </h3>
                      <p className="text-gray-600 mb-6 text-sm">
                        Su solicitud ha sido creada. Guarde esta información para consultar el estado.
                      </p>
                      <div className="bg-white rounded-xl p-4 mb-4 text-left border border-gray-200">
                        <div className="mb-3">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Número de ticket</span>
                          <p className="text-lg font-bold" style={{ color: '#0066B3' }}>{ticketInfo.number}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Token de acceso</span>
                          <p className="text-xs font-mono bg-gray-50 p-2 rounded border border-gray-200 break-all mt-1">{ticketInfo.token}</p>
                        </div>
                      </div>
                      <div className="rounded-lg p-3 mb-5 text-left text-sm" style={{ backgroundColor: '#FFF8E1', border: '1px solid #FFE082' }}>
                        <p style={{ color: '#F57F17' }}>
                          <strong>Importante:</strong> Guarde el token de acceso. Lo necesitará junto con el número de ticket para consultar el estado de su solicitud.
                        </p>
                      </div>
                      <button 
                        onClick={() => { 
                          setSubmitted(false); 
                          setTicketInfo(null); 
                          setExpandedCard('none'); 
                          setFormData({ name: '', email: '', phone: '', department: '', location: '', categoryId: '', typeId: '', subject: '', description: '', priority: 'medium' }); 
                        }}
                        className="btn-primary"
                      >
                        Volver al inicio
                      </button>
                    </div>
                  ) : (
                    /* Formulario de creación */
                    <form onSubmit={handleCreateTicket} className="max-w-2xl mx-auto">
                      <h4 className="text-lg font-semibold mb-5" style={{ color: '#004A83' }}>
                        Crear Nueva Solicitud
                      </h4>
                      
                      <div className="space-y-4">
                        {/* Campos principales - mobile-first */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="create-name" className="label-institutional">
                              Nombre Completo <span className="text-red-500">*</span>
                            </label>
                            <input 
                              id="create-name"
                              type="text" 
                              value={formData.name} 
                              onChange={e => setFormData({...formData, name: e.target.value})} 
                              className="input-institutional"
                              placeholder="Ej: Juan Pérez González"
                              required
                              aria-required="true"
                              aria-invalid={!!formErrors.name}
                            />
                            {formErrors.name && <p className="text-red-600 text-xs mt-1" role="alert">{formErrors.name}</p>}
                          </div>
                          
                          <div>
                            <label htmlFor="create-email" className="label-institutional">
                              Correo Electrónico <span className="text-red-500">*</span>
                            </label>
                            <input 
                              id="create-email"
                              type="email" 
                              value={formData.email} 
                              onChange={e => setFormData({...formData, email: e.target.value})} 
                              className="input-institutional"
                              placeholder="Ej: juan.perez@gob.cl"
                              required
                              aria-required="true"
                              aria-invalid={!!formErrors.email}
                            />
                            {formErrors.email && <p className="text-red-600 text-xs mt-1" role="alert">{formErrors.email}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="create-category" className="label-institutional">
                              Categoría <span className="text-red-500">*</span>
                            </label>
                            <select 
                              id="create-category"
                              value={formData.categoryId} 
                              onChange={e => setFormData({...formData, categoryId: e.target.value})} 
                              className="input-institutional"
                              required
                              aria-required="true"
                            >
                              <option value="">Seleccionar categoría...</option>
                              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                            </select>
                            {formErrors.categoryId && <p className="text-red-600 text-xs mt-1" role="alert">{formErrors.categoryId}</p>}
                          </div>
                          
                          <div>
                            <label htmlFor="create-type" className="label-institutional">
                              Tipo de Solicitud <span className="text-red-500">*</span>
                            </label>
                            <select 
                              id="create-type"
                              value={formData.typeId} 
                              onChange={e => setFormData({...formData, typeId: e.target.value})} 
                              className="input-institutional"
                              required
                              aria-required="true"
                            >
                              <option value="">Seleccionar tipo...</option>
                              {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            {formErrors.typeId && <p className="text-red-600 text-xs mt-1" role="alert">{formErrors.typeId}</p>}
                          </div>
                        </div>

                        <div>
                          <label htmlFor="create-subject" className="label-institutional">
                            Asunto <span className="text-red-500">*</span>
                          </label>
                          <input 
                            id="create-subject"
                            type="text" 
                            value={formData.subject} 
                            onChange={e => setFormData({...formData, subject: e.target.value})} 
                            className="input-institutional"
                            placeholder="Describa brevemente el problema"
                            required
                            aria-required="true"
                            aria-invalid={!!formErrors.subject}
                          />
                          {formErrors.subject && <p className="text-red-600 text-xs mt-1" role="alert">{formErrors.subject}</p>}
                        </div>

                        <div>
                          <label htmlFor="create-description" className="label-institutional">
                            Descripción Detallada <span className="text-red-500">*</span>
                          </label>
                          <textarea 
                            id="create-description"
                            rows={4} 
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})} 
                            className="input-institutional resize-none"
                            placeholder="Describa el problema con el mayor detalle posible: qué estaba haciendo, qué error aparece, cuándo comenzó..."
                            required
                            aria-required="true"
                            aria-invalid={!!formErrors.description}
                          />
                          {formErrors.description && <p className="text-red-600 text-xs mt-1" role="alert">{formErrors.description}</p>}
                        </div>
                      </div>
                      
                      {/* Botones de acción */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-6">
                        <button type="submit" className="btn-primary">
                          <Send size={16} />
                          Enviar Solicitud de Soporte
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setExpandedCard('none')} 
                          className="btn-secondary"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* TARJETA 2: Consultar Estado de Ticket */}
            <div className="card-institutional">
              <button 
                onClick={() => toggleCard('consult')}
                className="w-full p-6 md:p-8 text-left transition group"
                aria-expanded={expandedCard === 'consult'}
                aria-controls="consult-form-panel"
              >
                <div className="flex items-start gap-4 md:gap-5">
                  {/* Ícono circular */}
                  <div 
                    className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shrink-0 transition group-hover:scale-105"
                    style={{ backgroundColor: '#E8F5E9' }}
                    aria-hidden="true"
                  >
                    <Search size={28} style={{ color: '#2E7D32' }} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                      Consultar Estado de Ticket
                    </h3>
                    <p className="text-sm md:text-base text-gray-600">
                      Revisa el progreso de tu solicitud ingresando el número asignado.
                    </p>
                  </div>
                  
                  {/* Indicador de expansión */}
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${expandedCard === 'consult' ? 'rotate-180' : ''}`}
                    style={{ backgroundColor: '#F5F5F5' }}
                    aria-hidden="true"
                  >
                    <ArrowDown size={18} style={{ color: '#616161' }} />
                  </div>
                </div>
              </button>

              {/* Panel de consulta inline */}
              <div 
                id="consult-form-panel"
                ref={consultFormRef}
                className={`transition-all duration-400 ease-in-out overflow-hidden ${expandedCard === 'consult' ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
                role="region"
                aria-label="Formulario de consulta de ticket"
              >
                <div className="border-t border-gray-200 px-6 md:px-8 py-6 md:py-8" style={{ backgroundColor: '#FAFAFA' }}>
                  <div className="max-w-2xl mx-auto">
                    <h4 className="text-lg font-semibold mb-5" style={{ color: '#004A83' }}>
                      Buscar mi Ticket
                    </h4>
                    
                    {!consultResult ? (
                      <form onSubmit={handleConsult} className="space-y-4">
                        <div>
                          <label htmlFor="consult-number" className="label-institutional">
                            Número de Ticket
                          </label>
                          <input 
                            id="consult-number"
                            type="text" 
                            value={consultNumber} 
                            onChange={e => setConsultNumber(e.target.value)} 
                            className="input-institutional"
                            placeholder="Ej: TK-AB12CD34"
                            aria-describedby="consult-help"
                          />
                          <p id="consult-help" className="text-xs text-gray-500 mt-1">
                            Ingrese el número de ticket que recibió al crear su solicitud.
                          </p>
                        </div>
                        
                        <div>
                          <label htmlFor="consult-token" className="label-institutional">
                            Token de Acceso <span className="text-gray-400 font-normal">(opcional)</span>
                          </label>
                          <input 
                            id="consult-token"
                            type="text" 
                            value={consultToken} 
                            onChange={e => setConsultToken(e.target.value)} 
                            className="input-institutional"
                            placeholder="Token enviado a su correo"
                          />
                        </div>

                        {consultError && (
                          <div className="rounded-lg p-3 flex items-start gap-2" style={{ backgroundColor: '#FFEBEE', border: '1px solid #FFCDD2' }} role="alert">
                            <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{consultError}</p>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                          <button type="submit" className="btn-primary" style={{ backgroundColor: '#2E7D32' }}>
                            <Search size={16} />
                            Consultar Estado
                          </button>
                          <button 
                            type="button" 
                            onClick={() => { setExpandedCard('none'); setConsultResult(null); setConsultError(''); setConsultNumber(''); setConsultToken(''); }} 
                            className="btn-secondary"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Resultado de la consulta */
                      <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-200">
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ticket</p>
                            <p className="text-xl font-bold" style={{ color: '#004A83' }}>{consultResult.ticketNumber}</p>
                          </div>
                          <span 
                            className="badge-status self-start"
                            style={{
                              backgroundColor: consultResult.status === 'resolved' ? '#E8F5E9' :
                                              consultResult.status === 'closed' ? '#F5F5F5' :
                                              consultResult.status === 'in_progress' ? '#FFF8E1' : '#E8F4FD',
                              color: consultResult.status === 'resolved' ? '#2E7D32' :
                                    consultResult.status === 'closed' ? '#616161' :
                                    consultResult.status === 'in_progress' ? '#F57F17' : '#0066B3'
                            }}
                          >
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
                        
                        <dl className="space-y-4">
                          <div className="flex items-start gap-3">
                            <Tag size={16} className="text-gray-400 mt-0.5 shrink-0" aria-hidden="true" />
                            <div>
                              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Asunto</dt>
                              <dd className="font-medium text-gray-900">{consultResult.subject}</dd>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Clock size={16} className="text-gray-400 mt-0.5 shrink-0" aria-hidden="true" />
                            <div>
                              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha de creación</dt>
                              <dd className="font-medium text-gray-900">{new Date(consultResult.createdAt).toLocaleString('es-CL')}</dd>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <User size={16} className="text-gray-400 mt-0.5 shrink-0" aria-hidden="true" />
                            <div>
                              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Solicitante</dt>
                              <dd className="font-medium text-gray-900">{consultResult.requesterName}</dd>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-4 h-4 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: '#0066B3' }} aria-hidden="true" />
                            <div>
                              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Prioridad</dt>
                              <dd className="font-medium text-gray-900 capitalize">
                                {consultResult.priority === 'low' ? 'Baja' :
                                 consultResult.priority === 'medium' ? 'Media' :
                                 consultResult.priority === 'high' ? 'Alta' : 'Crítica'}
                              </dd>
                            </div>
                          </div>
                        </dl>

                        {/* Mensajes públicos */}
                        {consultResult.messages.filter((m: any) => m.type === 'public').length > 0 && (
                          <div className="mt-5 pt-5 border-t border-gray-200">
                            <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <MessageSquare size={14} aria-hidden="true" /> Comunicaciones
                            </h5>
                            <div className="space-y-2">
                              {consultResult.messages.filter((m: any) => m.type === 'public').map((msg: any) => (
                                <div key={msg.id} className="rounded-lg p-3" style={{ backgroundColor: '#F5F5F5' }}>
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
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
                          className="mt-5 text-sm font-medium transition hover:opacity-80 inline-flex items-center gap-1"
                          style={{ color: '#0066B3' }}
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
        </section>
      </div>
    </div>
  );
}
