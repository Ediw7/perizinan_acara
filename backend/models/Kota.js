const pool = require('../config/db');

const Kota = {
  findByProvinsiId: async (provinsiId) => {
    const [rows] = await pool.query('SELECT * FROM Kota WHERE provinsi_id = ?', [provinsiId]);
    return rows;
  }
};
module.exports = Kota;