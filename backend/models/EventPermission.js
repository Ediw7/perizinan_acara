const pool = require('../config/db');
const { cuid } = require('cuid');


const EventPermission = {

    create: async ({ input, userId }) => {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const eventId = cuid();
            const eventQuery = `
                INSERT INTO EventPermission (
                    id, nama_acara, penyelenggara, jumlah_peserta, tanggal_mulai, tanggal_selesai, 
                    jam_mulai, jam_selesai, lokasi, provinsi_id, kota_id, kategori_acara_id, 
                    biaya, deskripsi, dokumentasi_url, user_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const eventValues = [
                eventId, input.nama_acara, input.penyelenggara, input.jumlah_peserta, input.tanggal_mulai,
                input.tanggal_selesai, input.jam_mulai, input.jam_selesai, input.lokasi, input.provinsi_id,
                input.kota_id, input.kategori_acara_id, input.biaya, input.deskripsi, input.dokumentasi_url, userId
            ];
            
            await connection.query(eventQuery, eventValues);

    
            if (input.pengisi_event && input.pengisi_event.length > 0) {
                await PengisiEvent.createMany(input.pengisi_event, eventId, connection);
            }

            await connection.commit();
            
           
            const [newEvent] = await connection.query('SELECT * FROM EventPermission WHERE id = ?', [eventId]);
            return newEvent[0];

        } catch (error) {
            await connection.rollback();
            console.error("Error in EventPermission.create:", error);
            throw new Error("Gagal membuat izin acara di database.");
        } finally {
            connection.release();
        }
    },


    update: async (id, input) => {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const updateQuery = `
                UPDATE EventPermission SET 
                    nama_acara = ?, penyelenggara = ?, jumlah_peserta = ?, tanggal_mulai = ?, 
                    tanggal_selesai = ?, jam_mulai = ?, jam_selesai = ?, lokasi = ?, provinsi_id = ?, 
                    kota_id = ?, kategori_acara_id = ?, biaya = ?, deskripsi = ?, dokumentasi_url = ?
                WHERE id = ?`;
            
            const values = [
                input.nama_acara, input.penyelenggara, input.jumlah_peserta, input.tanggal_mulai,
                input.tanggal_selesai, input.jam_mulai, input.jam_selesai, input.lokasi, input.provinsi_id,
                input.kota_id, input.kategori_acara_id, input.biaya, input.deskripsi, input.dokumentasi_url, id
            ];

            await connection.query(updateQuery, values);
 
            await PengisiEvent.deleteByEventId(id, connection);
            if (input.pengisi_event && input.pengisi_event.length > 0) {
                await PengisiEvent.createMany(input.pengisi_event, id, connection);
            }

            await connection.commit();
            
            const [updatedEvent] = await connection.query('SELECT * FROM EventPermission WHERE id = ?', [id]);
            return updatedEvent[0];
        } catch (error) {
            await connection.rollback();
            console.error("Error in EventPermission.update:", error);
            throw new Error("Gagal memperbarui izin acara di database.");
        } finally {
            connection.release();
        }
    },

    delete: async (id) => {
        const connection = await pool.getConnection();
        await connection.beginTransaction();
        try {
           
            await PengisiEvent.deleteByEventId(id, connection);
 
            await connection.query('DELETE FROM EventPermission WHERE id = ?', [id]);
            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            console.error("Error in EventPermission.delete:", error);
            throw new Error("Gagal menghapus izin acara.");
        } finally {
            connection.release();
        }
    },

    verify: async (id, verifierUsername) => {
        const query = "UPDATE EventPermission SET verified_at = CURRENT_TIMESTAMP, verified_by = ? WHERE id = ?";
        await pool.query(query, [verifierUsername, id]);
        return EventPermission.findById(id);
    },

 
    findById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM EventPermission WHERE id = ?', [id]);
        return rows[0];
    },


    findAllVerified: async ({ take, skip }) => {
        const [[{ total }]] = await pool.query("SELECT COUNT(*) as total FROM EventPermission WHERE verified_at IS NOT NULL");
        const [rows] = await pool.query("SELECT * FROM EventPermission WHERE verified_at IS NOT NULL ORDER BY created_at DESC LIMIT ? OFFSET ?", [take, skip]);
        return { data: rows, total };
    },

    findByOperator: async ({ userId, take, skip }) => {
        const [[{ total }]] = await pool.query("SELECT COUNT(*) as total FROM EventPermission WHERE user_id = ?", [userId]);
        const [rows] = await pool.query("SELECT * FROM EventPermission WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?", [userId, take, skip]);
        return { data: rows, total };
    },

    findForVerification: async ({ kode_unit, take, skip }) => {
        const countQuery = `
            SELECT COUNT(ep.id) as total FROM EventPermission ep
            JOIN User u ON ep.user_id = u.id
            WHERE ep.verified_at IS NULL AND u.kode_unit = ?`;
        const [[{ total }]] = await pool.query(countQuery, [kode_unit]);

        const query = `
            SELECT ep.* FROM EventPermission ep
            JOIN User u ON ep.user_id = u.id
            WHERE ep.verified_at IS NULL AND u.kode_unit = ?
            ORDER BY ep.created_at ASC LIMIT ? OFFSET ?`;
        const [rows] = await pool.query(query, [kode_unit, take, skip]);
        return { data: rows, total };
    }
};

module.exports = EventPermission;