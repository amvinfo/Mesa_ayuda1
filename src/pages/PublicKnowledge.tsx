import React, { useState } from 'react';
import { db } from '../data/database';
import { KnowledgeArticle } from '../data/types';
import { Search, BookOpen, Eye, Star, ChevronRight, FileText } from 'lucide-react';

/* =====================================================
   PUBLIC KNOWLEDGE - Base de Conocimiento Pública
   Estándar Kit Digital - Gobierno de Chile
   ===================================================== */
export function PublicKnowledge() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewingArticle, setViewingArticle] = useState<KnowledgeArticle | null>(null);

  const categories = db.getCategories().filter(c => c.active && (c.scope === 'external' || c.scope === 'both'));
  
  let articles = db.getArticlesByScope('external');
  if (search) {
    const q = search.toLowerCase();
    articles = articles.filter(a => 
      a.title.toLowerCase().includes(q) || 
      a.content.toLowerCase().includes(q) || 
      a.summary.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q)) ||
      a.keywords.some(k => k.toLowerCase().includes(q))
    );
  }
  if (selectedCategory) articles = articles.filter(a => a.categoryId === selectedCategory);

  if (viewingArticle) {
    return (
      <div className="container-institutional py-8">
        <button 
          onClick={() => setViewingArticle(null)} 
          className="text-sm font-medium mb-4 inline-flex items-center gap-1 transition hover:opacity-80"
          style={{ color: '#0066B3' }}
        >
          ← Volver a artículos
        </button>
        <article className="card-institutional p-6 md:p-8">
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
            <span className="flex items-center gap-1"><Eye size={14} /> {viewingArticle.views} visualizaciones</span>
            <span>•</span>
            <span>Actualizado: {new Date(viewingArticle.updatedAt).toLocaleDateString('es-CL')}</span>
            {viewingArticle.featured && (
              <span className="flex items-center gap-1" style={{ color: '#F57F17' }}>
                <Star size={14} className="fill-current" /> Destacado
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#004A83' }}>
            {viewingArticle.title}
          </h1>
          {viewingArticle.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {viewingArticle.tags.map(tag => (
                <span 
                  key={tag} 
                  className="px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: '#E8F4FD', color: '#0066B3' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: viewingArticle.content }} />
          <div className="mt-8 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-3">¿Le fue útil este artículo?</p>
            <div className="flex gap-3">
              <button className="px-4 py-2 rounded-lg text-sm font-medium transition border" style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', borderColor: '#C8E6C9' }}>
                ✓ Sí, me ayudó
              </button>
              <button className="px-4 py-2 rounded-lg text-sm font-medium transition border" style={{ backgroundColor: '#FFEBEE', color: '#C62828', borderColor: '#FFCDD2' }}>
                ✗ No me ayudó
              </button>
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="container-institutional py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#004A83' }}>
          Base de Conocimiento
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
          Encuentre respuestas a las preguntas más frecuentes, guías y soluciones a problemas comunes.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-8">
        <form onSubmit={(e) => e.preventDefault()} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={20} style={{ color: '#9E9E9E' }} aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar en la base de conocimiento..."
            className="input-institutional pl-12 py-4 rounded-xl text-base"
            aria-label="Buscar artículos"
          />
        </form>
      </div>

      {/* Category filters */}
      <div className="mb-8" role="navigation" aria-label="Filtros de categoría">
        <div className="flex flex-wrap gap-2 justify-center">
          <button 
            onClick={() => setSelectedCategory('')} 
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${!selectedCategory ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}
            style={!selectedCategory ? { backgroundColor: '#0066B3' } : {}}
          >
            Todas
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setSelectedCategory(cat.id)} 
              className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1.5 ${selectedCategory === cat.id ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}
              style={selectedCategory === cat.id ? { backgroundColor: '#0066B3' } : {}}
            >
              <span>{cat.icon}</span> {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Articles grid */}
      {articles.length === 0 ? (
        <div className="card-institutional p-8 text-center text-gray-500">
          <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p className="font-medium">No se encontraron artículos</p>
          <p className="text-sm mt-1">Intente con otros términos de búsqueda o seleccione otra categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map(article => {
            const cat = categories.find(c => c.id === article.categoryId);
            return (
              <button 
                key={article.id} 
                onClick={() => setViewingArticle(article)} 
                className="card-institutional p-5 text-left group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{cat?.icon || '📄'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {article.featured && <Star size={12} className="fill-current" style={{ color: '#F57F17' }} />}
                      {cat && <span className="text-xs text-gray-400">{cat.name}</span>}
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{article.summary}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Eye size={12} /> {article.views}</span>
                      <span>•</span>
                      <span>{new Date(article.updatedAt).toLocaleDateString('es-CL')}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Featured articles */}
      {!search && !selectedCategory && articles.filter(a => a.featured).length > 0 && (
        <section className="mt-10" aria-labelledby="featured-heading">
          <h2 id="featured-heading" className="text-xl font-bold mb-4" style={{ color: '#004A83' }}>
            Artículos Destacados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.filter(a => a.featured).map(article => (
              <button 
                key={article.id} 
                onClick={() => setViewingArticle(article)} 
                className="card-institutional p-5 text-left group"
                style={{ background: 'linear-gradient(135deg, #E8F4FD 0%, #FFFFFF 100%)', borderColor: '#B3D9F2' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Star size={14} className="fill-current" style={{ color: '#F57F17' }} />
                  <span className="text-xs font-semibold" style={{ color: '#0066B3' }}>Destacado</span>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{article.summary}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium mt-3" style={{ color: '#0066B3' }}>
                  Leer artículo <ChevronRight size={14} />
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
