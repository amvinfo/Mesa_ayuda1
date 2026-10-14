import React, { useState } from 'react';
import { db } from '../data/database';
import { KnowledgeArticle } from '../data/types';
import { Search, BookOpen, Eye, Star, ChevronRight, FileText } from 'lucide-react';

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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => setViewingArticle(null)} className="text-blue-600 hover:text-blue-800 mb-4 text-sm flex items-center gap-1">← Volver a artículos</button>
        <article className="bg-white rounded-xl shadow-sm border p-6 lg:p-8">
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
            <span className="flex items-center gap-1"><Eye size={14} /> {viewingArticle.views} visualizaciones</span>
            <span>•</span>
            <span>Actualizado: {new Date(viewingArticle.updatedAt).toLocaleDateString('es-CL')}</span>
            {viewingArticle.featured && <span className="flex items-center gap-1 text-yellow-500"><Star size={14} className="fill-yellow-500" /> Destacado</span>}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{viewingArticle.title}</h1>
          {viewingArticle.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {viewingArticle.tags.map(tag => <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{tag}</span>)}
            </div>
          )}
          <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: viewingArticle.content }} />
          <div className="mt-8 pt-4 border-t">
            <p className="text-sm text-gray-500 mb-3">¿Le fue útil este artículo?</p>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium hover:bg-green-100 transition">✓ Sí, me ayudó</button>
              <button className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition">✗ No me ayudó</button>
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Base de Conocimiento</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">Encuentre respuestas a las preguntas más frecuentes, guías y soluciones a problemas comunes.</p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-8">
        <form onSubmit={(e) => e.preventDefault()} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar en la base de conocimiento..."
            className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
          />
        </form>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          <button onClick={() => setSelectedCategory('')} className={`px-4 py-2 rounded-full text-sm font-medium transition ${!selectedCategory ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:border-blue-300'}`}>
            Todas
          </button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1.5 ${selectedCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:border-blue-300'}`}>
              <span>{cat.icon}</span> {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Articles */}
      {articles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 font-medium">No se encontraron artículos</p>
          <p className="text-sm text-gray-400 mt-1">Intente con otros términos de búsqueda o seleccione otra categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map(article => {
            const cat = categories.find(c => c.id === article.categoryId);
            return (
              <button key={article.id} onClick={() => setViewingArticle(article)} className="bg-white rounded-xl border p-5 text-left hover:shadow-md hover:border-blue-200 transition group">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{cat?.icon || '📄'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {article.featured && <Star size={12} className="text-yellow-500 fill-yellow-500" />}
                      {cat && <span className="text-xs text-gray-400">{cat.name}</span>}
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition mb-1">{article.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{article.summary}</p>
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
      {!search && !selectedCategory && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Artículos Destacados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.filter(a => a.featured).map(article => (
              <button key={article.id} onClick={() => setViewingArticle(article)} className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5 text-left hover:shadow-md transition group">
                <div className="flex items-center gap-2 mb-2">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-medium text-blue-600">Destacado</span>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">{article.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{article.summary}</p>
                <span className="inline-flex items-center gap-1 text-sm text-blue-600 mt-3 font-medium">Leer artículo <ChevronRight size={14} /></span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
