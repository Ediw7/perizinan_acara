const pool = require('../config/db');
const bcrypt = require('bcrypt');
const { cuid } = require('cuid');

const User = {
  findByUsername: async (username) => {
    const [rows] = await pool.query('SELECT * FROM User WHERE username = ?', [username]);
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await pool.query('SELECT id, username, role, kode_unit FROM User WHERE id = ?', [id]);
    return rows[0];
  },

  create: async ({ username, password, role, kode_unit }) => {
    const id = cuid();
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO User (id, username, password, role, kode_unit) VALUES (?, ?, ?, ?, ?)',
      [id, username, hashedPassword, role, kode_unit]
    );
    return { id, username, role, kode_unit };
  }
};

module.exports = User;