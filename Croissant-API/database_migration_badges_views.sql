-- Migration pour ajouter le système de badges et de vues
-- À exécuter sur votre base de données MySQL

-- 1. Créer la table des types de badges
CREATE TABLE IF NOT EXISTS badge_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#000000',
    icon TEXT NOT NULL,
    duration_days INT NOT NULL DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Créer la table des badges de jeux
CREATE TABLE IF NOT EXISTS game_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_id VARCHAR(36) NOT NULL,
    badge_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (game_id) REFERENCES games(gameId) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badge_types(id) ON DELETE CASCADE,
    UNIQUE KEY unique_game_badge (game_id, badge_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_game_id (game_id)
);

-- 3. Créer la table des vues de jeux
CREATE TABLE IF NOT EXISTS game_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_id VARCHAR(36) NOT NULL,
    viewer_cookie VARCHAR(36) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    FOREIGN KEY (game_id) REFERENCES games(gameId) ON DELETE CASCADE,
    INDEX idx_game_id (game_id),
    INDEX idx_viewer_cookie (viewer_cookie),
    INDEX idx_viewed_at (viewed_at),
    INDEX idx_game_viewer_date (game_id, viewer_cookie, viewed_at)
);

-- 4. Insérer les types de badges par défaut
INSERT INTO badge_types (name, display_name, color, icon, duration_days) VALUES
('nouveau', 'Nouveau', '#ef4444', '<i class="fas fa-star"></i>', 10),
('mise-a-jour', 'Mis à jour', '#f97316', '<i class="fas fa-sync"></i>', 10),
('exclusif', 'Exclusif', '#8b5cf6', '<i class="fas fa-crown"></i>', 30),
('populaire', 'Populaire', '#10b981', '<i class="fas fa-fire"></i>', 7)
ON DUPLICATE KEY UPDATE 
    display_name = VALUES(display_name),
    color = VALUES(color),
    icon = VALUES(icon),
    duration_days = VALUES(duration_days);

-- 5. Créer un index composite pour optimiser les requêtes de vues
CREATE INDEX IF NOT EXISTS idx_game_views_stats ON game_views (game_id, viewed_at, viewer_cookie);

-- 6. Créer une vue pour les statistiques de vues (optionnel)
CREATE OR REPLACE VIEW game_view_stats AS
SELECT 
    game_id,
    COUNT(*) as total_views,
    COUNT(DISTINCT viewer_cookie) as unique_views,
    COUNT(CASE WHEN DATE(viewed_at) = CURDATE() THEN 1 END) as views_today,
    COUNT(CASE WHEN viewed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as views_this_week,
    COUNT(CASE WHEN viewed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as views_this_month
FROM game_views 
GROUP BY game_id;

-- 7. Créer une procédure stockée pour nettoyer les badges expirés (optionnel)
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS CleanupExpiredBadges()
BEGIN
    DELETE FROM game_badges WHERE expires_at < NOW();
    SELECT ROW_COUNT() as deleted_badges;
END //
DELIMITER ;

-- 8. Créer une procédure stockée pour nettoyer les anciennes vues (optionnel)
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS CleanupOldViews(IN days_to_keep INT)
BEGIN
    DELETE FROM game_views WHERE viewed_at < DATE_SUB(NOW(), INTERVAL days_to_keep DAY);
    SELECT ROW_COUNT() as deleted_views;
END //
DELIMITER ;

-- 9. Créer un événement pour nettoyer automatiquement les badges expirés (optionnel)
-- Note: Les événements nécessitent que l'event_scheduler soit activé
-- SET GLOBAL event_scheduler = ON;

-- CREATE EVENT IF NOT EXISTS cleanup_expired_badges
-- ON SCHEDULE EVERY 1 DAY
-- STARTS CURRENT_TIMESTAMP
-- DO
--   CALL CleanupExpiredBadges();

-- 10. Créer un événement pour nettoyer automatiquement les anciennes vues (optionnel)
-- CREATE EVENT IF NOT EXISTS cleanup_old_views
-- ON SCHEDULE EVERY 1 WEEK
-- STARTS CURRENT_TIMESTAMP
-- DO
--   CALL CleanupOldViews(365);

-- Instructions d'utilisation :
-- 1. Exécutez ce script sur votre base de données MySQL
-- 2. Les badges "nouveau" et "mise-a-jour" seront automatiquement ajoutés lors de la création/modification de jeux
-- 3. Les vues seront enregistrées via l'endpoint POST /api/games/:gameId/view
-- 4. Les statistiques de vues sont disponibles via l'endpoint GET /api/games/:gameId/views
-- 5. Pour nettoyer manuellement les badges expirés : CALL CleanupExpiredBadges();
-- 6. Pour nettoyer manuellement les anciennes vues : CALL CleanupOldViews(365);


