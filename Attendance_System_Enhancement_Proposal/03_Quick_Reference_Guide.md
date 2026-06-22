# 03 - Quick Reference Guide

## Essential Commands

**Database Migration:**
```bash
mysql -u root -p leather_attendance_db < CODE_EXAMPLES/SQL_Migration.sql
```

**Install Backend Dependencies:**
```bash
npm install bcrypt crypto
```

## Troubleshooting

- **Tokens expiring instantly?** Check the server's timezone settings compared to the database. Ensure both are UTC.
- **Bcrypt Errors?** If you receive `bcrypt is not a function`, ensure you are using the correct Node.js version (16+ recommended).
- **UI Timer out of sync?** The frontend timer is visual. The true source of truth is the backend `expires_at` database check.
