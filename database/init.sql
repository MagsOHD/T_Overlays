-- ==============================================
-- PostgreSQL 16 Initialization Script
-- Esports Tournament Database Schema
-- ==============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy search

-- ==============================================
-- Users & Authentication
-- ==============================================

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'player' CHECK (role IN ('admin', 'organizer', 'player', 'spectator')),
    avatar_url VARCHAR(500),
    bio TEXT,
    country_code VARCHAR(2),
    remember_token VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- ==============================================
-- Tournaments
-- ==============================================

CREATE TABLE tournaments (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    game VARCHAR(100) NOT NULL,
    format VARCHAR(50) NOT NULL CHECK (format IN ('single_elimination', 'double_elimination', 'round_robin', 'swiss')),
    team_size INT NOT NULL DEFAULT 5,
    max_teams INT NOT NULL,
    current_teams INT DEFAULT 0,
    entry_fee DECIMAL(10,2) DEFAULT 0.00,
    prize_pool DECIMAL(10,2) DEFAULT 0.00,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    registration_start TIMESTAMP NOT NULL,
    registration_end TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'registration_open', 'registration_closed', 'ongoing', 'finished', 'cancelled')),
    organizer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    rules TEXT,
    discord_url VARCHAR(500),
    stream_url VARCHAR(500),
    banner_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_game ON tournaments(game);
CREATE INDEX idx_tournaments_start_date ON tournaments(start_date);
CREATE INDEX idx_tournaments_slug ON tournaments(slug);

-- ==============================================
-- Teams
-- ==============================================

CREATE TABLE teams (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    tag VARCHAR(10),
    tournament_id BIGINT REFERENCES tournaments(id) ON DELETE CASCADE,
    captain_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    logo_url VARCHAR(500),
    seed INT,
    checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMP,
    disqualified BOOLEAN DEFAULT FALSE,
    disqualified_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(tournament_id, name)
);

CREATE INDEX idx_teams_tournament ON teams(tournament_id);
CREATE INDEX idx_teams_captain ON teams(captain_id);
CREATE INDEX idx_teams_seed ON teams(seed);

-- ==============================================
-- Players
-- ==============================================

CREATE TABLE players (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    team_id BIGINT REFERENCES teams(id) ON DELETE CASCADE,
    ign VARCHAR(100) NOT NULL, -- In-Game Name
    role VARCHAR(50),
    is_substitute BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(team_id, user_id)
);

CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_players_user ON players(user_id);

-- ==============================================
-- Matches
-- ==============================================

CREATE TABLE matches (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    tournament_id BIGINT REFERENCES tournaments(id) ON DELETE CASCADE,
    team_a_id BIGINT REFERENCES teams(id) ON DELETE CASCADE,
    team_b_id BIGINT REFERENCES teams(id) ON DELETE SET NULL,
    round INT NOT NULL,
    bracket_position INT,
    best_of INT DEFAULT 1 CHECK (best_of IN (1, 3, 5)),
    score_a INT DEFAULT 0,
    score_b INT DEFAULT 0,
    winner_id BIGINT REFERENCES teams(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'live', 'finished', 'forfeit')),
    scheduled_at TIMESTAMP,
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    stream_url VARCHAR(500),
    vod_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_team_a ON matches(team_a_id);
CREATE INDEX idx_matches_team_b ON matches(team_b_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_scheduled ON matches(scheduled_at);

-- ==============================================
-- Match Games (for BO3, BO5)
-- ==============================================

CREATE TABLE match_games (
    id BIGSERIAL PRIMARY KEY,
    match_id BIGINT REFERENCES matches(id) ON DELETE CASCADE,
    game_number INT NOT NULL,
    winner_id BIGINT REFERENCES teams(id) ON DELETE SET NULL,
    score_a INT,
    score_b INT,
    duration_seconds INT,
    map_name VARCHAR(100),
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(match_id, game_number)
);

CREATE INDEX idx_match_games_match ON match_games(match_id);

-- ==============================================
-- Leaderboard / Standings
-- ==============================================

CREATE TABLE standings (
    id BIGSERIAL PRIMARY KEY,
    tournament_id BIGINT REFERENCES tournaments(id) ON DELETE CASCADE,
    team_id BIGINT REFERENCES teams(id) ON DELETE CASCADE,
    position INT NOT NULL,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    points INT DEFAULT 0,
    game_wins INT DEFAULT 0,
    game_losses INT DEFAULT 0,
    buchholz_score DECIMAL(10,2) DEFAULT 0.00, -- For Swiss format
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(tournament_id, team_id)
);

CREATE INDEX idx_standings_tournament ON standings(tournament_id);
CREATE INDEX idx_standings_position ON standings(position);

-- ==============================================
-- Notifications
-- ==============================================

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read_at);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- ==============================================
-- Chat Messages
-- ==============================================

CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    room_id VARCHAR(100) NOT NULL, -- tournament:123, match:456
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_room ON chat_messages(room_id);
CREATE INDEX idx_chat_created ON chat_messages(created_at);

-- ==============================================
-- OAuth Tokens (Laravel Sanctum)
-- ==============================================

CREATE TABLE personal_access_tokens (
    id BIGSERIAL PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    abilities TEXT,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tokens_tokenable ON personal_access_tokens(tokenable_type, tokenable_id);
CREATE INDEX idx_tokens_token ON personal_access_tokens(token);

-- ==============================================
-- Functions & Triggers
-- ==============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-increment current_teams on team registration
CREATE OR REPLACE FUNCTION increment_tournament_teams()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE tournaments
    SET current_teams = current_teams + 1
    WHERE id = NEW.tournament_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER increment_teams AFTER INSERT ON teams
    FOR EACH ROW EXECUTE FUNCTION increment_tournament_teams();

-- Auto-decrement current_teams on team deletion
CREATE OR REPLACE FUNCTION decrement_tournament_teams()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE tournaments
    SET current_teams = current_teams - 1
    WHERE id = OLD.tournament_id;
    RETURN OLD;
END;
$$ language 'plpgsql';

CREATE TRIGGER decrement_teams AFTER DELETE ON teams
    FOR EACH ROW EXECUTE FUNCTION decrement_tournament_teams();

-- ==============================================
-- Views
-- ==============================================

-- Materialized view for leaderboard performance
CREATE MATERIALIZED VIEW mv_tournament_leaderboard AS
SELECT
    t.id as tournament_id,
    t.name as tournament_name,
    tm.id as team_id,
    tm.name as team_name,
    tm.tag,
    COALESCE(s.position, 999) as position,
    COALESCE(s.wins, 0) as wins,
    COALESCE(s.losses, 0) as losses,
    COALESCE(s.points, 0) as points,
    COALESCE(s.game_wins, 0) as game_wins,
    COALESCE(s.game_losses, 0) as game_losses
FROM tournaments t
JOIN teams tm ON tm.tournament_id = t.id
LEFT JOIN standings s ON s.team_id = tm.id AND s.tournament_id = t.id
WHERE t.deleted_at IS NULL
ORDER BY t.id, s.position NULLS LAST;

CREATE UNIQUE INDEX idx_mv_leaderboard ON mv_tournament_leaderboard(tournament_id, team_id);

-- ==============================================
-- Seed Data (Development)
-- ==============================================

-- Admin user
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@esports.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'); -- password: password

-- Sample tournament
INSERT INTO tournaments (name, slug, game, format, team_size, max_teams, start_date, registration_start, registration_end, status, organizer_id) VALUES
('Summer Cup 2025', 'summer-cup-2025', 'League of Legends', 'single_elimination', 5, 16, NOW() + INTERVAL '7 days', NOW(), NOW() + INTERVAL '5 days', 'registration_open', 1);

COMMENT ON DATABASE esports_tournament IS 'Esports Tournament Management Platform - Hybrid Laravel/NestJS';
