const mongoose = require("mongoose");

const hocPhanSchema = new mongoose.Schema({
    maHocPhan: {
        type: String,
        required: true,
        unique: true
    },

    tenHocPhan: {
        type: String,
        required: true
    },

    soTinChi: {
        type: Number,
        required: true,
        min: 1
    }
}, {
    collection: "HocPhan"
});

module.exports = mongoose.model("HocPhan", hocPhanSchema);