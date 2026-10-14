<?php
/**
 * Mesa de Ayuda - Instalador
 * Gobierno de Chile
 */

session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

$step = isset($_GET['step']) ? intval($_GET['step']) : 1;
$error = '';
$success = '';

// Procesar formularios
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($step === 2) {
        // Guardar configuración de BD
        $db_host = $_POST['db_host'] ?? 'localhost';
        $db_name = $_POST['db_name'] ?? 'mesadeayuda';
        $db_user = $_POST['db_user'] ?? '';
        $db_pass = $_POST['db_pass'] ?? '';
        
        $_SESSION['db_config'] = [
            'host' => $db_host,
            'name' => $db_name,
            'user' => $db_user,
            'pass' => $db_pass
        ];
        
        // Probar conexión
        try {
            $pdo = new PDO("mysql:host=$db_host", $db_user, $db_pass);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Crear base de datos
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            
            $step = 3;
        } catch (PDOException $e) {
            $error = 'Error de conexión: ' . $e->getMessage();
        }
    } elseif ($step === 3) {
        // Instalar base de datos
        if (!isset($_SESSION['db_config'])) {
            $error = 'Configuración de base de datos no encontrada';
            $step = 2;
        } else {
            try {
                $config = $_SESSION['db_config'];
                $pdo = new PDO("mysql:host={$config['host']};dbname={$config['name']}", $config['user'], $config['pass']);
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                
                // Leer y ejecutar SQL
                $sql = file_get_contents(__DIR__ . '/database.sql');
                $pdo->exec($sql);
                
                // Crear archivo de configuración
                $config_content = "<?php\n";
                $config_content .= "define('DB_HOST', '{$config['host']}');\n";
                $config_content .= "define('DB_NAME', '{$config['name']}');\n";
                $config_content .= "define('DB_USER', '{$config['user']}');\n";
                $config_content .= "define('DB_PASS', '{$config['pass']}');\n";
                $config_content .= "define('SITE_URL', '" . dirname($_SERVER['REQUEST_URI']) . "');\n";
                $config_content .= "define('INSTALLED', true);\n";
                
                file_put_contents(__DIR__ . '/config.php', $config_content);
                
                // Marcar como instalado
                $pdo->exec("UPDATE settings SET value = '1' WHERE key_name = 'installed'");
                
                $step = 4;
                $success = '¡Instalación completada exitosamente!';
                
                // Limpiar sesión
                unset($_SESSION['db_config']);
                
            } catch (PDOException $e) {
                $error = 'Error al instalar base de datos: ' . $e->getMessage();
            }
        }
    } elseif ($step === 4) {
        // Finalizar instalación
        header('Location: index.html');
        exit;
    }
}

// Verificar si ya está instalado
if (file_exists(__DIR__ . '/config.php')) {
    require_once __DIR__ . '/config.php';
    if (defined('INSTALLED') && INSTALLED) {
        header('Location: index.html');
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instalador - Mesa de Ayuda</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0066B3 0%, #004A83 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 600px;
            width: 100%;
            overflow: hidden;
        }
        .header {
            background: #004A83;
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 14px; }
        .content { padding: 40px; }
        .steps {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            position: relative;
        }
        .steps::before {
            content: '';
            position: absolute;
            top: 20px;
            left: 0;
            right: 0;
            height: 2px;
            background: #e0e0e0;
            z-index: 0;
        }
        .step {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #e0e0e0;
            color: #999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            position: relative;
            z-index: 1;
        }
        .step.active {
            background: #0066B3;
            color: white;
        }
        .step.completed {
            background: #4CAF50;
            color: white;
        }
        .form-group { margin-bottom: 20px; }
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
            font-size: 14px;
        }
        input[type="text"], input[type="password"] {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        input:focus {
            outline: none;
            border-color: #0066B3;
        }
        .btn {
            background: #0066B3;
            color: white;
            padding: 14px 30px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: background 0.3s;
        }
        .btn:hover { background: #004A83; }
        .alert {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .alert-error {
            background: #ffebee;
            border: 2px solid #f44336;
            color: #c62828;
        }
        .alert-success {
            background: #e8f5e9;
            border: 2px solid #4caf50;
            color: #2e7d32;
        }
        .info-box {
            background: #e3f2fd;
            border-left: 4px solid #0066B3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-box h3 {
            color: #004A83;
            margin-bottom: 10px;
            font-size: 16px;
        }
        .info-box ul {
            margin-left: 20px;
            color: #555;
            line-height: 1.8;
        }
        .credentials {
            background: #fff8e1;
            border: 2px solid #ffc107;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .credentials h3 {
            color: #f57f17;
            margin-bottom: 10px;
        }
        .credentials code {
            background: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 Mesa de Ayuda</h1>
            <p>Instalador del Sistema - Gobierno de Chile</p>
        </div>
        
        <div class="content">
            <!-- Indicador de pasos -->
            <div class="steps">
                <div class="step <?php echo $step >= 1 ? 'active' : ''; ?> <?php echo $step > 1 ? 'completed' : ''; ?>">1</div>
                <div class="step <?php echo $step >= 2 ? 'active' : ''; ?> <?php echo $step > 2 ? 'completed' : ''; ?>">2</div>
                <div class="step <?php echo $step >= 3 ? 'active' : ''; ?> <?php echo $step > 3 ? 'completed' : ''; ?>">3</div>
                <div class="step <?php echo $step >= 4 ? 'active' : ''; ?>">4</div>
            </div>
            
            <?php if ($error): ?>
                <div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>
            
            <?php if ($success): ?>
                <div class="alert alert-success"><?php echo htmlspecialchars($success); ?></div>
            <?php endif; ?>
            
            <?php if ($step === 1): ?>
                <h2 style="margin-bottom: 20px; color: #004A83;">Bienvenido al Instalador</h2>
                <p style="margin-bottom: 20px; color: #666;">
                    Este asistente le guiará en la instalación del sistema de Mesa de Ayuda.
                </p>
                
                <div class="info-box">
                    <h3>📋 Requisitos del Sistema</h3>
                    <ul>
                        <li>PHP 7.4 o superior</li>
                        <li>MySQL 5.7 o superior / MariaDB 10.3+</li>
                        <li>Extensión PDO MySQL habilitada</li>
                        <li>Permisos de escritura en el directorio</li>
                    </ul>
                </div>
                
                <div class="info-box">
                    <h3>✅ Verificación del Sistema</h3>
                    <ul>
                        <li>PHP Version: <?php echo phpversion(); ?> <?php echo version_compare(phpversion(), '7.4.0', '>=') ? '✓' : '✗'; ?></li>
                        <li>PDO MySQL: <?php echo extension_loaded('pdo_mysql') ? '✓ Habilitado' : '✗ No habilitado'; ?></li>
                        <li>Permisos de escritura: <?php echo is_writable(__DIR__) ? '✓ OK' : '✗ Sin permisos'; ?></li>
                    </ul>
                </div>
                
                <form method="POST" action="?step=2">
                    <button type="submit" class="btn">Comenzar Instalación →</button>
                </form>
                
            <?php elseif ($step === 2): ?>
                <h2 style="margin-bottom: 20px; color: #004A83;">Configuración de Base de Datos</h2>
                <p style="margin-bottom: 20px; color: #666;">
                    Ingrese los datos de conexión a su base de datos MySQL.
                </p>
                
                <form method="POST" action="?step=2">
                    <div class="form-group">
                        <label>Servidor de Base de Datos</label>
                        <input type="text" name="db_host" value="localhost" required>
                        <small style="color: #999;">Generalmente es "localhost" en cPanel</small>
                    </div>
                    
                    <div class="form-group">
                        <label>Nombre de la Base de Datos</label>
                        <input type="text" name="db_name" value="mesadeayuda" required>
                        <small style="color: #999;">En cPanel puede ser: usuario_mesadeayuda</small>
                    </div>
                    
                    <div class="form-group">
                        <label>Usuario de Base de Datos</label>
                        <input type="text" name="db_user" required>
                        <small style="color: #999;">Usuario creado en cPanel para la BD</small>
                    </div>
                    
                    <div class="form-group">
                        <label>Contraseña de Base de Datos</label>
                        <input type="password" name="db_pass" required>
                    </div>
                    
                    <button type="submit" class="btn">Probar Conexión →</button>
                </form>
                
            <?php elseif ($step === 3): ?>
                <h2 style="margin-bottom: 20px; color: #004A83;">Instalar Base de Datos</h2>
                <p style="margin-bottom: 20px; color: #666;">
                    Se creará la estructura de la base de datos y los datos iniciales.
                </p>
                
                <div class="info-box">
                    <h3>📦 Esto instalará:</h3>
                    <ul>
                        <li>Tablas del sistema (usuarios, tickets, categorías, etc.)</li>
                        <li>Roles y permisos predeterminados</li>
                        <li>Usuarios de ejemplo (admin, supervisor, técnico)</li>
                        <li>Categorías y tipos de ticket</li>
                        <li>Artículos de conocimiento de ejemplo</li>
                    </ul>
                </div>
                
                <form method="POST" action="?step=3">
                    <button type="submit" class="btn">Instalar Base de Datos →</button>
                </form>
                
            <?php elseif ($step === 4): ?>
                <h2 style="margin-bottom: 20px; color: #4CAF50;">✓ Instalación Completada</h2>
                <p style="margin-bottom: 20px; color: #666;">
                    El sistema ha sido instalado exitosamente. Ya puede comenzar a usarlo.
                </p>
                
                <div class="credentials">
                    <h3>🔐 Credenciales de Acceso</h3>
                    <p style="margin-bottom: 10px;"><strong>Administrador:</strong> <code>admin</code> / <code>admin123</code></p>
                    <p style="margin-bottom: 10px;"><strong>Supervisor:</strong> <code>supervisor</code> / <code>admin123</code></p>
                    <p><strong>Técnico:</strong> <code>tecnico</code> / <code>admin123</code></p>
                </div>
                
                <div class="info-box">
                    <h3>⚠️ Importante</h3>
                    <ul>
                        <li>Cambie las contraseñas después del primer inicio de sesión</li>
                        <li>Elimine este archivo (install.php) por seguridad</li>
                        <li>Configure el correo SMTP en el panel de administración</li>
                    </ul>
                </div>
                
                <form method="POST" action="?step=4">
                    <button type="submit" class="btn">Ir al Sitio →</button>
                </form>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
