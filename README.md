# 🏥 Mesa de Ayuda - Sistema de Soporte Técnico

Sistema web completo de Mesa de Ayuda con interfaz institucional del Gobierno de Chile.

## 🎯 Características

✅ Portal público con buscador de base de conocimiento  
✅ Creación de tickets con validación  
✅ Consulta de estado de tickets  
✅ Panel interno para funcionarios  
✅ Gestión de tickets (asignar, responder, cambiar estado)  
✅ Base de conocimiento externa e interna  
✅ Sistema de roles y permisos  
✅ Diseño responsive y accesible  
✅ Instalador web automático  

## 🚀 Instalación Rápida

### Opción 1: cPanel (Recomendado para hosting)

1. Sube la carpeta `cpanel/` a tu hosting
2. Crea una base de datos MySQL en cPanel
3. Visita `tudominio.com/install.php`
4. Sigue el asistente de instalación

📖 **Guía completa:** [INSTALACION-CPANEL.md](cpanel/INSTALACION-CPANEL.md)

### Opción 2: XAMPP (Local)

1. Copia la carpeta `cpanel/` a `C:\xampp\htdocs\mesadeayuda\`
2. Inicia Apache y MySQL en XAMPP
3. Visita `http://localhost/mesadeayuda/install.php`

### Opción 3: Desarrollo Local

```bash
npm install
npm run dev
```

## 🔐 Credenciales por Defecto

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | admin123 | Administrador |
| supervisor | supervisor123 | Supervisor |
| tecnico | tecnico123 | Técnico |

**⚠️ Cambia las contraseñas inmediatamente después de instalar**

## 📋 Requisitos

- PHP 7.4 o superior
- MySQL 5.7+ / MariaDB 10.3+
- Servidor web Apache con mod_rewrite
- Navegador moderno (Chrome, Firefox, Edge, Safari)

## 🏗️ Estructura del Proyecto

```
mesadeayuda/
├── cpanel/                 → Versión para hosting (HTML+PHP+MySQL)
│   ├── index.html         → Portal público
│   ├── login.html         → Login de funcionarios
│   ├── dashboard.html     → Panel interno
│   ├── install.php        → Instalador web
│   ├── db.php             → Conexión a BD
│   ├── database.sql       → Script SQL
│   ├── .htaccess          → Configuración Apache
│   └── api/
│       └── index.php      → API REST
│
├── src/                    → Código fuente React (desarrollo)
│   ├── components/
│   ├── pages/
│   ├── context/
│   └── data/
│
├── dist/                   → Build de producción (React)
├── package.json
└── README.md
```

## 🎨 Diseño

- **Tipografía:** Asap (oficial gobCL)
- **Paleta de colores:** Institucional Gobierno de Chile
  - Azul primario: `#0066B3`
  - Azul oscuro: `#004A83`
  - Verde acento: `#2E7D32`
- **Accesibilidad:** WCAG 2.1 AA
- **Responsive:** Mobile-first

## 📖 Documentación

- [Guía de Instalación en cPanel](cpanel/INSTALACION-CPANEL.md)
- [Guía Rápida](GUIA-RAPIDA.md)
- [Instrucciones XAMPP](INSTRUCCIONES.txt)

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- Consultas preparadas (previene SQL injection)
- Protección CSRF en formularios
- Validación de datos en servidor y cliente
- Separación de bases de conocimiento (externa/interna)
- Tokens seguros para consulta de tickets

## 🛠️ Tecnologías

### Versión cPanel (Producción)
- HTML5 + CSS3 + JavaScript vanilla
- PHP 7.4+ con PDO
- MySQL/MariaDB
- API REST

### Versión Desarrollo
- React 18
- TypeScript
- Vite
- Tailwind CSS

## 📝 Licencia

Este proyecto fue desarrollado para el Gobierno de Chile.

## 📞 Soporte

Para problemas técnicos o consultas, contacta al equipo de desarrollo.

---

**Versión:** 1.0.0  
**Última actualización:** 2026  
**Compatible con:** cPanel, XAMPP, LAMP, WAMP
