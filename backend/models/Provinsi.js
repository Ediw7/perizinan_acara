// models/Provinsi.js
const pool = require('../config/db');

const Provinsi = {
  findAll: async () => {
    const [rows] = await pool.query('SELECT * FROM Provinsi');
    return rows;
  }
};
module.exports = Provinsi;
