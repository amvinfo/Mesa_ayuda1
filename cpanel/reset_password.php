<?php
/**
 * Script para restablecer contrasenas de usuarios
 * ELIMINAR este archivo despues de usarlo por seguridad
 */

// Cargar configuracion
if (!file_exists(__DIR__ . '/config.php')) {
    die('Error: No se encontro config.php. Ejecute el instalador primero.');
}
require_once __DIR__ . '/config.php';

// Nueva contrasena para todos los usuarios
$newPassword = 'admin123';

// Generar hash correcto
$hash = password_hash($newPassword, PASSWORD_DEFAULT);

echo '<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Restablecer Contrasenas</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
        th { background: #f5f5f5; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>Restablecer Contrasenas</h1>';

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    // Actualizar contrasena del administrador
    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE username = 'admin'");
    $stmt->execute([$hash]);
    $adminUpdated = $stmt->rowCount();
    
    // Actualizar contrasena del supervisor
    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE username = 'supervisor'");
    $stmt->execute([$hash]);
    $supervisorUpdated = $stmt->rowCount();
    
    // Actualizar contrasena del tecnico
    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE username = 'tecnico'");
    $stmt->execute([$hash]);
    $tecnicoUpdated = $stmt->rowCount();
    
    echo '<div class="success">
        <strong>Contrasenas actualizadas correctamente</strong>
    </div>';
    
    echo '<div class="info">
        <strong>Hash generado:</strong><br>
        <code>' . htmlspecialchars($hash) . '</code>
    </div>';
    
    echo '<h2>Credenciales Actualizadas</h2>
    <table>
        <tr>
            <th>Usuario</th>
            <th>Contrasena</th>
            <th>Estado</th>
        </tr>
        <tr>
            <td>admin</td>
            <td>' . $newPassword . '</td>
            <td>' . ($adminUpdated > 0 ? 'Actualizado' : 'No encontrado') . '</td>
        </tr>
        <tr>
            <td>supervisor</td>
            <td>' . $newPassword . '</td>
            <td>' . ($supervisorUpdated > 0 ? 'Actualizado' : 'No encontrado') . '</td>
        </tr>
        <tr>
            <td>tecnico</td>
            <td>' . $newPassword . '</td>
            <td>' . ($tecnicoUpdated > 0 ? 'Actualizado' : 'No encontrado') . '</td>
        </tr>
    </table>';
    
    echo '<div class="warning">
        <strong>IMPORTANTE:</strong> Elimine este archivo (reset_password.php) inmediatamente despues de usarlo por seguridad.
    </div>';
    
    echo '<div class="info">
        <a href="login.html">Ir al login</a>
    </div>';
    
} catch (PDOException $e) {
    echo '<div class="error">
        <strong>Error:</strong> ' . htmlspecialchars($e->getMessage()) . '
    </div>';
}

echo '</body></html>';
?>
