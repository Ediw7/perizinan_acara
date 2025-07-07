const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar DateTime

  type User {
    id: ID!
    username: String!
    role: UserRole!
    kode_unit: String!
    created_at: DateTime!
    updated_at: DateTime!
  }

  enum UserRole {
    OPERATOR
    VERIFIKATOR
  }

  type EventPermission {
    id: ID!
    nama_acara: String!
    penyelenggara: String!
    jumlah_peserta: Int!
    tanggal_mulai: DateTime!
    tanggal_selesai: DateTime!
    jam_mulai: String
    jam_selesai: String
    lokasi: String!
    biaya: String
    deskripsi: String
    dokumentasi_url: String
    user_id: ID!
    verified_at: DateTime
    verified_by: String
    created_at: DateTime!
    updated_at: DateTime!
    user: User!
    provinsi: Provinsi!
    kota: Kota!
    kategoriAcara: KategoriAcara
    pengisi_event: [PengisiEvent!]!
  }

  type PengisiEvent {
    id: ID!
    event_permission_id: ID!
    nama_pengisi: String!
    judul_materi: String!
  }

  type Provinsi {
    id: ID!
    nama: String!
  }

  type Kota {
    id: ID!
    nama: String!
  }

  type KategoriAcara {
    id: ID!
    nama: String!
    is_active: Boolean!
  }

  input LoginInput {
    username: String!
    password: String!
  }

  input PengisiEventInput {
    nama_pengisi: String!
    judul_materi: String!
  }

  input EventPermissionInput {
    nama_acara: String!
    penyelenggara: String!
    jumlah_peserta: Int!
    tanggal_mulai: String!
    tanggal_selesai: String!
    jam_mulai: String
    jam_selesai: String
    lokasi: String!
    provinsi_id: Int!
    kota_id: Int!
    kategori_acara_id: Int
    biaya: String
    deskripsi: String
    dokumentasi_url: String
    pengisi_event: [PengisiEventInput!]
  }

  input PaginationInput {
    take: Int = 10
    skip: Int = 0
  }
  
  type LoginResponse {
    token: String!
    user: User!
  }

  type EventPermissionListResponse {
    data: [EventPermission!]!
    total: Int!
  }

  type Query {
    getEventPermissionList(pagination: PaginationInput): EventPermissionListResponse!
    getEventPermission(id: ID!): EventPermission
    getProvinsi: [Provinsi!]!
    getKota(provinsiId: Int!): [Kota!]!
    getKategoriAcara: [KategoriAcara!]!
    getOperatorEvents(pagination: PaginationInput): EventPermissionListResponse!
    getVerificationQueue(pagination: PaginationInput): EventPermissionListResponse!
  }

  type Mutation {
    login(input: LoginInput!): LoginResponse!
    createEventPermission(input: EventPermissionInput!): EventPermission!
    updateEventPermission(id: ID!, input: EventPermissionInput!): EventPermission!
    deleteEventPermission(id: ID!): Boolean!
    verifyEventPermission(id: ID!): EventPermission!
  }
`;

module.exports = typeDefs;