import { User, Ticket, Category, KnowledgeArticle, Department, Location, SupportTeam, TicketType, SystemSettings, AuditLog } from './types';
import { v4 as uuidv4 } from 'uuid';

const DB_KEYS = {
  users: 'helpdesk_users',
  tickets: 'helpdesk_tickets',
  categories: 'helpdesk_categories',
  articles: 'helpdesk_articles',
  departments: 'helpdesk_departments',
  locations: 'helpdesk_locations',
  teams: 'helpdesk_teams',
  ticketTypes: 'helpdesk_ticket_types',
  settings: 'helpdesk_settings',
  auditLogs: 'helpdesk_audit_logs',
  initialized: 'helpdesk_initialized',
};

function get<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function set<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function getOne<T>(key: string): T | null {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

function setOne<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Generate secure ticket number
function generateTicketNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'TK-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateAccessToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Initialize database with default data
export function initializeDatabase(): void {
  if (localStorage.getItem(DB_KEYS.initialized)) return;

  // Default admin user (password: admin123)
  const adminUser: User = {
    id: uuidv4(),
    username: 'admin',
    email: 'admin@mesadeayuda.cl',
    password: '$2b$10$XQXBn8yYOxMpBKDBpO.6Q.3hVEjZlKjHnN5cG8yFqW3kI9mR2vLxO', // hashed 'admin123'
    fullName: 'Administrador del Sistema',
    role: 'admin',
    department: 'Tecnología',
    location: 'Casa Central',
    active: true,
    createdAt: new Date().toISOString(),
  };

  // Supervisor user
  const supervisorUser: User = {
    id: uuidv4(),
    username: 'supervisor',
    email: 'supervisor@mesadeayuda.cl',
    password: '$2b$10$XQXBn8yYOxMpBKDBpO.6Q.3hVEjZlKjHnN5cG8yFqW3kI9mR2vLxO',
    fullName: 'María González',
    role: 'supervisor',
    department: 'Soporte TI',
    location: 'Casa Central',
    active: true,
    createdAt: new Date().toISOString(),
  };

  // Technician user
  const techUser: User = {
    id: uuidv4(),
    username: 'tecnico',
    email: 'tecnico@mesadeayuda.cl',
    password: '$2b$10$XQXBn8yYOxMpBKDBpO.6Q.3hVEjZlKjHnN5cG8yFqW3kI9mR2vLxO',
    fullName: 'Carlos Muñoz',
    role: 'technician',
    department: 'Soporte TI',
    location: 'Casa Central',
    active: true,
    createdAt: new Date().toISOString(),
  };

  set(DB_KEYS.users, [adminUser, supervisorUser, techUser]);

  // Default categories
  const categories: Category[] = [
    { id: uuidv4(), name: 'Problemas de acceso y contraseñas', icon: '🔑', description: 'Recuperación de contraseñas, bloqueo de cuentas, problemas de inicio de sesión', scope: 'both', active: true },
    { id: uuidv4(), name: 'Correo electrónico', icon: '📧', description: 'Configuración, problemas de envío/recepción, espacio', scope: 'both', active: true },
    { id: uuidv4(), name: 'Equipos computacionales', icon: '💻', description: 'Problemas con computadores, notebooks, monitores', scope: 'both', active: true },
    { id: uuidv4(), name: 'Impresoras y periféricos', icon: '🖨️', description: 'Instalación, configuración y problemas de impresoras', scope: 'both', active: true },
    { id: uuidv4(), name: 'Aplicaciones institucionales', icon: '📱', description: 'Sistemas internos, ERP, plataformas web', scope: 'both', active: true },
    { id: uuidv4(), name: 'Conectividad y redes', icon: '🌐', description: 'WiFi, cableado, VPN, acceso a internet', scope: 'both', active: true },
    { id: uuidv4(), name: 'Sistemas y plataformas', icon: '🖥️', description: 'Servidores, bases de datos, sistemas críticos', scope: 'internal', active: true },
    { id: uuidv4(), name: 'Solicitudes de acceso', icon: '🔐', description: 'Permisos a sistemas, carpetas compartidas', scope: 'both', active: true },
    { id: uuidv4(), name: 'Preguntas frecuentes', icon: '❓', description: 'Consultas comunes y sus respuestas', scope: 'external', active: true },
  ];
  set(DB_KEYS.categories, categories);

  // Default departments
  const departments: Department[] = [
    { id: uuidv4(), name: 'Tecnología', active: true },
    { id: uuidv4(), name: 'Soporte TI', active: true },
    { id: uuidv4(), name: 'Recursos Humanos', active: true },
    { id: uuidv4(), name: 'Finanzas', active: true },
    { id: uuidv4(), name: 'Académico', active: true },
    { id: uuidv4(), name: 'Administración', active: true },
  ];
  set(DB_KEYS.departments, departments);

  // Default locations
  const locations: Location[] = [
    { id: uuidv4(), name: 'Casa Central', address: 'Av. Principal 1234', active: true },
    { id: uuidv4(), name: 'Sede Norte', address: 'Calle Norte 567', active: true },
    { id: uuidv4(), name: 'Sede Sur', address: 'Av. Sur 890', active: true },
  ];
  set(DB_KEYS.locations, locations);

  // Default support team
  const team: SupportTeam = {
    id: uuidv4(),
    name: 'Equipo de Soporte Nivel 1',
    description: 'Atención inicial de solicitudes',
    memberIds: [techUser.id],
    supervisorId: supervisorUser.id,
    active: true,
  };
  set(DB_KEYS.teams, [team]);

  // Default ticket types
  const types: TicketType[] = [
    { id: uuidv4(), name: 'Incidencia', active: true },
    { id: uuidv4(), name: 'Solicitud de servicio', active: true },
    { id: uuidv4(), name: 'Consulta', active: true },
    { id: uuidv4(), name: 'Requerimiento', active: true },
  ];
  set(DB_KEYS.ticketTypes, types);

  // Default settings
  const settings: SystemSettings = {
    systemName: 'Mesa de Ayuda',
    institutionName: 'Institución de Ejemplo',
    logo: '🛠️',
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6',
    contactEmail: 'soporte@ejemplo.cl',
    contactPhone: '+56 2 2345 6789',
    timezone: 'America/Santiago',
    maxAttachmentSize: 10,
    allowedFileTypes: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx', 'zip'],
    smtpConfigured: false,
  };
  setOne(DB_KEYS.settings, settings);

  // Sample knowledge articles (external)
  const extArticles: KnowledgeArticle[] = [
    {
      id: uuidv4(), title: 'Cómo restablecer su contraseña', content: '<h2>Restablecimiento de contraseña</h2><p>Si ha olvidado su contraseña, siga estos pasos:</p><ol><li>Ingrese a la página de inicio de sesión</li><li>Haga clic en "¿Olvidó su contraseña?"</li><li>Ingrese su correo electrónico institucional</li><li>Revise su bandeja de entrada (y spam) para el enlace de restablecimiento</li><li>Haga clic en el enlace y cree una nueva contraseña</li></ol><p><strong>Requisitos de contraseña:</strong></p><ul><li>Mínimo 8 caracteres</li><li>Al menos una letra mayúscula</li><li>Al menos un número</li><li>Al menos un carácter especial</li></ul>', summary: 'Guía paso a paso para restablecer su contraseña de acceso', categoryId: categories[0].id, tags: ['contraseña', 'acceso', 'login'], keywords: ['password', 'clave', 'olvido', 'restablecer'], scope: 'external', status: 'published', authorId: adminUser.id, authorName: 'Administrador', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), views: 245, helpful: 89, notHelpful: 3, featured: true,
    },
    {
      id: uuidv4(), title: 'Configuración de correo en Outlook', content: '<h2>Configurar correo institucional en Outlook</h2><p>Siga estos pasos para configurar su correo en Microsoft Outlook:</p><h3>Outlook 2019/2021/365</h3><ol><li>Abra Outlook y vaya a Archivo > Agregar cuenta</li><li>Ingrese su correo institucional completo</li><li>Seleccione "Configurar manualmente" o "IMAP"</li><li>Servidor de entrada: mail.institucion.cl (puerto 993, SSL)</li><li>Servidor de salida: mail.institucion.cl (puerto 587, TLS)</li><li>Ingrese su contraseña</li></ol>', summary: 'Instrucciones para configurar el correo institucional en Microsoft Outlook', categoryId: categories[1].id, tags: ['correo', 'outlook', 'configuración'], keywords: ['email', 'mail', 'outlook', 'imap', 'smtp'], scope: 'external', status: 'published', authorId: adminUser.id, authorName: 'Administrador', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), views: 178, helpful: 67, notHelpful: 5, featured: true,
    },
    {
      id: uuidv4(), title: 'Problemas comunes con impresoras de red', content: '<h2>Solución de problemas con impresoras</h2><p>Si su impresora no funciona, verifique lo siguiente:</p><ol><li>La impresora está encendida y conectada a la red</li><li>No hay papel atascado</li><li>Los toners/cartuchos tienen tinta</li><li>Su computador está en la misma red</li><li>Intente eliminar y volver a agregar la impresora</li></ol><p>Si el problema persiste, registre un ticket indicando el modelo de impresora y la ubicación.</p>', summary: 'Soluciones a los problemas más frecuentes con impresoras de red', categoryId: categories[3].id, tags: ['impresora', 'red', 'periféricos'], keywords: ['printer', 'imprimir', 'tinta', 'toner', 'papel'], scope: 'external', status: 'published', authorId: adminUser.id, authorName: 'Administrador', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), views: 134, helpful: 52, notHelpful: 8, featured: false,
    },
  ];

  // Sample internal articles
  const intArticles: KnowledgeArticle[] = [
    {
      id: uuidv4(), title: 'Procedimiento de escalamiento de incidencias críticas', content: '<h2>Protocolo de escalamiento</h2><p>Cuando una incidencia cumple los criterios de crítica, seguir este procedimiento:</p><ol><li>Notificar inmediatamente al supervisor de turno</li><li>Registrar en el canal de emergencias de Teams</li><li>Escalar al nivel 2 si no hay resolución en 30 minutos</li><li>Informar al jefe de TI si afecta a más de 50 usuarios</li><li>Documentar todas las acciones realizadas</li></ol><h3>Criterios de criticidad</h3><ul><li>Sistema principal caído</li><li>Más de 100 usuarios afectados</li><li>Pérdida de datos</li><li>Incidente de seguridad</li></ul>', summary: 'Protocolo interno para escalamiento de incidencias de alta criticidad', categoryId: categories[6].id, tags: ['escalamiento', 'crítico', 'protocolo'], keywords: ['escalar', 'crítico', 'emergencia', 'protocolo'], scope: 'internal', status: 'published', authorId: adminUser.id, authorName: 'Administrador', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), views: 45, helpful: 23, notHelpful: 1, featured: true,
    },
    {
      id: uuidv4(), title: 'Diagnóstico de fallas de conectividad', content: '<h2>Pasos de diagnóstico de red</h2><p>Antes de escalar un problema de conectividad, realizar estos pasos:</p><ol><li>Verificar si el problema es aislado o generalizado</li><li>Ejecutar ping al gateway por defecto</li><li>Verificar configuración DNS</li><li>Comprobar estado del switch/access point más cercano</li><li>Revisar logs del firewall</li><li>Verificar si hay mantenimiento programado</li></ol>', summary: 'Guía de diagnóstico técnico para problemas de red y conectividad', categoryId: categories[6].id, tags: ['red', 'diagnóstico', 'conectividad'], keywords: ['ping', 'dns', 'switch', 'firewall', 'red'], scope: 'internal', status: 'published', authorId: adminUser.id, authorName: 'Administrador', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), views: 67, helpful: 34, notHelpful: 2, featured: false,
    },
  ];

  set(DB_KEYS.articles, [...extArticles, ...intArticles]);

  // Sample tickets
  const sampleTickets: Ticket[] = [
    {
      id: uuidv4(),
      ticketNumber: 'TK-AB12CD34',
      accessTokens: [generateAccessToken()],
      requesterName: 'Juan Pérez',
      requesterEmail: 'juan.perez@ejemplo.cl',
      requesterPhone: '+56 9 1234 5678',
      department: 'Recursos Humanos',
      location: 'Casa Central',
      categoryId: categories[0].id,
      typeId: types[0].id,
      subject: 'No puedo ingresar al sistema de RRHH',
      description: 'Desde ayer no puedo acceder al sistema de recursos humanos. Me aparece un error de "credenciales inválidas" aunque estoy seguro de que mi contraseña es correcta.',
      priority: 'high',
      status: 'in_progress',
      assignedTo: techUser.id,
      teamId: team.id,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      assignedAt: new Date(Date.now() - 86400000).toISOString(),
      firstResponseAt: new Date(Date.now() - 86400000 + 3600000).toISOString(),
      source: 'public',
      messages: [
        { id: uuidv4(), ticketId: '', authorId: techUser.id, authorName: 'Carlos Muñoz', content: 'Estimado Juan, hemos recibido su solicitud. Estamos investigando el problema. ¿Podría indicarnos qué navegador está utilizando?', type: 'public', createdAt: new Date(Date.now() - 86400000 + 3600000).toISOString() },
        { id: uuidv4(), ticketId: '', authorId: undefined, authorName: 'Juan Pérez', content: 'Estoy usando Chrome versión 120 en Windows 11.', type: 'public', createdAt: new Date(Date.now() - 43200000).toISOString() },
        { id: uuidv4(), ticketId: '', authorId: techUser.id, authorName: 'Carlos Muñoz', content: 'Se detectó que la cuenta estaba bloqueada por intentos fallidos. Se procedió a desbloquear. Verificar acceso.', type: 'internal', createdAt: new Date(Date.now() - 3600000).toISOString() },
      ],
      history: [
        { id: uuidv4(), ticketId: '', action: 'created', description: 'Ticket creado desde portal público', userName: 'Juan Pérez', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
        { id: uuidv4(), ticketId: '', action: 'assigned', description: 'Asignado a Carlos Muñoz', userName: 'Sistema', createdAt: new Date(Date.now() - 86400000).toISOString() },
        { id: uuidv4(), ticketId: '', action: 'status_change', description: 'Estado cambiado de Nuevo a En atención', userName: 'Carlos Muñoz', createdAt: new Date(Date.now() - 43200000).toISOString() },
      ],
      attachments: [],
    },
    {
      id: uuidv4(),
      ticketNumber: 'TK-EF56GH78',
      accessTokens: [generateAccessToken()],
      requesterName: 'Ana López',
      requesterEmail: 'ana.lopez@ejemplo.cl',
      department: 'Finanzas',
      location: 'Sede Norte',
      categoryId: categories[3].id,
      typeId: types[1].id,
      subject: 'Instalación de impresora en oficina 305',
      description: 'Solicito la instalación y configuración de la impresora HP LaserJet en la oficina 305 de la Sede Norte.',
      priority: 'medium',
      status: 'assigned',
      assignedTo: techUser.id,
      teamId: team.id,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      assignedAt: new Date(Date.now() - 43200000).toISOString(),
      source: 'internal',
      messages: [],
      history: [
        { id: uuidv4(), ticketId: '', action: 'created', description: 'Ticket creado desde panel interno', userName: 'Carlos Muñoz', createdAt: new Date(Date.now() - 86400000).toISOString() },
        { id: uuidv4(), ticketId: '', action: 'assigned', description: 'Asignado a Carlos Muñoz', userName: 'María González', createdAt: new Date(Date.now() - 43200000).toISOString() },
      ],
      attachments: [],
    },
  ];
  set(DB_KEYS.tickets, sampleTickets);

  // Audit logs
  const auditLogs: AuditLog[] = [
    { id: uuidv4(), userName: 'Sistema', action: 'system_init', details: 'Base de datos inicializada con datos de ejemplo', createdAt: new Date().toISOString() },
  ];
  set(DB_KEYS.auditLogs, auditLogs);

  localStorage.setItem(DB_KEYS.initialized, 'true');
}

// Database operations
export const db = {
  // Users
  getUsers: (): User[] => get<User>(DB_KEYS.users),
  getUserById: (id: string): User | undefined => get<User>(DB_KEYS.users).find(u => u.id === id),
  getUserByUsername: (username: string): User | undefined => get<User>(DB_KEYS.users).find(u => u.username === username || u.email === username),
  createUser: (user: User): void => { const users = get<User>(DB_KEYS.users); users.push(user); set(DB_KEYS.users, users); },
  updateUser: (id: string, data: Partial<User>): void => { const users = get<User>(DB_KEYS.users); const idx = users.findIndex(u => u.id === id); if (idx >= 0) { users[idx] = { ...users[idx], ...data }; set(DB_KEYS.users, users); } },
  deleteUser: (id: string): void => { const users = get<User>(DB_KEYS.users).filter(u => u.id !== id); set(DB_KEYS.users, users); },

  // Tickets
  getTickets: (): Ticket[] => get<Ticket>(DB_KEYS.tickets),
  getTicketById: (id: string): Ticket | undefined => get<Ticket>(DB_KEYS.tickets).find(t => t.id === id),
  getTicketByNumber: (number: string): Ticket | undefined => get<Ticket>(DB_KEYS.tickets).find(t => t.ticketNumber === number),
  getTicketByToken: (number: string, token: string): Ticket | undefined => get<Ticket>(DB_KEYS.tickets).find(t => t.ticketNumber === number && t.accessTokens.includes(token)),
  createTicket: (ticket: Ticket): void => { const tickets = get<Ticket>(DB_KEYS.tickets); tickets.push(ticket); set(DB_KEYS.tickets, tickets); },
  updateTicket: (id: string, data: Partial<Ticket>): void => { const tickets = get<Ticket>(DB_KEYS.tickets); const idx = tickets.findIndex(t => t.id === id); if (idx >= 0) { tickets[idx] = { ...tickets[idx], ...data, updatedAt: new Date().toISOString() }; set(DB_KEYS.tickets, tickets); } },
  generateTicketNumber,
  generateAccessToken,

  // Categories
  getCategories: (): Category[] => get<Category>(DB_KEYS.categories),
  getCategoriesByScope: (scope: 'external' | 'internal'): Category[] => get<Category>(DB_KEYS.categories).filter(c => c.scope === scope || c.scope === 'both'),
  createCategory: (cat: Category): void => { const cats = get<Category>(DB_KEYS.categories); cats.push(cat); set(DB_KEYS.categories, cats); },
  updateCategory: (id: string, data: Partial<Category>): void => { const cats = get<Category>(DB_KEYS.categories); const idx = cats.findIndex(c => c.id === id); if (idx >= 0) { cats[idx] = { ...cats[idx], ...data }; set(DB_KEYS.categories, cats); } },

  // Knowledge Articles
  getArticles: (): KnowledgeArticle[] => get<KnowledgeArticle>(DB_KEYS.articles),
  getArticlesByScope: (scope: 'external' | 'internal'): KnowledgeArticle[] => get<KnowledgeArticle>(DB_KEYS.articles).filter(a => a.scope === scope && a.status === 'published'),
  getArticleById: (id: string): KnowledgeArticle | undefined => get<KnowledgeArticle>(DB_KEYS.articles).find(a => a.id === id),
  createArticle: (article: KnowledgeArticle): void => { const articles = get<KnowledgeArticle>(DB_KEYS.articles); articles.push(article); set(DB_KEYS.articles, articles); },
  updateArticle: (id: string, data: Partial<KnowledgeArticle>): void => { const articles = get<KnowledgeArticle>(DB_KEYS.articles); const idx = articles.findIndex(a => a.id === id); if (idx >= 0) { articles[idx] = { ...articles[idx], ...data, updatedAt: new Date().toISOString() }; set(DB_KEYS.articles, articles); } },
  deleteArticle: (id: string): void => { const articles = get<KnowledgeArticle>(DB_KEYS.articles).filter(a => a.id !== id); set(DB_KEYS.articles, articles); },

  // Departments
  getDepartments: (): Department[] => get<Department>(DB_KEYS.departments),
  createDepartment: (dept: Department): void => { const depts = get<Department>(DB_KEYS.departments); depts.push(dept); set(DB_KEYS.departments, depts); },
  updateDepartment: (id: string, data: Partial<Department>): void => { const depts = get<Department>(DB_KEYS.departments); const idx = depts.findIndex(d => d.id === id); if (idx >= 0) { depts[idx] = { ...depts[idx], ...data }; set(DB_KEYS.departments, depts); } },

  // Locations
  getLocations: (): Location[] => get<Location>(DB_KEYS.locations),
  createLocation: (loc: Location): void => { const locs = get<Location>(DB_KEYS.locations); locs.push(loc); set(DB_KEYS.locations, locs); },
  updateLocation: (id: string, data: Partial<Location>): void => { const locs = get<Location>(DB_KEYS.locations); const idx = locs.findIndex(l => l.id === id); if (idx >= 0) { locs[idx] = { ...locs[idx], ...data }; set(DB_KEYS.locations, locs); } },

  // Teams
  getTeams: (): SupportTeam[] => get<SupportTeam>(DB_KEYS.teams),
  createTeam: (team: SupportTeam): void => { const teams = get<SupportTeam>(DB_KEYS.teams); teams.push(team); set(DB_KEYS.teams, teams); },
  updateTeam: (id: string, data: Partial<SupportTeam>): void => { const teams = get<SupportTeam>(DB_KEYS.teams); const idx = teams.findIndex(t => t.id === id); if (idx >= 0) { teams[idx] = { ...teams[idx], ...data }; set(DB_KEYS.teams, teams); } },

  // Ticket Types
  getTicketTypes: (): TicketType[] => get<TicketType>(DB_KEYS.ticketTypes),
  createTicketType: (type: TicketType): void => { const types = get<TicketType>(DB_KEYS.ticketTypes); types.push(type); set(DB_KEYS.ticketTypes, types); },

  // Settings
  getSettings: (): SystemSettings => getOne<SystemSettings>(DB_KEYS.settings) || {
    systemName: 'Mesa de Ayuda', institutionName: 'Institución', logo: '🛠️', primaryColor: '#1e40af', secondaryColor: '#3b82f6',
    contactEmail: '', contactPhone: '', timezone: 'America/Santiago', maxAttachmentSize: 10, allowedFileTypes: ['pdf','jpg','png'], smtpConfigured: false,
  },
  updateSettings: (data: Partial<SystemSettings>): void => { const current = db.getSettings(); setOne(DB_KEYS.settings, { ...current, ...data }); },

  // Audit Logs
  getAuditLogs: (): AuditLog[] => get<AuditLog>(DB_KEYS.auditLogs),
  addAuditLog: (log: AuditLog): void => { const logs = get<AuditLog>(DB_KEYS.auditLogs); logs.unshift(log); set(DB_KEYS.auditLogs, logs); },

  // Search
  searchExternalArticles: (query: string, categoryId?: string): KnowledgeArticle[] => {
    const articles = get<KnowledgeArticle>(DB_KEYS.articles).filter(a => a.scope === 'external' && a.status === 'published');
    const q = query.toLowerCase();
    let results = articles.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.keywords.some(k => k.toLowerCase().includes(q)) ||
      a.tags.some(t => t.toLowerCase().includes(q))
    );
    if (categoryId) {
      results = results.filter(a => a.categoryId === categoryId);
    }
    return results;
  },

  searchInternalArticles: (query: string, categoryId?: string): KnowledgeArticle[] => {
    const articles = get<KnowledgeArticle>(DB_KEYS.articles).filter(a => a.scope === 'internal');
    const q = query.toLowerCase();
    let results = articles.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.keywords.some(k => k.toLowerCase().includes(q)) ||
      a.tags.some(t => t.toLowerCase().includes(q))
    );
    if (categoryId) {
      results = results.filter(a => a.categoryId === categoryId);
    }
    return results;
  },
};
