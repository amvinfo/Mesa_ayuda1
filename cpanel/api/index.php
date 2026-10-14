<?php
/**
 * API - Endpoints del Sistema
 */
require_once __DIR__ . '/../db.php';
session_start();

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// ============================================
// LOGIN
// ============================================
if ($action === 'login' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';
    
    $stmt = $pdo->prepare("SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE (u.username = ? OR u.email = ?) AND u.active = 1");
    $stmt->execute([$username, $username]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($password, $user['password'])) {
        jsonResponse(['error' => 'Credenciales inválidas'], 401);
    }
    
    // Actualizar último login
    $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?")->execute([$user['id']]);
    
    // Crear sesión
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_name'] = $user['full_name'];
    $_SESSION['user_role'] = $user['role_name'];
    $_SESSION['user_email'] = $user['email'];
    
    unset($user['password']);
    jsonResponse(['success' => true, 'user' => $user]);
}

// ============================================
// LOGOUT
// ============================================
if ($action === 'logout') {
    session_destroy();
    jsonResponse(['success' => true]);
}

// ============================================
// VERIFICAR SESIÓN
// ============================================
if ($action === 'me') {
    if (!isset($_SESSION['user_id'])) {
        jsonResponse(['authenticated' => false]);
    }
    
    $stmt = $pdo->prepare("SELECT u.id, u.username, u.email, u.full_name, u.role_id, u.department, u.location, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    
    jsonResponse(['authenticated' => true, 'user' => $user]);
}

// ============================================
// CREAR TICKET PÚBLICO
// ============================================
if ($action === 'create_ticket' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validaciones
    if (empty($data['name']) || empty($data['email']) || empty($data['subject']) || empty($data['description'])) {
        jsonResponse(['error' => 'Campos obligatorios faltantes'], 400);
    }
    
    $ticketNumber = generateTicketNumber();
    $accessToken = generateToken();
    
    $stmt = $pdo->prepare("INSERT INTO tickets (ticket_number, access_token, requester_name, requester_email, requester_phone, department_id, location_id, category_id, type_id, subject, description, priority, status, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', 'public')");
    $stmt->execute([
        $ticketNumber,
        $accessToken,
        $data['name'],
        $data['email'],
        $data['phone'] ?? null,
        $data['department'] ?: null,
        $data['location'] ?: null,
        $data['category_id'],
        $data['type_id'],
        $data['subject'],
        $data['description'],
        $data['priority'] ?? 'medium'
    ]);
    
    $ticketId = $pdo->lastInsertId();
    
    // Registrar en historial
    $pdo->prepare("INSERT INTO ticket_history (ticket_id, user_name, action, description) VALUES (?, ?, 'created', 'Ticket creado desde portal público')")
        ->execute([$ticketId, $data['name']]);
    
    jsonResponse([
        'success' => true,
        'ticket_number' => $ticketNumber,
        'access_token' => $accessToken
    ]);
}

// ============================================
// CONSULTAR TICKET PÚBLICO
// ============================================
if ($action === 'check_ticket' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $ticketNumber = strtoupper(trim($data['ticket_number'] ?? ''));
    $token = $data['access_token'] ?? '';
    
    if (empty($ticketNumber)) {
        jsonResponse(['error' => 'Número de ticket requerido'], 400);
    }
    
    $sql = "SELECT t.*, c.name as category_name, c.icon as category_icon FROM tickets t LEFT JOIN categories c ON t.category_id = c.id WHERE t.ticket_number = ?";
    $params = [$ticketNumber];
    
    if (!empty($token)) {
        $sql .= " AND t.access_token = ?";
        $params[] = $token;
    }
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $ticket = $stmt->fetch();
    
    if (!$ticket) {
        jsonResponse(['error' => 'Ticket no encontrado'], 404);
    }
    
    // Obtener mensajes públicos
    $stmt = $pdo->prepare("SELECT * FROM ticket_messages WHERE ticket_id = ? AND type = 'public' ORDER BY created_at ASC");
    $stmt->execute([$ticket['id']]);
    $ticket['messages'] = $stmt->fetchAll();
    
    // Obtener historial
    $stmt = $pdo->prepare("SELECT * FROM ticket_history WHERE ticket_id = ? ORDER BY created_at ASC");
    $stmt->execute([$ticket['id']]);
    $ticket['history'] = $stmt->fetchAll();
    
    jsonResponse(['success' => true, 'ticket' => $ticket]);
}

// ============================================
// OBTENER CATEGORÍAS
// ============================================
if ($action === 'categories') {
    $scope = $_GET['scope'] ?? 'external';
    
    if ($scope === 'external') {
        $stmt = $pdo->query("SELECT * FROM categories WHERE active = 1 AND scope IN ('external', 'both') ORDER BY name");
    } else {
        $session = requireAuth();
        $stmt = $pdo->query("SELECT * FROM categories WHERE active = 1 ORDER BY name");
    }
    
    jsonResponse($stmt->fetchAll());
}

// ============================================
// OBTENER TIPOS DE TICKET
// ============================================
if ($action === 'ticket_types') {
    $stmt = $pdo->query("SELECT * FROM ticket_types WHERE active = 1 ORDER BY name");
    jsonResponse($stmt->fetchAll());
}

// ============================================
// OBTENER DEPARTAMENTOS
// ============================================
if ($action === 'departments') {
    $stmt = $pdo->query("SELECT * FROM departments WHERE active = 1 ORDER BY name");
    jsonResponse($stmt->fetchAll());
}

// ============================================
// OBTENER UBICACIONES
// ============================================
if ($action === 'locations') {
    $stmt = $pdo->query("SELECT * FROM locations WHERE active = 1 ORDER BY name");
    jsonResponse($stmt->fetchAll());
}

// ============================================
// BUSCAR ARTÍCULOS EXTERNOS
// ============================================
if ($action === 'search_articles') {
    $query = $_GET['q'] ?? '';
    $categoryId = $_GET['category_id'] ?? '';
    
    $sql = "SELECT * FROM knowledge_articles WHERE scope = 'external' AND status = 'published'";
    $params = [];
    
    if (!empty($query)) {
        $sql .= " AND (title LIKE ? OR content LIKE ? OR summary LIKE ? OR keywords LIKE ?)";
        $like = "%$query%";
        $params = [$like, $like, $like, $like];
    }
    
    if (!empty($categoryId)) {
        $sql .= " AND category_id = ?";
        $params[] = $categoryId;
    }
    
    $sql .= " ORDER BY featured DESC, views DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    jsonResponse($stmt->fetchAll());
}

// ============================================
// OBTENER ARTÍCULO
// ============================================
if ($action === 'article') {
    $id = $_GET['id'] ?? 0;
    
    $stmt = $pdo->prepare("SELECT a.*, c.name as category_name, c.icon as category_icon FROM knowledge_articles a LEFT JOIN categories c ON a.category_id = c.id WHERE a.id = ?");
    $stmt->execute([$id]);
    $article = $stmt->fetch();
    
    if (!$article) {
        jsonResponse(['error' => 'Artículo no encontrado'], 404);
    }
    
    // Incrementar vistas
    $pdo->prepare("UPDATE knowledge_articles SET views = views + 1 WHERE id = ?")->execute([$id]);
    
    jsonResponse($article);
}

// ============================================
// DASHBOARD - TICKETS (requiere auth)
// ============================================
if ($action === 'tickets') {
    $session = requireAuth();
    
    $sql = "SELECT t.*, c.name as category_name, c.icon as category_icon, u.full_name as assigned_name FROM tickets t LEFT JOIN categories c ON t.category_id = c.id LEFT JOIN users u ON t.assigned_to = u.id";
    $params = [];
    
    // Filtrar según rol
    if ($_SESSION['user_role'] === 'technician') {
        $sql .= " WHERE t.assigned_to = ?";
        $params[] = $_SESSION['user_id'];
    }
    
    $sql .= " ORDER BY t.updated_at DESC LIMIT 100";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    jsonResponse($stmt->fetchAll());
}

// ============================================
// TICKET DETALLE (requiere auth)
// ============================================
if ($action === 'ticket_detail') {
    $session = requireAuth();
    $id = $_GET['id'] ?? 0;
    
    $stmt = $pdo->prepare("SELECT t.*, c.name as category_name, c.icon as category_icon, u.full_name as assigned_name FROM tickets t LEFT JOIN categories c ON t.category_id = c.id LEFT JOIN users u ON t.assigned_to = u.id WHERE t.id = ?");
    $stmt->execute([$id]);
    $ticket = $stmt->fetch();
    
    if (!$ticket) {
        jsonResponse(['error' => 'Ticket no encontrado'], 404);
    }
    
    // Mensajes
    $stmt = $pdo->prepare("SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC");
    $stmt->execute([$id]);
    $ticket['messages'] = $stmt->fetchAll();
    
    // Historial
    $stmt = $pdo->prepare("SELECT * FROM ticket_history WHERE ticket_id = ? ORDER BY created_at ASC");
    $stmt->execute([$id]);
    $ticket['history'] = $stmt->fetchAll();
    
    jsonResponse($ticket);
}

// ============================================
// AGREGAR MENSAJE A TICKET (requiere auth)
// ============================================
if ($action === 'add_message' && $method === 'POST') {
    $session = requireAuth();
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("INSERT INTO ticket_messages (ticket_id, author_id, author_name, content, type) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([
        $data['ticket_id'],
        $_SESSION['user_id'],
        $_SESSION['user_name'],
        $data['content'],
        $data['type'] ?? 'public'
    ]);
    
    // Actualizar timestamp del ticket
    $pdo->prepare("UPDATE tickets SET updated_at = NOW() WHERE id = ?")->execute([$data['ticket_id']]);
    
    jsonResponse(['success' => true]);
}

// ============================================
// CAMBIAR ESTADO DE TICKET (requiere auth)
// ============================================
if ($action === 'change_status' && $method === 'POST') {
    $session = requireAuth();
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("SELECT status FROM tickets WHERE id = ?");
    $stmt->execute([$data['ticket_id']]);
    $old = $stmt->fetchColumn();
    
    $updates = ['status' => $data['status']];
    if ($data['status'] === 'resolved') $updates['resolved_at'] = date('Y-m-d H:i:s');
    if ($data['status'] === 'closed') $updates['closed_at'] = date('Y-m-d H:i:s');
    
    $set = implode(',', array_map(fn($k) => "$k = ?", array_keys($updates)));
    $sql = "UPDATE tickets SET $set WHERE id = ?";
    $pdo->prepare($sql)->execute([...array_values($updates), $data['ticket_id']]);
    
    // Historial
    $statusLabels = [
        'new' => 'Nuevo', 'open' => 'Abierto', 'assigned' => 'Asignado',
        'in_progress' => 'En atención', 'resolved' => 'Resuelto', 'closed' => 'Cerrado'
    ];
    
    $pdo->prepare("INSERT INTO ticket_history (ticket_id, user_id, user_name, action, description, old_value, new_value) VALUES (?, ?, ?, 'status_change', ?, ?, ?)")
        ->execute([
            $data['ticket_id'],
            $_SESSION['user_id'],
            $_SESSION['user_name'],
            'Estado cambiado de ' . ($statusLabels[$old] ?? $old) . ' a ' . ($statusLabels[$data['status']] ?? $data['status']),
            $old,
            $data['status']
        ]);
    
    jsonResponse(['success' => true]);
}

// ============================================
// ASIGNAR TICKET (requiere auth)
// ============================================
if ($action === 'assign_ticket' && $method === 'POST') {
    $session = requireAuth();
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("SELECT full_name FROM users WHERE id = ?");
    $stmt->execute([$data['user_id']]);
    $userName = $stmt->fetchColumn();
    
    $pdo->prepare("UPDATE tickets SET assigned_to = ?, status = 'assigned', assigned_at = NOW() WHERE id = ?")
        ->execute([$data['user_id'], $data['ticket_id']]);
    
    $pdo->prepare("INSERT INTO ticket_history (ticket_id, user_id, user_name, action, description) VALUES (?, ?, ?, 'assigned', ?)")
        ->execute([$data['ticket_id'], $_SESSION['user_id'], $_SESSION['user_name'], "Asignado a $userName"]);
    
    jsonResponse(['success' => true]);
}

// ============================================
// OBTENER TÉCNICOS (requiere auth)
// ============================================
if ($action === 'technicians') {
    requireAuth();
    $stmt = $pdo->query("SELECT id, full_name FROM users WHERE role_id = 3 AND active = 1 ORDER BY full_name");
    jsonResponse($stmt->fetchAll());
}

// ============================================
// ESTADÍSTICAS DASHBOARD (requiere auth)
// ============================================
if ($action === 'stats') {
    $session = requireAuth();
    
    $where = '';
    $params = [];
    if ($_SESSION['user_role'] === 'technician') {
        $where = 'WHERE assigned_to = ?';
        $params[] = $_SESSION['user_id'];
    }
    
    $stats = [];
    
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM tickets $where");
    $stmt->execute($params);
    $stats['total'] = $stmt->fetchColumn();
    
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM tickets $where AND status = 'new'");
    $stmt->execute($params);
    $stats['new'] = $stmt->fetchColumn();
    
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM tickets $where AND status IN ('open','assigned','in_progress')");
    $stmt->execute($params);
    $stats['in_progress'] = $stmt->fetchColumn();
    
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM tickets $where AND status = 'resolved'");
    $stmt->execute($params);
    $stats['resolved'] = $stmt->fetchColumn();
    
    jsonResponse($stats);
}

// ============================================
// ARTÍCULOS INTERNOS (requiere auth)
// ============================================
if ($action === 'internal_articles') {
    requireAuth();
    $stmt = $pdo->query("SELECT a.*, c.name as category_name FROM knowledge_articles a LEFT JOIN categories c ON a.category_id = c.id WHERE a.scope = 'internal' ORDER BY a.updated_at DESC");
    jsonResponse($stmt->fetchAll());
}

jsonResponse(['error' => 'Acción no válida'], 404);
