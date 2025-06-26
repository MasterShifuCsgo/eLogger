const db = require('better-sqlite3')('shiplog.db');
db.exec(require('fs').readFileSync('log_schema.sql', 'utf8'));
