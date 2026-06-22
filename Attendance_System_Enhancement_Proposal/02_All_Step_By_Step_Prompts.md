# 02 - Step-By-Step Implementation Prompts

Follow these exact prompts in order to implement the Security Token System.

## Phase 1: Database Setup
**Prompt 1:** Execute the SQL script located in `CODE_EXAMPLES/SQL_Migration.sql` against your MySQL database to create the `attendance_tokens` and `attendance_audit_logs` tables.
**Prompt 2:** Verify the indexes `idx_user_token` and `idx_expires_at` were created successfully to ensure O(1) query performance.

## Phase 2: Backend Setup
**Prompt 3:** Copy `CODE_EXAMPLES/TokenService.js` into your backend `services/` directory. Ensure `bcrypt` and `crypto` are installed via `npm install bcrypt`.
**Prompt 4:** Copy `CODE_EXAMPLES/AttendanceController.js` into your backend `controllers/` directory. Link it to your Express router:
`router.post('/generate-token', authMiddleware, AttendanceController.generateToken);`
`router.post('/verify', authMiddleware, AttendanceController.verifyAttendance);`

## Phase 3: Frontend Setup
**Prompt 5:** Copy `CODE_EXAMPLES/CheckInTokenModal.jsx` to your frontend `components/` directory.
**Prompt 6:** Import the modal into your Main Dashboard page and wire up the `isOpen`, `onClose`, and `onSubmit` props. Pass the generated API endpoints into the `onSubmit` handler.

## Phase 4: Testing & Verification
**Prompt 7:** Request a token via the UI. Verify the email is received.
**Prompt 8:** Enter 3 incorrect tokens intentionally. Verify the UI shows the "Too many attempts" lockout message.
**Prompt 9:** Wait 10 minutes. Attempt to use the original token. Verify the "Token Expired" message.
