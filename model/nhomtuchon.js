const mongoose = require("mongoose");

const nhomTuChonSchema = new mongoose.Schema({
    maNhom: {
        type: String,
        required: true,
        unique: true
    },

    tenNhom: {
        type: String,
        required: true
    },

    soMonCanDat: {
        type: Number,
        required: true,
        min: 1
    }
}, {
    collection: "NhomTuChon"
});

module.exports = mongoose.model(
    "NhomTuChon",
    nhomTuChonSchema
);