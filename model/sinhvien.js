const mongoose = require("mongoose");

const sinhVienSchema = new mongoose.Schema({
    maSinhVien: {
        type: String,
        required: true,
        unique: true
    },

    hoTen: {
        type: String,
        required: true
    },

    maLop: {
        type: String,
        required: true
    },

    nganh: {
        type: String,
        required: true
    },

    chuongTrinhDaoTao: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChuongTrinhDaoTao",
    default: null
    },

    taiKhoan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TaiKhoan",
        required: true
    }
}, {
    collection: "SinhVien"
});

module.exports = mongoose.model(
    "SinhVien",
    sinhVienSchema
);