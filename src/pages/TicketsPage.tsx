import React, { useState } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../data/database';
import { Ticket, TicketMessage, TicketHistory } from '../data/types';
import { v4 as uuidv4 } from 'uuid';
import { Search, Filter, Plus, Send, Paperclip, Clock, User, AlertCircle, MessageSquare, FileText, ChevronDown, X } from 'lucide-react';

const statusLabels: Record<string, string> = {
  new: 'Nuevo', open: 'Abierto', assigned: 'Asignado', in_progress: 'En atención',
  waiting_requester: 'Esperando solicitante', waiting_third: 'Esperando tercero', escalated: 'Escalado',
  resolved: 'Resuelto', closed: 'Cerrado', reopened: 'Reabierto', cancelled: 'Cancelado',
};
const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700', open: 'bg-blue-100 text-blue-700', assigned: 'bg-indigo-100 text-indigo-700',
  in_progress: 'bg-yellow-100 text-yellow-700', waiting_requester: 'bg-orange-100 text-orange-700',
  waiting_third: 'bg-orange-100 text-orange-700', escalated: 'bg-red-100 text-red-700',
  resolved: 'bg-green-100 text-green-700', closed: 'bg-gray-100 text-gray-700',
  reopened: 'bg-purple-100 text-purple-700', cancelled: 'bg-gray-100 text-gray-500',
};
const priorityLabels: Record<string, string> = { low: 'Baja', medium: 'Media', high: 'Alta', critical: 'Crítica' };
const priorityColors: Record<string, string> = { low: 'bg-gray-100 text-gray-700', medium: 'bg-blue-100 text-blue-700', high: 'bg-orange-100 text-orange-700', critical: 'bg-red-100 text-red-700' };

export function TicketsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(searchParams.get('action') === 'create');

  if (!user) return null;

  let tickets = db.getTickets();
  if (user.role === 'technician') {
    tickets = tickets.filter(t => t.assignedTo === user.id);
  } else if (user.role === 'requester') {
    tickets = tickets.filter(t => t.requesterEmail === user.email);
  } else if (user.role === 'supervisor') {
    const teams = db.getTeams().filter(t => t.supervisorId === user.id);
    const memberIds = teams.flatMap(t => t.memberIds);
    tickets = tickets.filter(t => !t.assignedTo || memberIds.includes(t.assignedTo));
  }

  if (search) {
    const q = search.toLowerCase();
    tickets = tickets.filter(t => t.subject.toLowerCase().includes(q) || t.ticketNumber.toLowerCase().includes(q) || t.requesterName.toLowerCase().includes(q));
  }
  if (statusFilter) tickets = tickets.filter(t => t.status === statusFilter);
  if (priorityFilter) tickets = tickets.filter(t => t.priority === priorityFilter);

  tickets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-sm text-gray-600">{tickets.length} tickets encontrados</p>
        </div>
        {['admin', 'technician', 'supervisor'].includes(user.role) && (
          <button onClick={() => setShowCreateModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2">
            <Plus size={16} /> Nuevo Ticket
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar tickets..." className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">Todos los estados</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">Todas las prioridades</option>
          {Object.entries(priorityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {tickets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText size={40} className="mx-auto mb-3 opacity-50" />
            <p>No se encontraron tickets</p>
          </div>
        ) : (
          <div className="divide-y">
            {tickets.map(ticket => {
              const cat = db.getCategories().find(c => c.id === ticket.categoryId);
              return (
                <Link key={ticket.id} to={`/tickets/${ticket.id}`} className="p-4 hover:bg-gray-50 transition block">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-gray-500">{ticket.ticketNumber}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[ticket.status]}`}>{statusLabels[ticket.status]}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[ticket.priority]}`}>{priorityLabels[ticket.priority]}</span>
                        {cat && <span className="text-xs text-gray-400">{cat.icon} {cat.name}</span>}
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate">{ticket.subject}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><User size={12} /> {ticket.requesterName}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(ticket.createdAt).toLocaleDateString('es-CL')}</span>
                        <span>{ticket.messages.length} mensajes</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {showCreateModal && <CreateTicketModal onClose={() => { setShowCreateModal(false); navigate('/tickets'); }} />}
    </div>
  );
}

// Create Ticket Modal (Internal)
function CreateTicketModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    requesterName: user?.fullName || '', requesterEmail: user?.email || '', phone: '',
    department: '', location: '', categoryId: '', typeId: '', subject: '', description: '',
    priority: 'medium' as string, source: 'internal' as string,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = db.getCategories().filter(c => c.active);
  const types = db.getTicketTypes().filter(t => t.active);
  const departments = db.getDepartments().filter(d => d.active);
  const locations = db.getLocations().filter(l => l.active);
  const technicians = db.getUsers().filter(u => u.role === 'technician' && u.active);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.subject.trim()) errs.subject = 'Requerido';
    if (!form.description.trim()) errs.description = 'Requerido';
    if (!form.categoryId) errs.categoryId = 'Requerido';
    if (!form.typeId) errs.typeId = 'Requerido';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const ticketNumber = db.generateTicketNumber();
    const accessToken = db.generateAccessToken();
    const now = new Date().toISOString();

    const ticket: Ticket = {
      id: crypto.randomUUID(), ticketNumber, accessTokens: [accessToken],
      requesterName: form.requesterName, requesterEmail: form.requesterEmail,
      requesterPhone: form.phone, department: form.department, location: form.location,
      categoryId: form.categoryId, typeId: form.typeId, subject: form.subject,
      description: form.description, priority: form.priority as any, status: 'new',
      createdAt: now, updatedAt: now, source: form.source as any,
      messages: [], history: [{ id: crypto.randomUUID(), ticketId: '', action: 'created', description: `Ticket creado desde panel interno por ${user?.fullName}`, userName: user?.fullName || '', createdAt: now }],
      attachments: [],
    };

    db.createTicket(ticket);
    db.addAuditLog({ id: crypto.randomUUID(), userId: user?.id, userName: user?.fullName || '', action: 'ticket_created', details: `Ticket ${ticketNumber} creado`, createdAt: now });
    navigate(`/tickets/${ticket.id}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold">Nuevo Ticket (Interno)</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Solicitante *</label>
              <input type="text" value={form.requesterName} onChange={e => setForm({...form, requesterName: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo *</label>
              <input type="email" value={form.requesterEmail} onChange={e => setForm({...form, requesterEmail: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
              <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">Seleccionar...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
              {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select value={form.typeId} onChange={e => setForm({...form, typeId: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">Seleccionar...</option>
                {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {errors.typeId && <p className="text-red-500 text-xs mt-1">{errors.typeId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option><option value="critical">Crítica</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Origen</label>
              <select value={form.source} onChange={e => setForm({...form, source: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="internal">Interno</option><option value="phone">Teléfono</option><option value="email">Correo</option><option value="public">Presencial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
              <select value={form.department} onChange={e => setForm({...form, department: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">Seleccionar...</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
              <select value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">Seleccionar...</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asunto *</label>
            <input type="text" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
            {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
            <textarea rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Crear Ticket</button>
            <button type="button" onClick={onClose} className="px-5 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Ticket Detail Page
export function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const ticket = db.getTicketById(id || '');
  const [replyText, setReplyText] = useState('');
  const [replyType, setReplyType] = useState<'public' | 'internal'>('public');
  const [showActions, setShowActions] = useState(false);

  if (!ticket || !user) {
    return <div className="text-center py-12 text-gray-500">Ticket no encontrado</div>;
  }

  const categories = db.getCategories();
  const users = db.getUsers();
  const cat = categories.find(c => c.id === ticket.categoryId);
  const assignedUser = users.find(u => u.id === ticket.assignedTo);
  const isStaff = ['admin', 'supervisor', 'technician'].includes(user.role);

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    const msg: TicketMessage = {
      id: crypto.randomUUID(), ticketId: ticket.id, authorId: user.id,
      authorName: user.fullName, content: replyText, type: replyType,
      createdAt: new Date().toISOString(),
    };
    const messages = [...ticket.messages, msg];
    const history: TicketHistory = {
      id: crypto.randomUUID(), ticketId: ticket.id, action: 'reply',
      description: `${replyType === 'public' ? 'Respuesta pública' : 'Nota interna'} agregada`,
      userId: user.id, userName: user.fullName, createdAt: new Date().toISOString(),
    };
    db.updateTicket(ticket.id, { messages, history: [...ticket.history, history] });
    setReplyText('');
    navigate(0); // Refresh
  };

  const handleStatusChange = (newStatus: string) => {
    const history: TicketHistory = {
      id: crypto.randomUUID(), ticketId: ticket.id, action: 'status_change',
      description: `Estado cambiado de ${statusLabels[ticket.status]} a ${statusLabels[newStatus]}`,
      userId: user.id, userName: user.fullName, createdAt: new Date().toISOString(),
      oldValue: ticket.status, newValue: newStatus,
    };
    const updates: Partial<Ticket> = { status: newStatus as any, history: [...ticket.history, history] };
    if (newStatus === 'resolved') updates.resolvedAt = new Date().toISOString();
    if (newStatus === 'closed') updates.closedAt = new Date().toISOString();
    db.updateTicket(ticket.id, updates);
    setShowActions(false);
    navigate(0);
  };

  const handleAssign = (userId: string) => {
    const assignUser = users.find(u => u.id === userId);
    const history: TicketHistory = {
      id: crypto.randomUUID(), ticketId: ticket.id, action: 'assigned',
      description: `Asignado a ${assignUser?.fullName || 'sin asignar'}`,
      userId: user.id, userName: user.fullName, createdAt: new Date().toISOString(),
    };
    db.updateTicket(ticket.id, { assignedTo: userId, assignedAt: new Date().toISOString(), status: 'assigned', history: [...ticket.history, history] });
    setShowActions(false);
    navigate(0);
  };

  const visibleMessages = isStaff ? ticket.messages : ticket.messages.filter(m => m.type === 'public');

  return (
    <div className="max-w-6xl mx-auto">
      <button onClick={() => navigate('/tickets')} className="text-blue-600 hover:text-blue-800 mb-4 text-sm">← Volver a tickets</button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header */}
          <div className="bg-white rounded-xl border p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-mono text-gray-500">{ticket.ticketNumber}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[ticket.status]}`}>{statusLabels[ticket.status]}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[ticket.priority]}`}>{priorityLabels[ticket.priority]}</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">{ticket.subject}</h1>
                <p className="text-sm text-gray-600 mt-1">Creado por {ticket.requesterName} el {new Date(ticket.createdAt).toLocaleString('es-CL')}</p>
              </div>
              {isStaff && (
                <div className="relative">
                  <button onClick={() => setShowActions(!showActions)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1">
                    Acciones <ChevronDown size={14} />
                  </button>
                  {showActions && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-2 z-50">
                      <p className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">Cambiar estado</p>
                      {Object.entries(statusLabels).map(([key, label]) => (
                        <button key={key} onClick={() => handleStatusChange(key)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50">{label}</button>
                      ))}
                      <hr className="my-2" />
                      <p className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">Asignar a</p>
                      {users.filter(u => u.role === 'technician' && u.active).map(u => (
                        <button key={u.id} onClick={() => handleAssign(u.id)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50">{u.fullName}</button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </div>

          {/* Messages / Timeline */}
          <div className="bg-white rounded-xl border">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2"><MessageSquare size={16} /> Historial de comunicaciones</h3>
            </div>
            <div className="divide-y">
              {/* Description as first message */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">{ticket.requesterName.charAt(0)}</div>
                  <span className="text-sm font-medium">{ticket.requesterName}</span>
                  <span className="text-xs text-gray-500">{new Date(ticket.createdAt).toLocaleString('es-CL')}</span>
                </div>
                <p className="text-sm text-gray-700 ml-9 whitespace-pre-wrap">{ticket.description}</p>
              </div>
              {visibleMessages.map(msg => (
                <div key={msg.id} className={`p-4 ${msg.type === 'internal' ? 'bg-yellow-50' : ''}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${msg.type === 'internal' ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-100 text-blue-700'}`}>
                      {msg.authorName.charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{msg.authorName}</span>
                    <span className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleString('es-CL')}</span>
                    {msg.type === 'internal' && <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">Nota interna</span>}
                  </div>
                  <p className="text-sm text-gray-700 ml-9 whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
            </div>

            {/* Reply form */}
            {isStaff && (
              <div className="p-4 border-t bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <button onClick={() => setReplyType('public')} className={`px-3 py-1 rounded text-xs font-medium ${replyType === 'public' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600'}`}>Respuesta pública</button>
                  <button onClick={() => setReplyType('internal')} className={`px-3 py-1 rounded text-xs font-medium ${replyType === 'internal' ? 'bg-yellow-500 text-white' : 'bg-white border text-gray-600'}`}>Nota interna</button>
                </div>
                <form onSubmit={handleReply} className="flex gap-2">
                  <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={3} placeholder={replyType === 'public' ? 'Escriba una respuesta al solicitante...' : 'Escriba una nota interna (solo visible para el equipo)...'} className="flex-1 px-3 py-2 border rounded-lg text-sm resize-none" />
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 self-end"><Send size={16} /></button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Detalles</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Categoría</dt><dd className="font-medium">{cat?.icon} {cat?.name}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Origen</dt><dd className="font-medium capitalize">{ticket.source}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Solicitante</dt><dd className="font-medium">{ticket.requesterName}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Correo</dt><dd className="font-medium text-xs">{ticket.requesterEmail}</dd></div>
              {ticket.department && <div className="flex justify-between"><dt className="text-gray-500">Depto.</dt><dd className="font-medium">{db.getDepartments().find(d => d.id === ticket.department)?.name || '-'}</dd></div>}
              {ticket.location && <div className="flex justify-between"><dt className="text-gray-500">Ubicación</dt><dd className="font-medium">{db.getLocations().find(l => l.id === ticket.location)?.name || '-'}</dd></div>}
              <div className="flex justify-between"><dt className="text-gray-500">Asignado a</dt><dd className="font-medium">{assignedUser?.fullName || 'Sin asignar'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Creado</dt><dd className="font-medium text-xs">{new Date(ticket.createdAt).toLocaleString('es-CL')}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Actualizado</dt><dd className="font-medium text-xs">{new Date(ticket.updatedAt).toLocaleString('es-CL')}</dd></div>
            </dl>
          </div>

          {/* History */}
          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Historial</h3>
            <div className="space-y-2">
              {ticket.history.slice().reverse().map(h => (
                <div key={h.id} className="text-xs border-l-2 border-gray-200 pl-3 py-1">
                  <p className="text-gray-700">{h.description}</p>
                  <p className="text-gray-400">{h.userName} • {new Date(h.createdAt).toLocaleString('es-CL')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
