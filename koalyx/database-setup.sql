-- Scripts SQL pour créer les nouvelles tables nécessaires au système de favoris, demandes de mise à jour et signalements

-- Table des favoris
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, game_id)
);

-- Table des demandes de mise à jour
CREATE TABLE IF NOT EXISTS update_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    status ENUM('pending', 'resolved', 'dismissed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    resolved_by INT NULL,
    FOREIGN KEY (user_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES utilisateurs(id) ON DELETE SET NULL,
    UNIQUE KEY unique_update_request (user_id, game_id, status)
);

-- Table des signalements de liens morts
CREATE TABLE IF NOT EXISTS dead_link_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    link_id INT NOT NULL,
    status ENUM('pending', 'resolved', 'dismissed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    resolved_by INT NULL,
    FOREIGN KEY (user_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (link_id) REFERENCES game_download_links(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES utilisateurs(id) ON DELETE SET NULL,
    UNIQUE KEY unique_dead_link_report (user_id, link_id, status)
);

-- Ajouter une colonne is_active à la table game_download_links
-- IMPORTANT: Si cette colonne existe déjà, ignorez l'erreur et continuez
ALTER TABLE game_download_links ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- Note: La table games a déjà la colonne updated_at selon le dump fourni

-- Index pour améliorer les performances
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_game_id ON favorites(game_id);
CREATE INDEX idx_update_requests_status ON update_requests(status);
CREATE INDEX idx_update_requests_game_id ON update_requests(game_id);
CREATE INDEX idx_dead_link_reports_status ON dead_link_reports(status);
CREATE INDEX idx_dead_link_reports_link_id ON dead_link_reports(link_id);
CREATE INDEX idx_game_download_links_is_active ON game_download_links(is_active);
