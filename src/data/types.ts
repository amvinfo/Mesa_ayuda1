export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'supervisor' | 'technician' | 'requester' | 'editor';
  department?: string;
  location?: string;
  active: boolean;
  lastLogin?: string;
  createdAt: string;
  teamIds?: string[];
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  accessTokens: string[];
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  department?: string;
  location?: string;
  categoryId: string;
  typeId: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'open' | 'assigned' | 'in_progress' | 'waiting_requester' | 'waiting_third' | 'escalated' | 'resolved' | 'closed' | 'reopened' | 'cancelled';
  assignedTo?: string;
  teamId?: string;
  createdAt: string;
  updatedAt: string;
  assignedAt?: string;
  firstResponseAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  source: 'public' | 'internal' | 'phone' | 'email';
  messages: TicketMessage[];
  history: TicketHistory[];
  attachments: Attachment[];
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  authorId?: string;
  authorName: string;
  content: string;
  type: 'public' | 'internal';
  createdAt: string;
  attachments?: Attachment[];
}

export interface TicketHistory {
  id: string;
  ticketId: string;
  action: string;
  description: string;
  userId?: string;
  userName: string;
  createdAt: string;
  oldValue?: string;
  newValue?: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  data: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  scope: 'external' | 'internal' | 'both';
  active: boolean;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  categoryId: string;
  tags: string[];
  keywords: string[];
  scope: 'external' | 'internal';
  status: 'draft' | 'pending' | 'published' | 'archived';
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  helpful: number;
  notHelpful: number;
  featured: boolean;
}

export interface Department {
  id: string;
  name: string;
  active: boolean;
}

export interface Location {
  id: string;
  name: string;
  address?: string;
  active: boolean;
}

export interface SupportTeam {
  id: string;
  name: string;
  description: string;
  memberIds: string[];
  supervisorId?: string;
  active: boolean;
}

export interface TicketType {
  id: string;
  name: string;
  active: boolean;
}

export interface SystemSettings {
  systemName: string;
  institutionName: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  contactPhone: string;
  timezone: string;
  maxAttachmentSize: number;
  allowedFileTypes: string[];
  smtpConfigured: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpFrom?: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userName: string;
  action: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}
