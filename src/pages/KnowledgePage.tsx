import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../data/database';
import { KnowledgeArticle } from '../data/types';
import { Search, BookOpen, Plus, Edit, Trash2, Eye, EyeOff, Star, X, FileText, CheckCircle } from 'lucide-react';

export function KnowledgePage() {
  const { user } = useAuth();
  const [scope, setScope] = useState<'external' | 'internal'>('external');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingArticle, setEditingArticle] = useState<KnowledgeArticle | null>(null);
  const [viewingArticle, setViewingArticle] = useState<KnowledgeArticle | null>(null);
  const [showForm, setShowForm] = useState(false);

  if (!user) return null;

  const canManage = ['admin', 'editor', 'supervisor'].includes(user.role);
  const canViewInternal = ['admin', 'technician', 'supervisor', 'editor'].includes(user.role);

  const categories = db.getCategories().filter(c => {
    if (scope === 'external') return c.active && (c.scope === 'external' || c.scope === 'both');
    return c.active && (c.scope === 'internal' || c.scope === 'both');
  });

  let articles = db.getArticles().filter(a => a.scope === scope);
  if (!canManage) articles = articles.filter(a => a.status === 'published');
  if (search) {
    const q = search.toLowerCase();
    articles = articles.filter(a => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q) || a.tags.some(t => t.toLowerCase().includes(q)));
  }
  if (selectedCategory) articles = articles.filter(a => a.categoryId === selectedCategory);

  // If user can't view internal and tries to, redirect to external
  if (scope === 'internal' && !canViewInternal) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No tiene permisos para acceder a la base de conocimiento interna.</p>
      </div>
    );
  }

  if (viewingArticle) {
    return (
      <div className="max-w-4xl mx-auto">
        <button onClick={() => setViewingArticle(null)} className="text-blue-600 hover:text-blue-800 mb-4 text-sm">← Volver</button>
        <div className="bg-white rounded-xl border p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${viewingArticle.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {viewingArticle.status === 'published' ? 'Publicado' : viewingArticle.status === 'draft' ? 'Borrador' : viewingArticle.status}
            </span>
            <span className="text-xs text-gray-500">Vistas: {viewingArticle.views}</span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">Útil: {viewingArticle.helpful} | No útil: {viewingArticle.notHelpful}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{viewingArticle.title}</h1>
          <p className="text-sm text-gray-500 mb-4">Por {viewingArticle.authorName} • Actualizado: {new Date(viewingArticle.updatedAt).toLocaleDateString('es-CL')}</p>
          {viewingArticle.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {viewingArticle.tags.map(tag => <span key={tag} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">{tag}</span>)}
            </div>
          )}
          <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: viewingArticle.content }} />
          {canManage && (
            <div className="mt-6 pt-4 border-t flex gap-2">
              <button onClick={() => { setEditingArticle(viewingArticle); setShowForm(true); setViewingArticle(null); }} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100">
                <Edit size={14} /> Editar
              </button>
              <button onClick={() => { if (confirm('¿Eliminar este artículo?')) { db.deleteArticle(viewingArticle.id); setViewingArticle(null); } }} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm hover:bg-red-100">
                <Trash2 size={14} /> Eliminar
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Base de Conocimiento</h1>
          <p className="text-sm text-gray-600">{scope === 'external' ? 'Artículos visibles para usuarios públicos' : 'Artículos internos para el equipo de soporte'}</p>
        </div>
        {canManage && (
          <button onClick={() => { setEditingArticle(null); setShowForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
            <Plus size={16} /> Nuevo Artículo
          </button>
        )}
      </div>

      {/* Scope tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
        <button onClick={() => setScope('external')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${scope === 'external' ? 'bg-white shadow text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}>
          🌐 Externa
        </button>
        {canViewInternal && (
          <button onClick={() => setScope('internal')} className={`px-4 py-2 rounded-md text-sm font-medium transition ${scope === 'internal' ? 'bg-white shadow text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}>
            🔒 Interna
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar artículos..." className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" />
        </div>
        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      {/* Articles list */}
      {articles.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
          <BookOpen size={40} className="mx-auto mb-3 opacity-50" />
          <p>No hay artículos en esta sección</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.map(article => {
            const articleCat = db.getCategories().find(c => c.id === article.categoryId);
            return (
              <div key={article.id} className="bg-white rounded-xl border p-4 hover:shadow-md transition cursor-pointer" onClick={() => setViewingArticle(article)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {article.featured && <Star size={14} className="text-yellow-500 fill-yellow-500" />}
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${article.status === 'published' ? 'bg-green-100 text-green-700' : article.status === 'draft' ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-700'}`}>
                        {article.status === 'published' ? 'Publicado' : article.status === 'draft' ? 'Borrador' : article.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{article.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{article.summary}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      <span>{articleCat?.icon} {articleCat?.name}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Eye size={12} /> {article.views}</span>
                      <span>•</span>
                      <span>{new Date(article.updatedAt).toLocaleDateString('es-CL')}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && <ArticleForm article={editingArticle} scope={scope} onClose={() => setShowForm(false)} />}
    </div>
  );
}

function ArticleForm({ article, scope, onClose }: { article: KnowledgeArticle | null; scope: 'external' | 'internal'; onClose: () => void }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: article?.title || '',
    content: article?.content || '',
    summary: article?.summary || '',
    categoryId: article?.categoryId || '',
    tags: article?.tags.join(', ') || '',
    keywords: article?.keywords.join(', ') || '',
    status: article?.status || 'draft' as string,
    featured: article?.featured || false,
  });

  const categories = db.getCategories().filter(c => c.active && (c.scope === scope || c.scope === 'both'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    const data = {
      title: form.title,
      content: form.content,
      summary: form.summary,
      categoryId: form.categoryId,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
      status: form.status as any,
      featured: form.featured,
      scope,
    };

    if (article) {
      db.updateArticle(article.id, data);
    } else {
      db.createArticle({
        id: crypto.randomUUID(),
        ...data,
        authorId: user?.id || '',
        authorName: user?.fullName || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0, helpful: 0, notHelpful: 0,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold">{article ? 'Editar Artículo' : 'Nuevo Artículo'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resumen</label>
            <input type="text" value={form.summary} onChange={e => setForm({...form, summary: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Breve descripción del artículo" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenido * (HTML permitido)</label>
            <textarea rows={10} value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" required placeholder="Escriba el contenido del artículo. Puede usar HTML para formato." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">Seleccionar...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="draft">Borrador</option>
                <option value="pending">Pendiente de revisión</option>
                <option value="published">Publicado</option>
                <option value="archived">Archivado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Etiquetas (separadas por coma)</label>
              <input type="text" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="contraseña, acceso, login" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Palabras clave (separadas por coma)</label>
              <input type="text" value={form.keywords} onChange={e => setForm({...form, keywords: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="password, clave, olvido" />
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} className="rounded" />
            <span className="text-sm text-gray-700">Artículo destacado</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              {article ? 'Guardar cambios' : 'Crear artículo'}
            </button>
            <button type="button" onClick={onClose} className="px-5 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
