# 🏥 MESA DE AYUDA - Guía de Instalación en cPanel

## 📋 Requisitos

- cPanel con acceso al Administrador de Archivos
- PHP 7.4 o superior
- MySQL 5.7+ o MariaDB 10.3+

---

## 🚀 Instalación Paso a Paso

### PASO 1: Crear Base de Datos en cPanel

1. Ingresa a tu **cPanel**
2. Busca la sección **"Bases de Datos"** y haz clic en **"Bases de Datos MySQL"**
3. En **"Crear nueva base de datos"**:
   - Nombre: `mesadeayuda` (cPanel agregará un prefijo automáticamente, ej: `usuario_mesadeayuda`)
   - Haz clic en **"Crear base de datos"**
4. En **"Agregar nuevo usuario"**:
   - Usuario: `mesa_user` (o el nombre que prefieras)
   - Contraseña: Crea una contraseña segura y **GUÁRDALA**
   - Haz clic en **"Crear un usuario"**
5. En **"Agregar usuario a base de datos"**:
   - Selecciona el usuario y la base de datos que creaste
   - Marca **"TODOS LOS PRIVILEGIOS"**
   - Haz clic en **"Realizar cambios"**

**⚠️ ANOTA ESTA INFORMACIÓN:**
- Nombre completo de la BD: `__________`
- Usuario: `__________`
- Contraseña: `__________`
- Host: `localhost` (generalmente)

---

### PASO 2: Subir Archivos a cPanel

1. En cPanel, ve al **"Administrador de Archivos"**
2. Navega a la carpeta `public_html` (o la carpeta de tu dominio)
3. Si quieres instalar en un subdirectorio (ej: `soporte`), créalo primero
4. Haz clic en **"Cargar"** (Upload)
5. Comprime la carpeta `cpanel/` en un archivo ZIP
6. Sube el archivo ZIP
7. Regresa al Administrador de Archivos
8. Haz clic derecho sobre el ZIP → **"Extract"** (Extraer)
9. Mueve todos los archivos a la carpeta raíz (si es necesario)

**Estructura final debe ser:**
```
public_html/
├── index.html
├── login.html
├── dashboard.html
├── install.php
├── db.php
├── .htaccess
├── database.sql
└── api/
    └── index.php
```

---

### PASO 3: Ejecutar el Instalador

1. Abre tu navegador
2. Ve a: `https://tudominio.com/install.php`
   (o `https://tudominio.com/soporte/install.php` si usaste subdirectorio)
3. Sigue los pasos del instalador:
   - **Paso 1:** Verifica los requisitos → Clic en "Comenzar"
   - **Paso 2:** Ingresa los datos de la BD:
     - Servidor: `localhost`
     - Base de datos: el nombre completo (ej: `usuario_mesadeayuda`)
     - Usuario: el usuario que creaste
     - Contraseña: la contraseña del usuario
   - **Paso 3:** Clic en "Instalar Base de Datos"
   - **Paso 4:** ¡Listo! Clic en "Ir al Sitio"

---

### PASO 4: Primer Acceso

1. Ve a `https://tudominio.com/`
2. Haz clic en **"Iniciar Sesión"** (arriba a la derecha)
3. Usa las credenciales:

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | admin123 | Administrador |
| supervisor | supervisor123 | Supervisor |
| tecnico | tecnico123 | Técnico |

4. **⚠️ IMPORTANTE:** Cambia las contraseñas inmediatamente

---

## 🔒 Seguridad Post-Instalación

1. **Elimina el instalador:** Borra el archivo `install.php`
2. **Cambia contraseñas:** Actualiza las contraseñas de los usuarios
3. **Configura HTTPS:** Activa SSL en cPanel (gratis con Let's Encrypt)
4. **Verifica permisos:** Los archivos deben tener permisos 644 y carpetas 755

---

## ❓ Solución de Problemas

### Error: "Error de conexión"
- Verifica que el nombre de la BD sea correcto (incluye el prefijo de cPanel)
- Verifica que el usuario tenga permisos sobre la BD
- El host generalmente es `localhost` en cPanel

### Error: "Página en blanco"
- Verifica la versión de PHP (mínimo 7.4)
- Revisa los errores en el log de errores de cPanel
- Verifica que todos los archivos se subieron correctamente

### Error: "404 Not Found"
- Verifica que el archivo `.htaccess` esté presente
- Asegúrate de que mod_rewrite esté habilitado (casi siempre lo está en cPanel)

### Error: "No se puede crear config.php"
- Verifica los permisos de la carpeta (deben ser 755)
- Desde el Administrador de Archivos, verifica que puedas crear archivos

---

## 📞 Soporte

Si tienes problemas durante la instalación:
1. Revisa el log de errores en cPanel
2. Verifica que cumplas con todos los requisitos
3. Asegúrate de que los datos de la BD sean correctos

---

## 📁 Estructura de Archivos

```
cpanel/
├── index.html          → Portal público principal
├── login.html          → Página de inicio de sesión
├── dashboard.html      → Panel interno de funcionarios
├── install.php         → Instalador web
├── db.php              → Conexión a base de datos
├── config.php          → (se genera en instalación) Configuración
├── database.sql        → Script de base de datos
├── .htaccess           → Configuración Apache
└── api/
    └── index.php       → Endpoints de la API
```

---

**Versión:** 1.0.0  
**Compatible con:** cPanel, Plesk, hosting compartido con PHP+MySQL
