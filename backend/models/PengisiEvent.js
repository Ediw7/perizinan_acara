// models/EventPermission.js
const pool = require('../config/db');
const { cuid } = require('cuid');
const PengisiEvent = require('./PengisiEvent');

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
                eventId, input.nama_acara, input.penyelenggara, input.jumlah_peserta, new Date(input.tanggal_mulai),
                new Date(input.tanggal_selesai), input.jam_mulai, input.jam_selesai, input.lokasi, input.provinsi_id,
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
            throw error;
        } finally {
            connection.release();
        }
    },
};

module.exports = EventPermission;