<?php
/**
 * Mesa de Ayuda - Instalador
 * Gobierno de Chile
 * 
 * IMPORTANTE: En cPanel, la base de datos debe crearse previamente
 * desde el panel de control (Bases de Datos MySQL).
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
        $db_host = trim($_POST['db_host'] ?? 'localhost');
        $db_name = trim($_POST['db_name'] ?? '');
        $db_user = trim($_POST['db_user'] ?? '');
        $db_pass = $_POST['db_pass'] ?? '';
        
        // Validar campos
        if (empty($db_name) || empty($db_user)) {
            $error = 'Debe completar todos los campos obligatorios.';
        } else {
            $_SESSION['db_config'] = [
                'host' => $db_host,
                'name' => $db_name,
                'user' => $db_user,
                'pass' => $db_pass
            ];
            
            // Probar conexión a la BD (NO crear, solo conectar)
            try {
                $pdo = new PDO(
                    "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", 
                    $db_user, 
                    $db_pass,
                    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
                );
                
                // Verificar que la BD existe y está accesible
                $stmt = $pdo->query("SELECT DATABASE()");
                $currentDb = $stmt->fetchColumn();
                
                if ($currentDb !== $db_name) {
                    $error = "Conexión exitosa pero la base de datos actual ($currentDb) no coincide con la especificada ($db_name).";
                } else {
                    $step = 3;
                }
                
            } catch (PDOException $e) {
                $errorMsg = $e->getMessage();
                
                if (strpos($errorMsg, 'Access denied') !== false) {
                    $error = 'Acceso denegado. Verifique que el usuario y contraseña sean correctos, y que el usuario tenga permisos sobre la base de datos.';
                } elseif (strpos($errorMsg, 'Unknown database') !== false) {
                    $error = "La base de datos '$db_name' no existe. Por favor, créela primero desde cPanel → Bases de Datos MySQL.";
                } elseif (strpos($errorMsg, "Can't connect") !== false || strpos($errorMsg, 'Connection refused') !== false) {
                    $error = 'No se puede conectar al servidor MySQL. Verifique el host (generalmente es "localhost" en cPanel).';
                } else {
                    $error = 'Error de conexión: ' . $errorMsg;
                }
            }
        }
    } elseif ($step === 3) {
        // Instalar base de datos
        if (!isset($_SESSION['db_config'])) {
            $error = 'Configuración de base de datos no encontrada. Por favor, vuelva al paso anterior.';
            $step = 2;
        } else {
            try {
                $config = $_SESSION['db_config'];
                $pdo = new PDO(
                    "mysql:host={$config['host']};dbname={$config['name']};charset=utf8mb4", 
                    $config['user'], 
                    $config['pass'],
                    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
                );
                
                // Leer y ejecutar SQL
                $sql = file_get_contents(__DIR__ . '/database.sql');
                
                // Ejecutar cada statement por separado
                $statements = array_filter(array_map('trim', explode(';', $sql)));
                
                foreach ($statements as $statement) {
                    if (!empty($statement) && !preg_match('/^--/', $statement)) {
                        try {
                            $pdo->exec($statement);
                        } catch (PDOException $e) {
                            // Ignorar errores de DROP TABLE si no existe
                            if (strpos($e->getMessage(), 'Unknown table') === false) {
                                throw $e;
                            }
                        }
                    }
                }
                
                // Crear archivo de configuración
                $config_content = "<?php\n";
                $config_content .= "// Configuración generada automáticamente el " . date('Y-m-d H:i:s') . "\n";
                $config_content .= "// NO MODIFICAR ESTE ARCHIVO MANUALMENTE\n\n";
                $config_content .= "define('DB_HOST', '" . addslashes($config['host']) . "');\n";
                $config_content .= "define('DB_NAME', '" . addslashes($config['name']) . "');\n";
                $config_content .= "define('DB_USER', '" . addslashes($config['user']) . "');\n";
                $config_content .= "define('DB_PASS', '" . addslashes($config['pass']) . "');\n";
                $config_content .= "define('SITE_URL', '" . dirname($_SERVER['REQUEST_URI']) . "');\n";
                $config_content .= "define('INSTALLED', true);\n";
                $config_content .= "define('INSTALL_DATE', '" . date('Y-m-d H:i:s') . "');\n";
                
                if (file_put_contents(__DIR__ . '/config.php', $config_content) === false) {
                    throw new Exception('No se pudo crear el archivo config.php. Verifique los permisos de la carpeta.');
                }
                
                // Marcar como instalado
                $pdo->exec("UPDATE settings SET value = '1' WHERE key_name = 'installed'");
                
                $step = 4;
                $success = '¡Instalación completada exitosamente!';
                
                // Limpiar sesión
                unset($_SESSION['db_config']);
                
            } catch (PDOException $e) {
                $error = 'Error al instalar base de datos: ' . $e->getMessage();
            } catch (Exception $e) {
                $error = $e->getMessage();
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
            max-width: 650px;
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
        .warning-box {
            background: #fff8e1;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .warning-box h3 {
            color: #f57f17;
            margin-bottom: 10px;
            font-size: 16px;
        }
        .warning-box p {
            color: #666;
            line-height: 1.6;
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
        .help-text {
            font-size: 12px;
            color: #666;
            margin-top: 4px;
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
                
                <div class="warning-box">
                    <h3>⚠️ IMPORTANTE: Base de Datos</h3>
                    <p>
                        <strong>Antes de continuar, debe crear la base de datos desde cPanel:</strong>
                    </p>
                    <ol style="margin-left: 20px; margin-top: 10px; line-height: 2;">
                        <li>Ingrese a cPanel → <strong>Bases de Datos MySQL</strong></li>
                        <li>Cree una nueva base de datos (ej: <code>mesadeayuda</code>)</li>
                        <li>Cree un usuario con contraseña segura</li>
                        <li>Asigne <strong>TODOS LOS PRIVILEGIOS</strong> al usuario sobre la BD</li>
                        <li><strong>ANOTE</strong> el nombre completo de la BD (incluye prefijo de cPanel)</li>
                    </ol>
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
                    Ingrese los datos de la base de datos que creó en cPanel.
                </p>
                
                <div class="warning-box">
                    <h3>💡 Ayuda</h3>
                    <p>
                        En cPanel, el nombre de la base de datos incluye un prefijo. Por ejemplo:<br>
                        Si su usuario de cPanel es <code>cuarzodi</code> y creó la BD <code>mesadeayuda</code>,<br>
                        el nombre completo será: <code>cuarzodi_mesadeayuda</code>
                    </p>
                </div>
                
                <form method="POST" action="?step=2">
                    <div class="form-group">
                        <label>Servidor de Base de Datos</label>
                        <input type="text" name="db_host" value="localhost" required>
                        <p class="help-text">Generalmente es "localhost" en cPanel</p>
                    </div>
                    
                    <div class="form-group">
                        <label>Nombre Completo de la Base de Datos *</label>
                        <input type="text" name="db_name" value="" required placeholder="ej: cuarzodi_mesadeayuda">
                        <p class="help-text">Incluya el prefijo de cPanel (ej: usuario_mesadeayuda)</p>
                    </div>
                    
                    <div class="form-group">
                        <label>Usuario de Base de Datos *</label>
                        <input type="text" name="db_user" value="" required placeholder="ej: cuarzodi_mesa_user">
                        <p class="help-text">Usuario creado en cPanel para la BD (incluye prefijo)</p>
                    </div>
                    
                    <div class="form-group">
                        <label>Contraseña de Base de Datos *</label>
                        <input type="password" name="db_pass" required>
                        <p class="help-text">Contraseña del usuario de la BD</p>
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
                
                <div class="info-box">
                    <h3>🔗 Conexión verificada</h3>
                    <ul>
                        <li>Servidor: <strong><?php echo htmlspecialchars($_SESSION['db_config']['host']); ?></strong></li>
                        <li>Base de datos: <strong><?php echo htmlspecialchars($_SESSION['db_config']['name']); ?></strong></li>
                        <li>Usuario: <strong><?php echo htmlspecialchars($_SESSION['db_config']['user']); ?></strong></li>
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
                
                <div class="warning-box">
                    <h3>⚠️ Pasos de Seguridad</h3>
                    <ol style="margin-left: 20px; line-height: 2;">
                        <li><strong>ELIMINE</strong> este archivo (install.php) inmediatamente</li>
                        <li>Cambie las contraseñas de los usuarios después del primer login</li>
                        <li>Active HTTPS/SSL en cPanel</li>
                        <li>Verifique los permisos de archivos (644 para archivos, 755 para carpetas)</li>
                    </ol>
                </div>
                
                <form method="POST" action="?step=4">
                    <button type="submit" class="btn">Ir al Sitio →</button>
                </form>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
