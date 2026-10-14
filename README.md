# 🏥 Mesa de Ayuda - Sistema de Soporte Técnico

Sistema web completo de Mesa de Ayuda y Soporte Técnico con interfaz institucional del Gobierno de Chile.

## 🚀 Instalación Rápida en XAMPP

### Paso 1: Descargar e Instalar XAMPP
1. Descarga XAMPP desde: https://www.apachefriends.org/
2. Instálalo en tu computadora (por defecto en `C:\xampp` en Windows)

### Paso 2: Copiar los Archivos
1. Abre el Explorador de Archivos
2. Navega a la carpeta `C:\xampp\htdocs\`
3. Crea una nueva carpeta llamada `mesadeayuda`
4. Copia **TODO el contenido** de la carpeta `dist/` dentro de `C:\xampp\htdocs\mesadeayuda\`

La estructura debe quedar así:
```
C:\xampp\htdocs\mesadeayuda\
├── index.html
├── .htaccess
└── assets/
    ├── index-XXXXX.js
    └── index-XXXXX.css
```

### Paso 3: Iniciar XAMPP
1. Abre el **Panel de Control de XAMPP**
2. Haz clic en **Start** junto a **Apache**
3. Espera a que el fondo se ponga verde (indicando que está activo)

### Paso 4: Abrir en el Navegador
Abre tu navegador web y ve a:
```
http://localhost/mesadeayuda/
```

¡Listo! Ya puedes usar el sistema.

---

## 📂 Ver como Archivo HTML Directo

Si prefieres abrir el archivo HTML directamente sin XAMPP:

### Opción A: Doble Clic
1. Navega a la carpeta `dist/`
2. Haz doble clic en `index.html`
3. Se abrirá en tu navegador predeterminado

### Opción B: Arrastrar al Navegador
1. Abre tu navegador (Chrome, Firefox, Edge)
2. Arrastra el archivo `dist/index.html` a la ventana del navegador

**Nota:** Al abrir directamente, algunas funcionalidades pueden no funcionar correctamente debido a restricciones de seguridad del navegador. Se recomienda usar XAMPP para una experiencia completa.

---

## 🔐 Credenciales de Acceso

### Usuarios de Prueba:
| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Administrador | `admin` | `admin123` |
| Supervisor | `supervisor` | `admin123` |
| Técnico | `tecnico` | `admin123` |

---

## 📋 Funcionalidades Principales

### Portal Público (sin login):
- ✅ Buscador de base de conocimiento
- ✅ Crear solicitud de soporte (inline)
- ✅ Consultar estado de ticket (inline)
- ✅ Categorías de ayuda

### Panel Interno (con login):
- ✅ Dashboard con estadísticas
- ✅ Gestión de tickets
- ✅ Base de conocimiento interna
- ✅ Panel de administración
- ✅ Gestión de usuarios y roles

---

## 🛠️ Solución de Problemas

### Problema: Página en blanco
**Solución:** Asegúrate de que la estructura de carpetas sea correcta. El archivo `index.html` debe estar en la raíz de `mesadeayuda/`, no dentro de una subcarpeta.

### Problema: Error 404 al navegar
**Solución:** Verifica que el archivo `.htaccess` esté presente en la carpeta `mesadeayuda/`. Este archivo es necesario para que Apache maneje las rutas del SPA.

### Problema: Apache no inicia
**Solución:** 
1. Cierra Skype u otros programas que usen el puerto 80
2. En XAMPP Config > Apache > httpd.conf, cambia el puerto a 8080
3. Accede a `http://localhost:8080/mesadeayuda/`

---

## 📱 Requisitos del Sistema

- **Navegador:** Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
- **Para XAMPP:** Windows 10/11, macOS 10.14+, Linux
- **Resolución:** Optimizado para móviles y escritorio (responsive)

---

## 🎨 Características de Diseño

- ✅ Diseño institucional Gobierno de Chile
- ✅ Tipografía oficial (Asap/gobCL)
- ✅ Paleta cromática institucional
- ✅ Accesibilidad WCAG 2.1 AA
- ✅ Mobile-first responsive
- ✅ Comportamiento inline (sin recargas)

---

## 📞 Soporte

Para más información o soporte técnico, contacta al equipo de desarrollo.

---

**Versión:** 1.0.0  
**Última actualización:** 2026
