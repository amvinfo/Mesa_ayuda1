import React from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../data/database';
import { Ticket, Clock, CheckCircle, AlertTriangle, TrendingUp, Users, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;

  const allTickets = db.getTickets();
  const settings = db.getSettings();
  
  // Filter tickets based on role
  let visibleTickets = allTickets;
  if (user.role === 'technician') {
    visibleTickets = allTickets.filter(t => t.assignedTo === user.id);
  } else if (user.role === 'requester') {
    visibleTickets = allTickets.filter(t => t.requesterEmail === user.email);
  } else if (user.role === 'supervisor') {
    const teams = db.getTeams().filter(t => t.supervisorId === user.id);
    const teamMemberIds = teams.flatMap(t => t.memberIds);
    visibleTickets = allTickets.filter(t => t.assignedTo && teamMemberIds.includes(t.assignedTo));
  }

  const stats = {
    total: visibleTickets.length,
    new: visibleTickets.filter(t => t.status === 'new').length,
    open: visibleTickets.filter(t => ['open', 'assigned', 'in_progress'].includes(t.status)).length,
    waiting: visibleTickets.filter(t => ['waiting_requester', 'waiting_third'].includes(t.status)).length,
    resolved: visibleTickets.filter(t => t.status === 'resolved').length,
    closed: visibleTickets.filter(t => t.status === 'closed').length,
    escalated: visibleTickets.filter(t => t.status === 'escalated').length,
    critical: visibleTickets.filter(t => t.priority === 'critical' && !['resolved', 'closed'].includes(t.status)).length,
  };

  const recentTickets = [...visibleTickets].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  const statusLabels: Record<string, string> = {
    new: 'Nuevo', open: 'Abierto', assigned: 'Asignado', in_progress: 'En atención',
    waiting_requester: 'Esperando', waiting_third: 'Esperando tercero', escalated: 'Escalado',
    resolved: 'Resuelto', closed: 'Cerrado', reopened: 'Reabierto', cancelled: 'Cancelado',
  };
  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700', open: 'bg-blue-100 text-blue-700', assigned: 'bg-indigo-100 text-indigo-700',
    in_progress: 'bg-yellow-100 text-yellow-700', waiting_requester: 'bg-orange-100 text-orange-700',
    waiting_third: 'bg-orange-100 text-orange-700', escalated: 'bg-red-100 text-red-700',
    resolved: 'bg-green-100 text-green-700', closed: 'bg-gray-100 text-gray-700',
    reopened: 'bg-purple-100 text-purple-700', cancelled: 'bg-gray-100 text-gray-500',
  };
  const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-700', medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700', critical: 'bg-red-100 text-red-700',
  };
  const priorityLabels: Record<string, string> = { low: 'Baja', medium: 'Media', high: 'Alta', critical: 'Crítica' };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Panel Principal</h1>
        <p className="text-gray-600 text-sm">Bienvenido, {user.fullName}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Ticket} label="Total Tickets" value={stats.total} color="blue" />
        <StatCard icon={FileText} label="Nuevos" value={stats.new} color="indigo" />
        <StatCard icon={Clock} label="En Proceso" value={stats.open} color="yellow" />
        <StatCard icon={Users} label="Esperando" value={stats.waiting} color="orange" />
        <StatCard icon={CheckCircle} label="Resueltos" value={stats.resolved} color="green" />
        <StatCard icon={AlertTriangle} label="Escalados" value={stats.escalated} color="red" />
        <StatCard icon={AlertTriangle} label="Críticos" value={stats.critical} color="red" />
        <StatCard icon={TrendingUp} label="Cerrados" value={stats.closed} color="gray" />
      </div>

      {/* Quick Actions */}
      {['admin', 'technician', 'supervisor'].includes(user.role) && (
        <div className="mb-6 flex gap-3 flex-wrap">
          <Link to="/tickets?action=create" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            + Nuevo Ticket
          </Link>
          <Link to="/tickets" className="border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
            Ver todos los tickets
          </Link>
          {['admin', 'editor'].includes(user.role) && (
            <Link to="/knowledge-internal" className="border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              Base de Conocimiento
            </Link>
          )}
        </div>
      )}

      {/* Recent Tickets */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Tickets Recientes</h3>
          <Link to="/tickets" className="text-sm text-blue-600 hover:text-blue-800">Ver todos →</Link>
        </div>
        {recentTickets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Ticket size={40} className="mx-auto mb-3 opacity-50" />
            <p>No hay tickets para mostrar</p>
          </div>
        ) : (
          <div className="divide-y">
            {recentTickets.map(ticket => (
              <Link key={ticket.id} to={`/tickets/${ticket.id}`} className="p-4 hover:bg-gray-50 transition flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-500">{ticket.ticketNumber}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[ticket.status]}`}>
                      {statusLabels[ticket.status]}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[ticket.priority]}`}>
                      {priorityLabels[ticket.priority]}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">{ticket.subject}</p>
                  <p className="text-xs text-gray-500">{ticket.requesterName} • {new Date(ticket.updatedAt).toLocaleDateString('es-CL')}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    gray: 'bg-gray-50 text-gray-600',
  };
  return (
    <div className="bg-white rounded-xl border p-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
