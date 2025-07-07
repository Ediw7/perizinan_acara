
const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const EventPermission = require('../models/EventPermission');
const Provinsi = require('../models/Provinsi');
const Kota = require('../models/Kota');
const KategoriAcara = require('../models/KategoriAcara');
const PengisiEvent = require('../models/PengisiEvent');

const resolvers = {
  Query: {
    getEventPermissionList: (_, { pagination }) => EventPermission.findAllVerified(pagination),
    getEventPermission: (_, { id }) => EventPermission.findById(id),
    getProvinsi: () => Provinsi.findAll(),
    getKota: (_, { provinsiId }) => Kota.findByProvinsiId(provinsiId),
    getKategoriAcara: () => KategoriAcara.findAll(),

    getOperatorEvents: (_, { pagination }, context) => {
      if (!context.user || context.user.role !== 'OPERATOR') {
        throw new ForbiddenError('Akses ditolak. Anda harus login sebagai Operator.');
      }
      return EventPermission.findByOperator({ userId: context.user.id, ...pagination });
    },

    getVerificationQueue: (_, { pagination }, context) => {
      if (!context.user || context.user.role !== 'VERIFIKATOR') {
        throw new ForbiddenError('Akses ditolak. Anda harus login sebagai Verifikator.');
      }
      return EventPermission.findForVerification({ kode_unit: context.user.kode_unit, ...pagination });
    },
  },

  Mutation: {
    login: async (_, { input }) => {
        const user = await User.findByUsername(input.username);
        if (!user) throw new AuthenticationError('Kombinasi username dan password salah.');
        const isValid = await bcrypt.compare(input.password, user.password);
        if (!isValid) throw new AuthenticationError('Kombinasi username dan password salah.');
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, kode_unit: user.kode_unit },
            process.env.JWT_SECRET, { expiresIn: '1d' }
        );
        return { token, user };
    },

    createEventPermission: (_, { input }, context) => {
        if (!context.user || context.user.role !== 'OPERATOR') {
            throw new ForbiddenError('Akses ditolak. Hanya Operator yang bisa membuat acara.');
        }
        if (input.nama_acara.length < 3) throw new UserInputError('Nama acara minimal 3 karakter.');
        if (new Date(input.tanggal_selesai) < new Date(input.tanggal_mulai)) {
            throw new UserInputError('Tanggal selesai tidak boleh sebelum tanggal mulai.');
        }
        return EventPermission.create({ input, userId: context.user.id });
    },

    updateEventPermission: async (_, { id, input }, context) => {
        if (!context.user || context.user.role !== 'OPERATOR') {
            throw new ForbiddenError('Akses ditolak. Hanya Operator yang bisa mengubah acara.');
        }
        const event = await EventPermission.findById(id);
        if (!event) throw new UserInputError('Acara tidak ditemukan.');
        if (event.user_id !== context.user.id) {
            throw new ForbiddenError('Akses ditolak. Anda bukan pemilik acara ini.');
        }
        if (event.verified_at) {
            throw new ForbiddenError('Tidak bisa mengubah acara yang sudah diverifikasi.');
        }
        return EventPermission.update(id, input);
    },

    deleteEventPermission: async (_, { id }, context) => {
        if (!context.user || context.user.role !== 'OPERATOR') {
            throw new ForbiddenError('Akses ditolak. Hanya Operator yang bisa menghapus acara.');
        }
        const event = await EventPermission.findById(id);
        if (!event) throw new UserInputError('Acara tidak ditemukan.');
        if (event.user_id !== context.user.id) {
            throw new ForbiddenError('Akses ditolak. Anda bukan pemilik acara ini.');
        }
        if (event.verified_at) {
            throw new ForbiddenError('Tidak bisa menghapus acara yang sudah diverifikasi.');
        }
        return EventPermission.delete(id);
    },

    verifyEventPermission: async (_, { id }, context) => {
        if (!context.user || context.user.role !== 'VERIFIKATOR') {
            throw new ForbiddenError('Akses ditolak. Hanya Verifikator yang bisa melakukan verifikasi.');
        }
        const event = await EventPermission.findById(id);
        if (!event) throw new UserInputError('Acara tidak ditemukan.');
        if (event.verified_at) {
            throw new UserInputError('Acara ini sudah pernah diverifikasi.');
        }
        const operator = await User.findById(event.user_id);
        if (!operator || operator.kode_unit !== context.user.kode_unit) {
            throw new ForbiddenError('Akses ditolak. Anda tidak bisa memverifikasi acara dari unit kerja yang berbeda.');
        }
        return EventPermission.verify(id, context.user.username);
    }
  },

  EventPermission: {
    user: (parent) => User.findById(parent.user_id),
    provinsi: (parent) => Provinsi.findById(parent.provinsi_id),
    kota: (parent) => Kota.findById(parent.kota_id),
    kategoriAcara: (parent) => parent.kategori_acara_id ? KategoriAcara.findById(parent.kategori_acara_id) : null,
    pengisi_event: (parent) => PengisiEvent.findByEventId(parent.id),
  }
};

module.exports = resolvers;