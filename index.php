<?php
/**
 * Mesa de Ayuda - Punto de Entrada para XAMPP
 * Este archivo verifica la instalación y redirige al sitio
 */

// Verificar si la instalación está completa
$installed = file_exists(__DIR__ . '/index.html') && is_dir(__DIR__ . '/assets');

if (!$installed) {
    // Mostrar instrucciones de instalación
    ?>
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mesa de Ayuda - Instalación</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 800px;
                margin: 50px auto;
                padding: 20px;
                background: #f5f5f5;
            }
            .container {
                background: white;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            h1 { color: #004A83; }
            .warning {
                background: #FFF8E1;
                border: 2px solid #F57F17;
                color: #F57F17;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .success {
                background: #E8F5E9;
                border: 2px solid #4CAF50;
                color: #2E7D32;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
            }
            code {
                background: #f5f5f5;
                padding: 2px 8px;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
            }
            ol { line-height: 2; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🏥 Mesa de Ayuda</h1>
            <p>Sistema de Soporte Técnico - Gobierno de Chile</p>
            
            <div class="warning">
                <strong>⚠️ Instalación incompleta</strong><br>
                Los archivos del sitio no se encuentran en esta ubicación.
            </div>

            <h3>📋 Pasos para completar la instalación:</h3>
            <ol>
                <li>En tu computadora local, ejecuta: <code>npm run build</code></li>
                <li>Se generará una carpeta <code>dist/</code> con los archivos del sitio</li>
                <li>Copia TODO el contenido de <code>dist/</code> a esta carpeta:
                    <br><code><?php echo __DIR__; ?></code>
                </li>
                <li>Los archivos necesarios son:
                    <ul>
                        <li><code>index.html</code></li>
                        <li><code>.htaccess</code></li>
                        <li>Carpeta <code>assets/</code> (con archivos JS y CSS)</li>
                    </ul>
                </li>
                <li>Recarga esta página</li>
            </ol>

            <div class="success">
                <strong>✅ Después de copiar los archivos, el sitio estará disponible en:</strong><br>
                <a href="<?php echo $_SERVER['REQUEST_URI']; ?>"><?php echo $_SERVER['REQUEST_URI']; ?></a>
            </div>

            <h3>🔐 Credenciales de acceso:</h3>
            <ul>
                <li><strong>Administrador:</strong> admin / admin123</li>
                <li><strong>Supervisor:</strong> supervisor / admin123</li>
                <li><strong>Técnico:</strong> tecnico / admin123</li>
            </ul>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// Si está instalado, redirigir al index.html
header('Location: index.html');
exit;
?>
