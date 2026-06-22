/**
 * @file AttendanceController.js
 * @description API handlers for the attendance token verification system.
 */

const tokenService = require('./TokenService');

class AttendanceController {
    
    /**
     * @route POST /api/attendance/generate-token
     * @desc Generates and sends a 6-digit OTP to the user's email.
     */
    async generateToken(req, res) {
        try {
            const { userId } = req.user; // Assumes user is authenticated via JWT
            const ipAddress = req.ip || req.connection.remoteAddress;

            const result = await tokenService.createAndSendToken(userId, ipAddress);
            
            return res.status(200).json({
                success: true,
                message: 'A 6-digit security token has been sent to your registered email.'
            });
        } catch (error) {
            console.error('Token Generation Error:', error);
            // Don't expose internal errors to the client
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Failed to generate token. Please try again later.'
            });
        }
    }

    /**
     * @route POST /api/attendance/verify
     * @desc Verifies the OTP and records attendance if valid.
     */
    async verifyAttendance(req, res) {
        try {
            const { userId } = req.user;
            const { token, type } = req.body; // type = 'CHECK_IN' or 'CHECK_OUT'
            const ipAddress = req.ip || req.connection.remoteAddress;

            if (!token || token.length !== 6) {
                return res.status(400).json({ success: false, message: 'Invalid token format.' });
            }

            // Verify token (O(1) complexity lookup)
            await tokenService.verifyToken(userId, token, ipAddress);

            // Record actual attendance...
            // await attendanceService.markAttendance(userId, type);

            return res.status(200).json({
                success: true,
                message: `Successfully ${type === 'CHECK_IN' ? 'checked in' : 'checked out'}!`
            });
        } catch (error) {
            return res.status(error.statusCode || 400).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new AttendanceController();
