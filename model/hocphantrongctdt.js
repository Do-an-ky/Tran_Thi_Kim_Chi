const mongoose = require("mongoose");

const hocPhanTrongCTDTSchema = new mongoose.Schema(
    {
        // Chương trình đào tạo
        chuongTrinhDaoTao: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ChuongTrinhDaoTao",
            required: true
        },

        // Học phần
        hocPhan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "HocPhan",
            required: true
        },

        /*
            BAT_BUOC
            TU_CHON
            DO_AN_TOT_NGHIEP
            THAY_THE_DO_AN
        */
        loaiHocPhan: {
            type: String,
            enum: [
                "BAT_BUOC",
                "TU_CHON",
                "DO_AN_TOT_NGHIEP",
                "THAY_THE_DO_AN"
            ],
            required: true
        },

        // Tối đa 1 môn tiên quyết trực tiếp
        hocPhanTienQuyet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "HocPhan",
            default: null
        },

        // Chỉ sử dụng cho học phần tự chọn
        nhomTuChon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "NhomTuChon",
            default: null
        }
    },
    {
        collection: "HocPhanTrongCTDT",
        timestamps: true
    }
);


// ======================================================
// UNIQUE INDEX
// ======================================================

hocPhanTrongCTDTSchema.index(
    {
        chuongTrinhDaoTao: 1,
        hocPhan: 1
    },
    {
        unique: true
    }
);


// ======================================================
// KIỂM TRA DỮ LIỆU TRƯỚC KHI VALIDATE
// ======================================================

hocPhanTrongCTDTSchema.pre(
    "validate",
    function () {

        // TU_CHON bắt buộc phải thuộc một nhóm tự chọn
        if (
            this.loaiHocPhan === "TU_CHON" &&
            !this.nhomTuChon
        ) {
            throw new Error(
                "Học phần TU_CHON phải thuộc một nhóm tự chọn"
            );
        }

        // Các loại khác không thuộc nhóm tự chọn
        if (
            this.loaiHocPhan !== "TU_CHON"
        ) {
            this.nhomTuChon = null;
        }
    }
);


module.exports = mongoose.model(
    "HocPhanTrongCTDT",
    hocPhanTrongCTDTSchema
);