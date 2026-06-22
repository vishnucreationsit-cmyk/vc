-- Migration: Add Security Tokens for Attendance
-- Description: Creates the required tables for the OTP token system and audit logging.

CREATE TABLE attendance_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    failed_attempts INT DEFAULT 0,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_token FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE
);

-- Optimize token lookups (O(1) time complexity equivalent for indexed lookup)
CREATE INDEX idx_user_token ON attendance_tokens(user_id, is_used);
CREATE INDEX idx_expires_at ON attendance_tokens(expires_at);

CREATE TABLE attendance_audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_audit FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE
);

CREATE INDEX idx_audit_user_action ON attendance_audit_logs(user_id, action);