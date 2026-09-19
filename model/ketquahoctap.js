const mongoose = require("mongoose");

const ketQuaHocTapSchema = new mongoose.Schema(
{
    sinhVien: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SinhVien",
        required: true
    },

    hocPhan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HocPhan",
        required: true
    },

    hocKy: {
        type: String,
        enum: ["1", "2", "HE"],
        required: true
    },

    namHoc: {
        type: String,
        required: true,
        validate: {
            validator: function(value) {
                if (!/^\d{4}-\d{4}$/.test(value)) {
                    return false;
                }

                const parts = value.split("-");

                return Number(parts[1]) === Number(parts[0]) + 1;
            },

            message: "Năm học phải có dạng YYYY-YYYY và hai năm liên tiếp."
        }
    },

    lanHoc: {
        type: Number,
        required: true,
        min: 1
    },

    // Chỉ dùng để hiển thị cho sinh viên/GVCN.
    // Không dùng điểm để tự suy ra DAT hoặc CHUA_DAT.
    diem: {
        type: Number,
        min: 0,
        max: 10,
        default: null
    },

    trangThai: {
        type: String,
        enum: ["DAT", "CHUA_DAT"],
        required: true
    }
},
{
    collection: "KetQuaHocTap",
    timestamps: true
}
);

// Cho phép cùng một học phần có nhiều lần học,
// nhưng không cho phép trùng hoàn toàn cùng một lần học.
ketQuaHocTapSchema.index(
    {
        sinhVien: 1,
        hocPhan: 1,
        hocKy: 1,
        namHoc: 1,
        lanHoc: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model(
    "KetQuaHocTap",
    ketQuaHocTapSchema
);