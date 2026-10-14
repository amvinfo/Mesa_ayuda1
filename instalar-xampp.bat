@echo off
REM ============================================
REM Script de Instalación Automática para XAMPP
REM Mesa de Ayuda - Gobierno de Chile
REM ============================================

echo.
echo ============================================
echo   INSTALADOR MESA DE AYUDA - XAMPP
echo ============================================
echo.

REM Verificar si XAMPP está instalado en la ubicación predeterminada
if exist "C:\xampp\apache" (
    echo [OK] XAMPP encontrado en C:\xampp
    set XAMPP_PATH=C:\xampp
) else (
    echo [ERROR] XAMPP no encontrado en C:\xampp
    echo.
    echo Por favor, instala XAMPP primero desde:
    echo https://www.apachefriends.org/
    echo.
    pause
    exit /b 1
)

REM Crear carpeta de destino
echo.
echo [1/3] Creando carpeta de instalación...
if not exist "%XAMPP_PATH%\htdocs\mesadeayuda" (
    mkdir "%XAMPP_PATH%\htdocs\mesadeayuda"
    echo [OK] Carpeta creada: %XAMPP_PATH%\htdocs\mesadeayuda
) else (
    echo [OK] Carpeta ya existe
)

REM Copiar archivos
echo.
echo [2/3] Copiando archivos...
xcopy /E /Y /Q "%~dp0dist\*" "%XAMPP_PATH%\htdocs\mesadeayuda\" >nul
if errorlevel 1 (
    echo [ERROR] No se pudieron copiar los archivos
    pause
    exit /b 1
)
echo [OK] Archivos copiados correctamente

REM Instrucciones finales
echo.
echo [3/3] Instalación completada
echo.
echo ============================================
echo   INSTRUCCIONES FINALES
echo ============================================
echo.
echo 1. Abre el Panel de Control de XAMPP
echo 2. Inicia Apache (boton Start)
echo 3. Abre tu navegador en:
echo.
echo    http://localhost/mesadeayuda/
echo.
echo ============================================
echo   CREDENCIALES DE PRUEBA
echo ============================================
echo.
echo Administrador: admin / admin123
echo Supervisor:    supervisor / admin123
echo Tecnico:       tecnico / admin123
echo.
echo ============================================
echo.

pause
