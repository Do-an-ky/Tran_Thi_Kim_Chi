const mongoose = require("mongoose");

const chuongTrinhDaoTaoSchema = new mongoose.Schema({
    maChuongTrinh: {
        type: String,
        required: true,
        unique: true
    },

    tenChuongTrinh: {
        type: String,
        required: true
    },

    tongTinChiYeuCau: {
        type: Number,
        required: true,
        min: 1
    }
}, {
    collection: "ChuongTrinhDaoTao"
});

module.exports = mongoose.model(
    "ChuongTrinhDaoTao",
    chuongTrinhDaoTaoSchema
);