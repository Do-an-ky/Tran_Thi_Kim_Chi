
/**
 * KIEM THU TC21 - TC22 - TC23
 * Chay tren ma nguon DAKWEB truoc khi sua loi.
 *
 * Lenh chay:
 * node kiem-thu-3-loi.js
 *
 * Khong ket noi hoac thay doi MongoDB.
 */

const {
    validatePrerequisites,
    validateCurriculumStructure
} = require("./service/progressService");

// Tao hoc phan gia lap de kiem thu
function taoHocPhan(
    ma,
    loai,
    soTinChi,
    maTienQuyet = null,
    nhomTuChon = null
) {
    return {
        hocPhan: {
            _id: ma,
            maHocPhan: ma,
            tenHocPhan: ma,
            soTinChi: soTinChi
        },

        loaiHocPhan: loai,

        hocPhanTienQuyet: maTienQuyet
            ? {
                _id: maTienQuyet,
                maHocPhan: maTienQuyet
            }
            : null,

        nhomTuChon: nhomTuChon,

        status: "CHUA_HOC"
    };
}

let soTestKhongDat = 0;

// Hien thi ket qua kiem thu
function inKetQua(maTC, ten, duLieu, ketQua) {
    const mongDoi = false;
    const thucTe = ketQua.valid;

    const dat = thucTe === mongDoi;

    if (!dat) {
        soTestKhongDat++;
    }

    console.log("\n======================================");
    console.log(maTC + " - " + ten);
    console.log("--------------------------------------");
    console.log("Du lieu: " + duLieu);
    console.log("Mong doi: valid = " + mongDoi);
    console.log("Thuc te:  valid = " + thucTe);

    if (ketQua.message) {
        console.log("Thong bao: " + ketQua.message);
    }

    console.log(
        "KET LUAN: " +
        (dat ? "DAT" : "KHONG DAT - PHAT HIEN LOI")
    );
}

console.log("======================================");
console.log("KIEM THU DU LIEU CTDT TRUOC KHI SUA LOI");
console.log("======================================");

// ==========================================
// TC21: HOC PHAN TU LAM TIEN QUYET
// ==========================================

const duLieuTC21 = [
    taoHocPhan(
        "A",
        "BAT_BUOC",
        2,
        "A"
    )
];

const ketQuaTC21 =
    validatePrerequisites(duLieuTC21);

inKetQua(
    "TC21",
    "Hoc phan tu lam tien quyet",
    "Hoc phan A yeu cau chinh A",
    ketQuaTC21
);

// ==========================================
// TC22: QUAN HE TIEN QUYET TAO VONG
// ==========================================

const duLieuTC22 = [
    taoHocPhan(
        "A",
        "BAT_BUOC",
        2,
        "B"
    ),

    taoHocPhan(
        "B",
        "BAT_BUOC",
        2,
        "A"
    )
];

const ketQuaTC22 =
    validatePrerequisites(duLieuTC22);

inKetQua(
    "TC22",
    "Quan he tien quyet tao vong",
    "A yeu cau B, B yeu cau A",
    ketQuaTC22
);

// ==========================================
// TC23: NHOM TU CHON KHONG DU HOC PHAN
// ==========================================

// Nhom tu chon yeu cau dat 3 mon,
// nhung CTDT chi cung cap 1 mon.

const nhomTC = {
    _id: "NHOM_TC",
    maNhom: "NHOM_TC",
    soMonCanDat: 3
};

const duLieuTC23 = [
    taoHocPhan(
        "BB01",
        "BAT_BUOC",
        2
    ),

    taoHocPhan(
        "TC01",
        "TU_CHON",
        2,
        null,
        nhomTC
    ),

    taoHocPhan(
        "DATN",
        "DO_AN_TOT_NGHIEP",
        10
    ),

    taoHocPhan(
        "TDATN",
        "THAY_THE_DO_AN",
        10
    )
];

// Tong tin chi yeu cau:
// Bat buoc: 2
// Tu chon:  3 x 2 = 6
// Do an:    10
// Tong:     18

const ketQuaTC23 =
    validateCurriculumStructure(
        duLieuTC23,
        18
    );

inKetQua(
    "TC23",
    "Nhom tu chon khong du hoc phan",
    "Yeu cau 3 mon nhung chi co 1 mon",
    ketQuaTC23
);

// ==========================================
// TONG KET
// ==========================================

console.log("\n======================================");
console.log("TONG KET KIEM THU");
console.log("======================================");

console.log("Tong so test case: 3");
console.log("So test case khong dat: " + soTestKhongDat);
console.log("So test case dat: " + (3 - soTestKhongDat));

console.log("\nDa hoan thanh kiem thu.");
console.log("Khong co du lieu MongoDB nao bi thay doi.");
