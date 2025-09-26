// hash_passwords.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

(async () => {
  const conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'Palan_DB', port: 3306 });
  const [rows] = await conn.query('SELECT id, password FROM users');

  for (const row of rows) {
    const pw = row.password || '';
    if (!pw.startsWith('$2a$') && !pw.startsWith('$2b$') && !pw.startsWith('$2y$')) {
      const hashed = await bcrypt.hash(pw, 10);
      await conn.query('UPDATE users SET password = ? WHERE id = ?', [hashed, row.id]);
      console.log(`Updated id=${row.id}`);
    } else {
      console.log(`Already hashed id=${row.id}`);
    }
  }

  await conn.end();
  console.log('Done.');
})();
