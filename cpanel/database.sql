-- =====================================================
-- MESA DE AYUDA - Base de Datos
-- Gobierno de Chile - Sistema de Soporte Técnico
-- =====================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `mesadeayuda` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `mesadeayuda`;

-- =====================================================
-- TABLA: roles
-- =====================================================
CREATE TABLE `roles` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `permissions` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TABLA: users
-- =====================================================
CREATE TABLE `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `role_id` INT(11) NOT NULL,
  `department` VARCHAR(100) DEFAULT NULL,
  `location` VARCHAR(100) DEFAULT NULL,
  `active` TINYINT(1) DEFAULT 1,
  `last_login` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TABLA: departments
-- =====================================================
CREATE TABLE `departments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `active` TINYINT(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TABLA: locations
-- =====================================================
CREATE TABLE `locations` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `active` TINYINT(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TABLA: categories
-- =====================================================
CREATE TABLE `categories` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(10) DEFAULT '📁',
  `description` VARCHAR(255) DEFAULT NULL,
  `scope` ENUM('external','internal','both') DEFAULT 'both',
  `active` TINYINT(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TABLA: ticket_types
-- =====================================================
CREATE TABLE `ticket_types` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `active` TINYINT(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TABLA: tickets
-- =====================================================
CREATE TABLE `tickets` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `ticket_number` VARCHAR(20) NOT NULL UNIQUE,
  `access_token` VARCHAR(64) NOT NULL,
  `requester_name` VARCHAR(150) NOT NULL,
  `requester_email` VARCHAR(150) NOT NULL,
  `requester_phone` VARCHAR(50) DEFAULT NULL,
  `department_id` INT(11) DEFAULT NULL,
  `location_id` INT(11) DEFAULT NULL,
  `category_id` INT(11) NOT NULL,
  `type_id` INT(11) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `priority` ENUM('low','medium','high','critical') DEFAULT 'medium',
  `status` ENUM('new','open','assigned','in_progress','waiting_requester','waiting_third','escalated','resolved','closed','reopened','cancelled') DEFAULT 'new',
  `assigned_to` INT(11) DEFAULT NULL,
  `source` ENUM('public','internal','phone','email') DEFAULT 'public',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `assigned_at` DATETIME DEFAULT NULL,
  `first_response_at` DATETIME DEFAULT NULL,
  `resolved_at` DATETIME DEFAULT NULL,
  `closed_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_ticket_number` (`ticket_number`),
  INDEX `idx_status` (`status`),
  INDEX `idx_assigned` (`assigned_to`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TABLA: ticket_messages
-- =====================================================
CREATE TABLE `ticket_messages` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `ticket_id` INT(11) NOT NULL,
  `author_id` INT(11) DEFAULT NULL,
  `author_name` VARCHAR(150) NOT NULL,
  `content` TEXT NOT NULL,
  `type` ENUM('public','internal') DEFAULT 'public',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TABLA: ticket_history
-- =====================================================
CREATE TABLE `ticket_history` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `ticket_id` INT(11) NOT NULL,
  `user_id` INT(11) DEFAULT NULL,
  `user_name` VARCHAR(150) NOT NULL,
  `action` VARCHAR(50) NOT NULL,
  `description` TEXT NOT NULL,
  `old_value` VARCHAR(255) DEFAULT NULL,
  `new_value` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TABLA: knowledge_articles
-- =====================================================
CREATE TABLE `knowledge_articles` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `summary` VARCHAR(500) DEFAULT NULL,
  `category_id` INT(11) DEFAULT NULL,
  `tags` VARCHAR(500) DEFAULT NULL,
  `keywords` VARCHAR(500) DEFAULT NULL,
  `scope` ENUM('external','internal') DEFAULT 'external',
  `status` ENUM('draft','pending','published','archived') DEFAULT 'draft',
  `author_id` INT(11) NOT NULL,
  `views` INT(11) DEFAULT 0,
  `helpful` INT(11) DEFAULT 0,
  `not_helpful` INT(11) DEFAULT 0,
  `featured` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FULLTEXT INDEX `idx_search` (`title`, `content`, `summary`, `keywords`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TABLA: audit_logs
-- =====================================================
CREATE TABLE `audit_logs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) DEFAULT NULL,
  `user_name` VARCHAR(150) NOT NULL,
  `action` VARCHAR(50) NOT NULL,
  `details` TEXT DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_action` (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TABLA: settings
-- =====================================================
CREATE TABLE `settings` (
  `key_name` VARCHAR(100) NOT NULL,
  `value` TEXT DEFAULT NULL,
  PRIMARY KEY (`key_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Roles
INSERT INTO `roles` (`id`, `name`, `description`, `permissions`) VALUES
(1, 'admin', 'Administrador del sistema', '["*"]'),
(2, 'supervisor', 'Supervisor de soporte', '["tickets.view_all","tickets.assign","tickets.escalate","reports.view","knowledge.manage"]'),
(3, 'technician', 'Técnico de soporte', '["tickets.view_assigned","tickets.respond","tickets.resolve","knowledge.view_internal"]'),
(4, 'editor', 'Editor de conocimiento', '["knowledge.manage_external","knowledge.manage_internal"]'),
(5, 'requester', 'Solicitante', '["tickets.create","tickets.view_own","knowledge.view_external"]');

-- Usuario administrador (contraseña: admin123)
INSERT INTO `users` (`username`, `email`, `password`, `full_name`, `role_id`, `department`, `location`, `active`) VALUES
('admin', 'admin@mesadeayuda.cl', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2u6W1rOwKzm', 'Administrador del Sistema', 1, 'Tecnología', 'Casa Central', 1),
('supervisor', 'supervisor@mesadeayuda.cl', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2u6W1rOwKzm', 'María González', 2, 'Soporte TI', 'Casa Central', 1),
('tecnico', 'tecnico@mesadeayuda.cl', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2u6W1rOwKzm', 'Carlos Muñoz', 3, 'Soporte TI', 'Casa Central', 1);

-- Departamentos
INSERT INTO `departments` (`name`) VALUES
('Tecnología'), ('Soporte TI'), ('Recursos Humanos'), ('Finanzas'), ('Académico'), ('Administración');

-- Ubicaciones
INSERT INTO `locations` (`name`, `address`) VALUES
('Casa Central', 'Av. Principal 1234'),
('Sede Norte', 'Calle Norte 567'),
('Sede Sur', 'Av. Sur 890');

-- Categorías
INSERT INTO `categories` (`name`, `icon`, `description`, `scope`) VALUES
('Problemas de acceso y contraseñas', '🔑', 'Recuperación de contraseñas y problemas de acceso', 'both'),
('Correo electrónico', '📧', 'Configuración y problemas de correo', 'both'),
('Equipos computacionales', '💻', 'Problemas con computadores y notebooks', 'both'),
('Impresoras y periféricos', '🖨️', 'Instalación y problemas de impresoras', 'both'),
('Aplicaciones institucionales', '📱', 'Sistemas y plataformas internas', 'both'),
('Conectividad y redes', '🌐', 'WiFi, VPN y problemas de red', 'both'),
('Sistemas y plataformas', '🖥️', 'Servidores y sistemas críticos', 'internal'),
('Solicitudes de acceso', '🔐', 'Permisos a sistemas', 'both'),
('Preguntas frecuentes', '❓', 'Consultas comunes', 'external');

-- Tipos de ticket
INSERT INTO `ticket_types` (`name`) VALUES
('Incidencia'), ('Solicitud de servicio'), ('Consulta'), ('Requerimiento');

-- Configuración inicial
INSERT INTO `settings` (`key_name`, `value`) VALUES
('system_name', 'Mesa de Ayuda'),
('institution_name', 'Gobierno de Chile'),
('logo', '🛠️'),
('primary_color', '#0066B3'),
('contact_email', 'soporte@gob.cl'),
('contact_phone', '+56 2 2345 6789'),
('timezone', 'America/Santiago'),
('installed', '0');

-- Artículos de conocimiento (externos)
INSERT INTO `knowledge_articles` (`title`, `content`, `summary`, `category_id`, `tags`, `keywords`, `scope`, `status`, `author_id`, `views`, `helpful`, `featured`) VALUES
('Cómo restablecer su contraseña', '<h2>Restablecimiento de contraseña</h2><p>Si ha olvidado su contraseña, siga estos pasos:</p><ol><li>Ingrese a la página de inicio de sesión</li><li>Haga clic en "¿Olvidó su contraseña?"</li><li>Ingrese su correo institucional</li><li>Revise su bandeja de entrada</li><li>Cree una nueva contraseña</li></ol>', 'Guía para restablecer contraseña', 1, 'contraseña,acceso,login', 'password,clave,olvido', 'external', 'published', 1, 245, 89, 1),
('Configuración de correo en Outlook', '<h2>Configurar correo institucional</h2><ol><li>Abra Outlook y vaya a Archivo > Agregar cuenta</li><li>Ingrese su correo institucional</li><li>Servidor entrada: mail.gob.cl (993, SSL)</li><li>Servidor salida: mail.gob.cl (587, TLS)</li></ol>', 'Configurar correo en Outlook', 2, 'correo,outlook', 'email,mail,imap', 'external', 'published', 1, 178, 67, 1),
('Problemas comunes con impresoras', '<h2>Solución de problemas</h2><ol><li>Verifique que esté encendida</li><li>Revise si hay papel atascado</li><li>Verifique conexión a la red</li><li>Elimine y vuelva a agregar la impresora</li></ol>', 'Soluciones a problemas de impresoras', 4, 'impresora,red', 'printer,imprimir,tinta', 'external', 'published', 1, 134, 52, 0);

-- Artículos internos
INSERT INTO `knowledge_articles` (`title`, `content`, `summary`, `category_id`, `tags`, `keywords`, `scope`, `status`, `author_id`, `views`, `helpful`, `featured`) VALUES
('Protocolo de escalamiento crítico', '<h2>Protocolo de escalamiento</h2><ol><li>Notificar al supervisor</li><li>Registrar en canal de emergencias</li><li>Escalar a nivel 2 en 30 minutos</li><li>Informar al jefe de TI</li></ol>', 'Protocolo de escalamiento de incidencias críticas', 7, 'escalamiento,crítico', 'escalar,emergencia', 'internal', 'published', 1, 45, 23, 1);
