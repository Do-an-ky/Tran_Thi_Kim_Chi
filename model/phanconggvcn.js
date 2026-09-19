const mongoose = require("mongoose");

const phanCongGVCNSchema = new mongoose.Schema({
    gvcn: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TaiKhoan",
        required: true
    },

    maLop: {
        type: String,
        required: true,
        trim: true
    },

    namHoc: {
        type: String,
        required: true,

        validate: {
            validator: function(value) {
                const match = value.match(/^(\d{4})-(\d{4})$/);

                if (!match) {
                    return false;
                }

                const namDau = Number(match[1]);
                const namSau = Number(match[2]);

                return namSau === namDau + 1;
            },

            message: "Năm học phải có dạng YYYY-YYYY và hai năm liên tiếp"
        }
    },

    trangThai: {
        type: Boolean,
        default: true
    }
}, {
    collection: "PhanCongGVCN"
});

// Không phân công trùng cùng GVCN + lớp + năm học
phanCongGVCNSchema.index(
    {
        gvcn: 1,
        maLop: 1,
        namHoc: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model(
    "PhanCongGVCN",
    phanCongGVCNSchema
);