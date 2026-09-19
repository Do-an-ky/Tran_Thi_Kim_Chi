const mongoose = require("mongoose");

const taiKhoanSchema = new mongoose.Schema({
    tenDangNhap: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    passwordHash: {
        type: String,
        required: true
    },

    hoTen: {
        type: String,
        required: true
    },

    vaiTro: {
        type: String,
        enum: ["SINH_VIEN", "GVCN"],
        required: true
    },

    sinhVien: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SinhVien",
    default: null
  },

    trangThai: {
        type: Boolean,
        default: true
    }
}, {
    collection: "TaiKhoan"
});

module.exports = mongoose.model(
    "TaiKhoan",
    taiKhoanSchema
);