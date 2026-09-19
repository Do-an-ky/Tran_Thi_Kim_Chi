const bcrypt = require("bcrypt");

const connect = require("./connect");

const TaiKhoan = require("./model/taikhoan");
const SinhVien = require("./model/sinhvien");
const ChuongTrinhDaoTao = require("./model/chuongtrinhdaotao");
const PhanCongGVCN = require("./model/phanconggvcn");


// ======================================================
// TẠO HỌ TÊN SINH VIÊN
// ======================================================

const danhSachHo = [
    "Nguyễn",
    "Trần",
    "Lê",
    "Phạm",
    "Hoàng",
    "Huỳnh",
    "Phan",
    "Vũ",
    "Võ",
    "Đặng",
    "Bùi",
    "Đỗ",
    "Hồ",
    "Ngô",
    "Dương",
    "Lý",
    "Đinh"
];

const danhSachTenDem = [
    "Văn",
    "Thị",
    "Minh",
    "Quang",
    "Đức",
    "Ngọc",
    "Thanh",
    "Gia",
    "Khánh",
    "Thu",
    "Hải",
    "Tuấn",
    "Hoàng",
    "Phương",
    "Anh",
    "Hữu",
    "Trọng",
    "Thùy",
    "Bảo"
];

const danhSachTen = [
    "Anh",
    "Huy",
    "Trang",
    "Mai",
    "Nam",
    "Linh",
    "Long",
    "Dũng",
    "Hà",
    "Hiếu",
    "Phúc",
    "Thảo",
    "Tú",
    "Vy",
    "Khang",
    "Quân",
    "Hương",
    "Nga",
    "Nhung",
    "Tuấn",
    "Đạt",
    "Khôi",
    "My"
];

function taoHoTen(index)
{
    const ho =
        danhSachHo[index % danhSachHo.length];

    const tenDem =
        danhSachTenDem[(index * 7) % danhSachTenDem.length];

    const ten =
        danhSachTen[(index * 11) % danhSachTen.length];

    return `${ho} ${tenDem} ${ten}`;
}


// ======================================================
// XÁC ĐỊNH LỚP
// ======================================================

function layMaLop(stt)
{
    if (stt <= 50)
    {
        return "CNTT01";
    }

    if (stt <= 100)
    {
        return "CNTT02";
    }

    return "CNTT03";
}


// ======================================================
// TẠO DỮ LIỆU
// ======================================================

async function taoDuLieuMau()
{
    try
    {
        await connect();

        console.log("Đã kết nối MongoDB");


        // ==================================================
        // LẤY CTĐT
        // ==================================================

        const chuongTrinh =
            await ChuongTrinhDaoTao.findOne({
                maChuongTrinh: "CNTT"
            });

        if (!chuongTrinh)
        {
            throw new Error(
                "Không tìm thấy CTĐT CNTT. Hãy chạy taochuongtrinh.js trước."
            );
        }


        // ==================================================
        // MẬT KHẨU DEMO
        // ==================================================

        const passwordHash =
            await bcrypt.hash("123456", 12);


        // ==================================================
        // TẠO 1 GVCN
        // ==================================================

        const taiKhoanGVCN =
            await TaiKhoan.findOneAndUpdate(
                {
                    tenDangNhap: "gv001"
                },
                {
                    $set: {
                        passwordHash: passwordHash,
                        hoTen: "Nguyễn Thị Thu Hằng",
                        vaiTro: "GVCN",
                        sinhVien: null,
                        trangThai: true
                    }
                },
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                }
            );

        console.log(
            `GVCN: ${taiKhoanGVCN.hoTen} - gv001`
        );


        // ==================================================
        // PHÂN CÔNG GVCN CHO 3 LỚP
        // ==================================================

        const danhSachLop = [
            "CNTT01",
            "CNTT02",
            "CNTT03"
        ];

        for (const maLop of danhSachLop)
        {
            await PhanCongGVCN.findOneAndUpdate(
                {
                    gvcn: taiKhoanGVCN._id,
                    maLop: maLop,
                    namHoc: "2025-2026"
                },
                {
                    $set: {
                        gvcn: taiKhoanGVCN._id,
                        maLop: maLop,
                        namHoc: "2025-2026",
                        trangThai: true
                    }
                },
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                }
            );
        }

        console.log(
            "Đã phân công GVCN cho CNTT01, CNTT02, CNTT03"
        );


        // ==================================================
        // TẠO 150 SINH VIÊN
        // ==================================================

        let demCNTT01 = 0;
        let demCNTT02 = 0;
        let demCNTT03 = 0;

        for (let stt = 1; stt <= 150; stt++)
        {
            const maSinhVien =
                `SV${String(stt).padStart(3, "0")}`;

            const hoTen =
                taoHoTen(stt - 1);

            const maLop =
                layMaLop(stt);


            // ----------------------------------------------
            // TÀI KHOẢN SINH VIÊN
            // ----------------------------------------------

            const taiKhoan =
                await TaiKhoan.findOneAndUpdate(
                    {
                        tenDangNhap: maSinhVien
                    },
                    {
                        $set: {
                            passwordHash: passwordHash,
                            hoTen: hoTen,
                            vaiTro: "SINH_VIEN",
                            trangThai: true
                        }
                    },
                    {
                        upsert: true,
                        new: true,
                        setDefaultsOnInsert: true
                    }
                );


            // ----------------------------------------------
            // HỒ SƠ SINH VIÊN
            // ----------------------------------------------

            const sinhVien =
                await SinhVien.findOneAndUpdate(
                    {
                        maSinhVien: maSinhVien
                    },
                    {
                        $set: {
                            hoTen: hoTen,
                            maLop: maLop,
                            nganh: "Công nghệ thông tin",
                            chuongTrinhDaoTao:
                                chuongTrinh._id,
                            taiKhoan:
                                taiKhoan._id
                        }
                    },
                    {
                        upsert: true,
                        new: true,
                        setDefaultsOnInsert: true
                    }
                );


            // ----------------------------------------------
            // LIÊN KẾT NGƯỢC TÀI KHOẢN -> SINH VIÊN
            // ----------------------------------------------

            await TaiKhoan.updateOne(
                {
                    _id: taiKhoan._id
                },
                {
                    $set: {
                        sinhVien: sinhVien._id
                    }
                }
            );


            // ----------------------------------------------
            // ĐẾM THEO LỚP
            // ----------------------------------------------

            if (maLop === "CNTT01")
            {
                demCNTT01++;
            }
            else if (maLop === "CNTT02")
            {
                demCNTT02++;
            }
            else if (maLop === "CNTT03")
            {
                demCNTT03++;
            }

            console.log(
                `${maSinhVien} | ${hoTen} | ${maLop}`
            );
        }


        // ==================================================
        // KIỂM TRA KẾT QUẢ
        // ==================================================

        console.log("");
        console.log("====================================");
        console.log("TẠO DỮ LIỆU MẪU THÀNH CÔNG");
        console.log("====================================");

        console.log(
            `CNTT01: ${demCNTT01} sinh viên`
        );

        console.log(
            `CNTT02: ${demCNTT02} sinh viên`
        );

        console.log(
            `CNTT03: ${demCNTT03} sinh viên`
        );

        console.log(
            `Tổng: ${
                demCNTT01 +
                demCNTT02 +
                demCNTT03
            } sinh viên`
        );

        console.log("");
        console.log("Tài khoản GVCN:");
        console.log("  gv001 / 123456");

        console.log("");
        console.log("Tài khoản sinh viên:");
        console.log("  SV001 -> SV150");
        console.log("  Mật khẩu chung: 123456");

        process.exit(0);
    }
    catch (error)
    {
        console.error(
            "LỖI TẠO DỮ LIỆU MẪU:"
        );

        console.error(error);

        process.exit(1);
    }
}


taoDuLieuMau();