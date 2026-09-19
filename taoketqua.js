const connect = require("./connect");

const SinhVien = require("./model/sinhvien");
const ChuongTrinhDaoTao = require("./model/chuongtrinhdaotao");
const HocPhanTrongCTDT = require("./model/hocphantrongctdt");
const KetQuaHocTap = require("./model/ketquahoctap");
require("./model/hocphan");

// ======================================================
// TẠO ĐIỂM DEMO
// ======================================================

function diemDat(seed)
{
    return Number((5 + (seed % 41) / 10).toFixed(1));
}

function diemChuaDat(seed)
{
    return Number((2 + (seed % 29) / 10).toFixed(1));
}


// ======================================================
// HỌC KỲ / NĂM HỌC DEMO
// ======================================================

function layHocKy(index)
{
    return index % 2 === 0 ? "1" : "2";
}

function layNamHoc(index)
{
    const danhSachNamHoc = [
        "2022-2023",
        "2023-2024",
        "2024-2025",
        "2025-2026"
    ];

    return danhSachNamHoc[
        Math.floor(index / 12) % danhSachNamHoc.length
    ];
}


// ======================================================
// MAIN
// ======================================================

async function taoKetQua()
{
    try
    {
        await connect();

        console.log("Đã kết nối MongoDB");


        // ==================================================
        // LẤY CTĐT CNTT
        // ==================================================

        const chuongTrinh =
            await ChuongTrinhDaoTao.findOne({
                maChuongTrinh: "CNTT"
            });

        if (!chuongTrinh)
        {
            throw new Error(
                "Không tìm thấy chương trình đào tạo CNTT."
            );
        }


        // ==================================================
        // LẤY HỌC PHẦN TRONG CTĐT
        // ==================================================

        const curriculumCourses =
            await HocPhanTrongCTDT.find({
                chuongTrinhDaoTao: chuongTrinh._id
            })
            .populate("hocPhan")
            .sort({ _id: 1 });

        if (curriculumCourses.length === 0)
        {
            throw new Error(
                "CTĐT chưa có học phần."
            );
        }


        const batBuoc =
            curriculumCourses.filter(
                item =>
                    item.loaiHocPhan === "BAT_BUOC"
            );

        const tuChon =
            curriculumCourses.filter(
                item =>
                    item.loaiHocPhan === "TU_CHON"
            );

        const doAn =
            curriculumCourses.filter(
                item =>
                    item.loaiHocPhan === "DO_AN_TOT_NGHIEP"
            );

        const thayThe =
            curriculumCourses.filter(
                item =>
                    item.loaiHocPhan === "THAY_THE_DO_AN"
            );


        console.log(
            `Bắt buộc: ${batBuoc.length}`
        );

        console.log(
            `Tự chọn: ${tuChon.length}`
        );

        console.log(
            `Đồ án: ${doAn.length}`
        );

        console.log(
            `Thay thế đồ án: ${thayThe.length}`
        );


        // ==================================================
        // LẤY 150 SINH VIÊN
        // ==================================================

        const sinhViens =
            await SinhVien.find({
                maSinhVien: {
                    $regex: /^SV\d{3}$/
                }
            })
            .sort({
                maSinhVien: 1
            })
            .limit(150);

        if (sinhViens.length !== 150)
        {
            throw new Error(
                `Hiện chỉ tìm thấy ${sinhViens.length}/150 sinh viên.`
            );
        }


        // ==================================================
        // XÓA KẾT QUẢ CŨ CỦA 150 SINH VIÊN
        // ==================================================

        await KetQuaHocTap.deleteMany({
            sinhVien: {
                $in: sinhViens.map(
                    sv => sv._id
                )
            }
        });

        console.log(
            "Đã xóa kết quả học tập demo cũ."
        );


        // ==================================================
        // TẠO KẾT QUẢ MỚI
        // ==================================================

        const ketQuaMoi = [];


        for (
            let svIndex = 0;
            svIndex < sinhViens.length;
            svIndex++
        )
        {
            const sinhVien =
                sinhViens[svIndex];

            const stt =
                svIndex + 1;


            // ==============================================
            // 1. HỌC PHẦN BẮT BUỘC
            // ==============================================

            for (
                let hpIndex = 0;
                hpIndex < batBuoc.length;
                hpIndex++
            )
            {
                const item =
                    batBuoc[hpIndex];

                const hocPhan =
                    item.hocPhan;

                const seed =
                    stt * 100 + hpIndex;


                // ------------------------------------------
                // SV001:
                // hoàn thành toàn bộ học phần bắt buộc
                // ------------------------------------------

                if (stt === 1)
                {
                    ketQuaMoi.push({
                        sinhVien:
                            sinhVien._id,

                        hocPhan:
                            hocPhan._id,

                        hocKy:
                            layHocKy(hpIndex),

                        namHoc:
                            layNamHoc(hpIndex),

                        lanHoc: 1,

                        diem:
                            diemDat(seed),

                        trangThai:
                            "DAT"
                    });

                    continue;
                }


                // ------------------------------------------
                // SV002:
                // cố tình để 1 môn bắt buộc 2 tín chỉ chưa đạt
                // ------------------------------------------

                if (
                    stt === 2 &&
                    Number(hocPhan.soTinChi) === 2
                )
                {
                    ketQuaMoi.push({
                        sinhVien:
                            sinhVien._id,

                        hocPhan:
                            hocPhan._id,

                        hocKy:
                            layHocKy(hpIndex),

                        namHoc:
                            layNamHoc(hpIndex),

                        lanHoc: 1,

                        diem: 4.0,

                        trangThai:
                            "CHUA_DAT"
                    });

                    // Chỉ để đúng 1 học phần chưa đạt
                    break;
                }


                // ------------------------------------------
                // Một số SV chưa học vài môn cuối
                // ------------------------------------------

                if (
                    stt > 2 &&
                    stt % 7 === 0 &&
                    hpIndex >= batBuoc.length - 3
                )
                {
                    // Không tạo bản ghi
                    // => hệ thống suy ra CHUA_HOC
                    continue;
                }


                // ------------------------------------------
                // Một số SV có một môn chưa đạt
                // ------------------------------------------

                if (
                    stt > 2 &&
                    stt % 5 === 0 &&
                    hpIndex === batBuoc.length - 4
                )
                {
                    ketQuaMoi.push({
                        sinhVien:
                            sinhVien._id,

                        hocPhan:
                            hocPhan._id,

                        hocKy:
                            layHocKy(hpIndex),

                        namHoc:
                            layNamHoc(hpIndex),

                        lanHoc: 1,

                        diem:
                            diemChuaDat(seed),

                        trangThai:
                            "CHUA_DAT"
                    });

                    continue;
                }


                // ------------------------------------------
                // Một số SV có lịch sử học lại:
                // lần 1 chưa đạt, lần 2 đạt
                // ------------------------------------------

                if (
                    stt % 10 === 0 &&
                    hpIndex === 5
                )
                {
                    ketQuaMoi.push({
                        sinhVien:
                            sinhVien._id,

                        hocPhan:
                            hocPhan._id,

                        hocKy: "1",

                        namHoc:
                            "2023-2024",

                        lanHoc: 1,

                        diem: 4.2,

                        trangThai:
                            "CHUA_DAT"
                    });

                    ketQuaMoi.push({
                        sinhVien:
                            sinhVien._id,

                        hocPhan:
                            hocPhan._id,

                        hocKy: "2",

                        namHoc:
                            "2023-2024",

                        lanHoc: 2,

                        diem: 7.1,

                        trangThai:
                            "DAT"
                    });

                    continue;
                }


                // ------------------------------------------
                // Bình thường: DAT
                // ------------------------------------------

                ketQuaMoi.push({
                    sinhVien:
                        sinhVien._id,

                    hocPhan:
                        hocPhan._id,

                    hocKy:
                        layHocKy(hpIndex),

                    namHoc:
                        layNamHoc(hpIndex),

                    lanHoc: 1,

                    diem:
                        diemDat(seed),

                    trangThai:
                        "DAT"
                });
            }


            // ==============================================
            // Riêng SV002:
            // sau khi break ở môn 2 tín chỉ,
            // phải thêm các môn bắt buộc còn lại là DAT
            // ==============================================

            if (stt === 2)
            {
                let daTaoMonChuaDat =
                    false;

                for (
                    let hpIndex = 0;
                    hpIndex < batBuoc.length;
                    hpIndex++
                )
                {
                    const item =
                        batBuoc[hpIndex];

                    const hocPhan =
                        item.hocPhan;


                    if (
                        !daTaoMonChuaDat &&
                        Number(hocPhan.soTinChi) === 2
                    )
                    {
                        daTaoMonChuaDat =
                            true;

                        continue;
                    }


                    const daTonTai =
                        ketQuaMoi.some(
                            kq =>
                                String(
                                    kq.sinhVien
                                ) ===
                                String(
                                    sinhVien._id
                                ) &&
                                String(
                                    kq.hocPhan
                                ) ===
                                String(
                                    hocPhan._id
                                )
                        );

                    if (daTonTai)
                    {
                        continue;
                    }


                    const seed =
                        stt * 100 +
                        hpIndex;

                    ketQuaMoi.push({
                        sinhVien:
                            sinhVien._id,

                        hocPhan:
                            hocPhan._id,

                        hocKy:
                            layHocKy(hpIndex),

                        namHoc:
                            layNamHoc(hpIndex),

                        lanHoc: 1,

                        diem:
                            diemDat(seed),

                        trangThai:
                            "DAT"
                    });
                }
            }


            // ==============================================
            // 2. HỌC PHẦN TỰ CHỌN
            // ==============================================

            // SV001 và SV002:
            // đạt đủ 3 môn tự chọn
            let soMonTuChonDat = 3;

            // Một số sinh viên khác chỉ đạt 2
            if (
                stt > 2 &&
                stt % 6 === 0
            )
            {
                soMonTuChonDat = 2;
            }


            const soLuong =
                Math.min(
                    soMonTuChonDat,
                    tuChon.length
                );


            for (
                let i = 0;
                i < soLuong;
                i++
            )
            {
                const hocPhan =
                    tuChon[i].hocPhan;

                ketQuaMoi.push({
                    sinhVien:
                        sinhVien._id,

                    hocPhan:
                        hocPhan._id,

                    hocKy: "2",

                    namHoc:
                        "2025-2026",

                    lanHoc: 1,

                    diem:
                        diemDat(
                            stt * 200 + i
                        ),

                    trangThai:
                        "DAT"
                });
            }


            // ==============================================
            // 3. ĐỒ ÁN / THAY THẾ
            // ==============================================

            // Giữ SV001, SV002 chưa hoàn thành khối tốt nghiệp
            // để giống dữ liệu demo cũ.

            if (
                stt !== 1 &&
                stt !== 2 &&
                stt % 4 === 0 &&
                doAn.length > 0
            )
            {
                const hocPhan =
                    doAn[0].hocPhan;

                ketQuaMoi.push({
                    sinhVien:
                        sinhVien._id,

                    hocPhan:
                        hocPhan._id,

                    hocKy: "2",

                    namHoc:
                        "2025-2026",

                    lanHoc: 1,

                    diem:
                        diemDat(stt * 300),

                    trangThai:
                        "DAT"
                });
            }
            else if (
                stt !== 1 &&
                stt !== 2 &&
                stt % 4 === 1 &&
                thayThe.length > 0
            )
            {
                let tongTinChi =
                    0;

                for (
                    let i = 0;
                    i < thayThe.length;
                    i++
                )
                {
                    const hocPhan =
                        thayThe[i].hocPhan;

                    if (
                        tongTinChi >= 10
                    )
                    {
                        break;
                    }

                    ketQuaMoi.push({
                        sinhVien:
                            sinhVien._id,

                        hocPhan:
                            hocPhan._id,

                        hocKy: "2",

                        namHoc:
                            "2025-2026",

                        lanHoc: 1,

                        diem:
                            diemDat(
                                stt * 400 + i
                            ),

                        trangThai:
                            "DAT"
                    });

                    tongTinChi +=
                        Number(
                            hocPhan.soTinChi
                        );
                }
            }
        }


        // ==================================================
        // INSERT
        // ==================================================

        await KetQuaHocTap.insertMany(
            ketQuaMoi
        );


        console.log("");
        console.log(
            "===================================="
        );

        console.log(
            "TẠO KẾT QUẢ HỌC TẬP THÀNH CÔNG"
        );

        console.log(
            "===================================="
        );

        console.log(
            `Sinh viên: ${sinhViens.length}`
        );

        console.log(
            `Bản ghi kết quả: ${ketQuaMoi.length}`
        );

        console.log(
            "Đã thêm trường điểm cho các lần học."
        );

        console.log("");
        console.log(
            "SV001: đủ bắt buộc + đủ tự chọn, chưa có đồ án"
        );

        console.log(
            "SV002: có 1 học phần bắt buộc 2 tín chỉ CHUA_DAT"
        );

        console.log(
            "Một số SV có CHUA_HOC / CHUA_DAT / học lại / đồ án / thay thế."
        );

        process.exit(0);
    }
    catch (error)
    {
        console.error(
            "LỖI TẠO KẾT QUẢ:"
        );

        console.error(error);

        process.exit(1);
    }
}


taoKetQua();