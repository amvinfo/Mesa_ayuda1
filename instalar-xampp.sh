#!/bin/bash
# ============================================
# Script de Instalación Automática para XAMPP
# Mesa de Ayuda - Gobierno de Chile (Mac/Linux)
# ============================================

echo ""
echo "============================================"
echo "  INSTALADOR MESA DE AYUDA - XAMPP"
echo "============================================"
echo ""

# Detectar ruta de XAMPP
XAMPP_PATH=""
if [ -d "/Applications/XAMPP/xamppfiles" ]; then
    XAMPP_PATH="/Applications/XAMPP/xamppfiles"
    echo "[OK] XAMPP encontrado en /Applications/XAMPP"
elif [ -d "/opt/lampp" ]; then
    XAMPP_PATH="/opt/lampp"
    echo "[OK] XAMPP encontrado en /opt/lampp"
else
    echo "[ERROR] XAMPP no encontrado"
    echo ""
    echo "Por favor, instala XAMPP primero desde:"
    echo "https://www.apachefriends.org/"
    echo ""
    exit 1
fi

# Crear carpeta de destino
echo ""
echo "[1/3] Creando carpeta de instalación..."
mkdir -p "$XAMPP_PATH/htdocs/mesadeayuda"
echo "[OK] Carpeta creada: $XAMPP_PATH/htdocs/mesadeayuda"

# Copiar archivos
echo ""
echo "[2/3] Copiando archivos..."
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cp -R "$SCRIPT_DIR/dist/"* "$XAMPP_PATH/htdocs/mesadeayuda/"
echo "[OK] Archivos copiados correctamente"

# Instrucciones finales
echo ""
echo "[3/3] Instalación completada"
echo ""
echo "============================================"
echo "  INSTRUCCIONES FINALES"
echo "============================================"
echo ""
echo "1. Inicia XAMPP:"
echo "   Mac: Abre la aplicación XAMPP y pulsa Start en Apache"
echo "   Linux: sudo /opt/lampp/lampp start"
echo ""
echo "2. Abre tu navegador en:"
echo ""
echo "   http://localhost/mesadeayuda/"
echo ""
echo "============================================"
echo "  CREDENCIALES DE PRUEBA"
echo "============================================"
echo ""
echo "Administrador: admin / admin123"
echo "Supervisor:    supervisor / admin123"
echo "Tecnico:       tecnico / admin123"
echo ""
echo "============================================"
echo ""
