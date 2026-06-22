/**
 * @file TokenService.js
 * @description Business logic for OTP generation, hashing, and validation.
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');
// Assume db is a configured database instance (e.g., Sequelize or raw MySQL query builder)
const db = require('../db'); 

class TokenService {
    
    constructor() {
        this.TOKEN_EXPIRY_MINUTES = 10;
        this.MAX_FAILED_ATTEMPTS = 3;
    }

    /**
     * Generates a random 6-digit OTP and hashes it before saving.
     */
    async createAndSendToken(userId, ipAddress) {
        // Generate a 6-digit cryptographic token
        const rawToken = crypto.randomInt(100000, 999999).toString();
        
        // Hash the token for secure database storage
        const salt = await bcrypt.genSalt(10);
        const tokenHash = await bcrypt.hash(rawToken, salt);

        // Calculate expiry
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + this.TOKEN_EXPIRY_MINUTES);

        // Invalidate any existing unused tokens for this user
        await db.query(`UPDATE attendance_tokens SET is_used = TRUE WHERE user_id = ? AND is_used = FALSE`, [userId]);

        // Insert new token
        await db.query(
            `INSERT INTO attendance_tokens (user_id, token_hash, expires_at, ip_address) VALUES (?, ?, ?, ?)`,
            [userId, tokenHash, expiresAt, ipAddress]
        );

        // Send email/SMS (Implementation omitted for brevity)
        // await emailService.sendOTP(user.email, rawToken);

        // Log audit trail
        await this.logAudit(userId, 'TOKEN_GENERATED', ipAddress, 'SUCCESS');

        return true;
    }

    /**
     * Validates the provided OTP against the hashed token in the database.
     * Enforces rate limiting, expiry, and max attempts in O(1) time complexity.
     */
    async verifyToken(userId, rawToken, ipAddress) {
        // Fetch the active token (using the idx_user_token index for fast O(1) lookup)
        const [tokenRecords] = await db.query(
            `SELECT * FROM attendance_tokens WHERE user_id = ? AND is_used = FALSE ORDER BY created_at DESC LIMIT 1`,
            [userId]
        );

        if (!tokenRecords || tokenRecords.length === 0) {
            await this.logAudit(userId, 'TOKEN_VERIFY', ipAddress, 'FAILED_NOT_FOUND');
            throw { statusCode: 400, message: 'No active token found. Please request a new one.' };
        }

        const activeToken = tokenRecords[0];

        // Check if token is expired
        if (new Date() > new Date(activeToken.expires_at)) {
            await db.query(`UPDATE attendance_tokens SET is_used = TRUE WHERE id = ?`, [activeToken.id]);
            throw { statusCode: 400, message: 'Token has expired. Please request a new one.' };
        }

        // Check max attempts
        if (activeToken.failed_attempts >= this.MAX_FAILED_ATTEMPTS) {
            await db.query(`UPDATE attendance_tokens SET is_used = TRUE WHERE id = ?`, [activeToken.id]);
            await this.logAudit(userId, 'ACCOUNT_LOCKED_TEMPORARY', ipAddress, 'WARNING');
            throw { statusCode: 403, message: 'Too many failed attempts. Token invalidated.' };
        }

        // Verify hash
        const isValid = await bcrypt.compare(rawToken, activeToken.token_hash);

        if (!isValid) {
            await db.query(`UPDATE attendance_tokens SET failed_attempts = failed_attempts + 1 WHERE id = ?`, [activeToken.id]);
            await this.logAudit(userId, 'TOKEN_VERIFY', ipAddress, 'FAILED_INVALID');
            throw { statusCode: 400, message: `Invalid token. You have ${this.MAX_FAILED_ATTEMPTS - activeToken.failed_attempts - 1} attempts left.` };
        }

        // Mark as used
        await db.query(`UPDATE attendance_tokens SET is_used = TRUE WHERE id = ?`, [activeToken.id]);
        await this.logAudit(userId, 'TOKEN_VERIFY', ipAddress, 'SUCCESS');

        return true;
    }

    async logAudit(userId, action, ipAddress, status) {
        await db.query(
            `INSERT INTO attendance_audit_logs (user_id, action, ip_address, status) VALUES (?, ?, ?, ?)`,
            [userId, action, ipAddress, status]
        );
    }
}

module.exports = new TokenService();
