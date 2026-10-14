# 🚀 GUÍA RÁPIDA - Ver el Sitio en el Navegador

## OPCIÓN 1: XAMPP (Recomendado) ⭐

### Windows:
1. Descarga e instala XAMPP: https://www.apachefriends.org/
2. Abre el **Panel de Control de XAMPP**
3. Haz clic en **Start** junto a **Apache** (debe ponerse verde)
4. Copia la carpeta `dist/` completa a: `C:\xampp\htdocs\mesadeayuda\`
5. Abre el navegador en: **http://localhost/mesadeayuda/**

**O usa el instalador automático:**
- Haz doble clic en `instalar-xampp.bat`
- ¡Listo!

### Mac/Linux:
1. Instala XAMPP desde: https://www.apachefriends.org/
2. Copia `dist/` a `/Applications/XAMPP/htdocs/mesadeayuda/` (Mac) o `/opt/lampp/htdocs/mesadeayuda/` (Linux)
3. Inicia Apache desde el panel de XAMPP
4. Abre: **http://localhost/mesadeayuda/**

**O usa el instalador automático:**
```bash
chmod +x instalar-xampp.sh
./instalar-xampp.sh
```

---

## OPCIÓN 2: Servidor Python (Simple) 🐍

Si tienes Python instalado:

```bash
# Abre una terminal en la carpeta del proyecto
cd dist

# Python 3
python -m http.server 8000

# O Python 2
python -m SimpleHTTPServer 8000
```

Abre: **http://localhost:8000**

---

## OPCIÓN 3: Servidor Node.js 📦

Si tienes Node.js instalado:

```bash
# Instala serve globalmente
npm install -g serve

# Sirve la carpeta dist
serve dist
```

Abre la URL que te indique (usualmente http://localhost:3000)

---

## OPCIÓN 4: Abrir Directamente (Limitado) 📂

1. Ve a la carpeta `dist/`
2. Haz doble clic en `index.html`

⚠️ **Advertencia:** Algunas funciones pueden no funcionar correctamente por restricciones de seguridad del navegador.

---

## 🔐 Credenciales

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | admin123 | Administrador |
| supervisor | admin123 | Supervisor |
| tecnico | admin123 | Técnico |

---

## ❓ Problemas Comunes

**Página en blanco:**
- Verifica que Apache esté corriendo en XAMPP
- Asegúrate de que la URL sea correcta: `http://localhost/mesadeayuda/`

**Error 404:**
- Verifica que el archivo `.htaccess` esté en la carpeta `mesadeayuda/`
- Reinicia Apache en XAMPP

**Puerto 80 ocupado:**
- Cambia el puerto de Apache a 8080 en XAMPP
- Accede a: `http://localhost:8080/mesadeayuda/`

---

## 📞 ¿Necesitas Ayuda?

Si tienes problemas, verifica:
1. ✅ XAMPP está instalado y Apache está corriendo
2. ✅ Los archivos están en `htdocs/mesadeayuda/`
3. ✅ La URL es correcta: `http://localhost/mesadeayuda/`
