const mongoose = require("mongoose");

const connect = require("./connect.js");

const HocPhan =
    require("./model/hocphan.js");

const ChuongTrinhDaoTao =
    require("./model/chuongtrinhdaotao.js");

const HocPhanTrongCTDT =
    require("./model/hocphantrongctdt.js");

const NhomTuChon =
    require("./model/nhomtuchon.js");

const SinhVien =
    require("./model/sinhvien.js");


// ======================================================
// CẤU HÌNH
// ======================================================

const MA_CHUONG_TRINH = "CNTT";

const TEN_CHUONG_TRINH =
    "Công nghệ thông tin";

const TONG_TIN_CHI_YEU_CAU = 140;

const SO_MON_TU_CHON_CAN_DAT = 3;

const SO_TIN_CHI_TU_CHON_DUOC_TINH = 6;

const SO_TIN_CHI_KHOI_TOT_NGHIEP = 10;

const MA_DO_AN_TOT_NGHIEP =
    "0221373";


// ======================================================
// DANH SÁCH HỌC PHẦN
// ======================================================

const danhSachHocPhan = [

    {
        maHocPhan: "0000102",
        tenHocPhan: "Tư tưởng Hồ Chí Minh",
        soTinChi: 2
    },

    {
        maHocPhan: "0000104",
        tenHocPhan: "Triết học Mác-Lênin",
        soTinChi: 3
    },

    {
        maHocPhan: "0000105",
        tenHocPhan: "Kinh tế chính trị Mác-Lênin",
        soTinChi: 2
    },

    {
        maHocPhan: "0000106",
        tenHocPhan: "Chủ nghĩa xã hội khoa học",
        soTinChi: 2
    },

    {
        maHocPhan: "0000107_2",
        tenHocPhan: "Lịch sử Đảng Cộng sản Việt Nam",
        soTinChi: 2
    },

    {
        maHocPhan: "0000301",
        tenHocPhan: "Toán cao cấp A1",
        soTinChi: 3
    },

    {
        maHocPhan: "0000302",
        tenHocPhan: "Toán cao cấp A2",
        soTinChi: 2
    },

    {
        maHocPhan: "0000310",
        tenHocPhan: "Xác suất thống kê",
        soTinChi: 3
    },

    {
        maHocPhan: "0000515",
        tenHocPhan: "Pháp luật đại cương",
        soTinChi: 2
    },

    {
        maHocPhan: "0000701",
        tenHocPhan: "General English 1",
        soTinChi: 6
    },

    {
        maHocPhan: "0000702",
        tenHocPhan: "General English 2",
        soTinChi: 4
    },

    {
        maHocPhan: "0000703",
        tenHocPhan: "General English 3",
        soTinChi: 4
    },

    {
        maHocPhan: "0000705",
        tenHocPhan: "General English 4",
        soTinChi: 4
    },

    {
        maHocPhan: "0221001_CNTT",
        tenHocPhan: "Phương pháp nghiên cứu khoa học",
        soTinChi: 2
    },

    {
        maHocPhan: "0221008_CNTT",
        tenHocPhan: "Photoshop",
        soTinChi: 2
    },

    {
        maHocPhan: "0221102",
        tenHocPhan: "Kiến trúc máy tính",
        soTinChi: 2
    },

    {
        maHocPhan: "0221103",
        tenHocPhan: "Cơ sở dữ liệu",
        soTinChi: 3
    },

    {
        maHocPhan: "0221104",
        tenHocPhan: "Phân tích và thiết kế hệ thống",
        soTinChi: 2
    },

    {
        maHocPhan: "0221105",
        tenHocPhan: "Mạng máy tính",
        soTinChi: 2
    },

    {
        maHocPhan: "0221106",
        tenHocPhan: "Hệ điều hành",
        soTinChi: 2
    },

    {
        maHocPhan: "0221111",
        tenHocPhan: "An toàn thông tin",
        soTinChi: 2
    },

    {
        maHocPhan: "0221201",
        tenHocPhan: "Cấu trúc dữ liệu và giải thuật",
        soTinChi: 3
    },

    {
        maHocPhan: "0221208",
        tenHocPhan: "Lập trình hướng đối tượng",
        soTinChi: 3
    },

    {
        maHocPhan: "0221211",
        tenHocPhan: "Trí tuệ nhân tạo",
        soTinChi: 2
    },

    {
        maHocPhan: "0221212",
        tenHocPhan: "Kỹ nghệ phần mềm",
        soTinChi: 2
    },

    {
        maHocPhan: "0221214",
        tenHocPhan: "Công nghệ mã nguồn mở",
        soTinChi: 2
    },

    {
        maHocPhan: "0221215",
        tenHocPhan: "Hệ quản trị CSDL Oracle",
        soTinChi: 2
    },

    {
        maHocPhan: "0221221",
        tenHocPhan: "Tương tác người máy",
        soTinChi: 2
    },

    {
        maHocPhan: "0221271",
        tenHocPhan: "Tiếng Anh chuyên ngành",
        soTinChi: 3
    },

    {
        maHocPhan: "0221303",
        tenHocPhan: "Quản lý dự án phần mềm",
        soTinChi: 2
    },

    {
        maHocPhan: "0221307",
        tenHocPhan: "Thiết kế và xây dựng phần mềm",
        soTinChi: 3
    },

    {
        maHocPhan: "0221309",
        tenHocPhan: "Thương mại điện tử",
        soTinChi: 2
    },

    {
        maHocPhan: "0221311",
        tenHocPhan: "Kiểm chứng phần mềm",
        soTinChi: 2
    },

    {
        maHocPhan: "0221312",
        tenHocPhan: "Phân tích dữ liệu với Python",
        soTinChi: 3
    },

    {
        maHocPhan: "0221313",
        tenHocPhan: "NodeJS",
        soTinChi: 2
    },

    {
        maHocPhan: "0221314",
        tenHocPhan: "Thực tế doanh nghiệp",
        soTinChi: 2
    },

    {
        maHocPhan: "0221315",
        tenHocPhan: "Xử lý ngôn ngữ tự nhiên",
        soTinChi: 2
    },

    {
        maHocPhan: "0221316",
        tenHocPhan: "Hệ thống thông tin thông minh",
        soTinChi: 2
    },

    {
        maHocPhan: "0221373",
        tenHocPhan: "Đồ án tốt nghiệp",
        soTinChi: 10
    },

    {
        maHocPhan: "0221374",
        tenHocPhan: "Đồ án",
        soTinChi: 2
    },

    {
        maHocPhan: "0221401",
        tenHocPhan: "Truyền dữ liệu",
        soTinChi: 2
    },

    {
        maHocPhan: "0221404",
        tenHocPhan: "An toàn thông tin mạng",
        soTinChi: 2
    },

    {
        maHocPhan: "0221407",
        tenHocPhan: "Lập trình mạng",
        soTinChi: 3
    },

    {
        maHocPhan: "0221408",
        tenHocPhan: "Quản trị hệ thống mạng",
        soTinChi: 2
    },

    {
        maHocPhan: "0221410",
        tenHocPhan: "Sao lưu phục hồi hệ thống mạng",
        soTinChi: 2
    },

    {
        maHocPhan: "0221413",
        tenHocPhan: "Giám sát và nâng cao hiệu suất mạng",
        soTinChi: 2
    },

    {
        maHocPhan: "0221415",
        tenHocPhan: "Thiết kế mô hình mạng",
        soTinChi: 3
    },

    {
        maHocPhan: "0221416",
        tenHocPhan: "Mạng không dây và Di động",
        soTinChi: 2
    },

    {
        maHocPhan: "0221417",
        tenHocPhan: "Các giao thức định tuyến",
        soTinChi: 2
    },

    {
        maHocPhan: "0221418",
        tenHocPhan: "Quản trị dữ liệu phân tán",
        soTinChi: 2
    },

    {
        maHocPhan: "0221419",
        tenHocPhan: "Thiết bị truyền thông và mạng",
        soTinChi: 2
    },

    {
        maHocPhan: "0221421",
        tenHocPhan: "Hệ thống tường lửa",
        soTinChi: 2
    },

    {
        maHocPhan: "0221422",
        tenHocPhan: "Truyền thông đa phương tiện",
        soTinChi: 2
    },

    {
        maHocPhan: "0221502_3",
        tenHocPhan: "Hệ thống nhúng",
        soTinChi: 2
    },

    {
        maHocPhan: "0221504",
        tenHocPhan: "Phát triển phần mềm hướng dịch vụ",
        soTinChi: 2
    },

    {
        maHocPhan: "0221508",
        tenHocPhan: "Thiết kế giao diện website",
        soTinChi: 3
    },

    {
        maHocPhan: "0221601",
        tenHocPhan: "Khai phá dữ liệu",
        soTinChi: 2
    },

    {
        maHocPhan: "0221801",
        tenHocPhan: "Nhập môn Công nghệ thông tin",
        soTinChi: 3
    },

    {
        maHocPhan: "0221802",
        tenHocPhan: "Toán rời rạc và Đại số Boole",
        soTinChi: 3
    },

    {
        maHocPhan: "0221803",
        tenHocPhan: "Mô hình mạng xã hội",
        soTinChi: 2
    },

    {
        maHocPhan: "0221812",
        tenHocPhan: "Học máy",
        soTinChi: 2
    },

    {
        maHocPhan: "0221814",
        tenHocPhan: "Cơ sở dữ liệu phân tán",
        soTinChi: 2
    },

    {
        maHocPhan: "0221816",
        tenHocPhan: "Lập trình thiết bị di động",
        soTinChi: 3
    },

    {
        maHocPhan: "0221817",
        tenHocPhan: "Phát triển ứng dụng thiết bị di động",
        soTinChi: 2
    },

    {
        maHocPhan: "0221819",
        tenHocPhan: "Công nghệ XML và ứng dụng",
        soTinChi: 2
    },

    {
        maHocPhan: "0221820",
        tenHocPhan: "Xây dựng mô hình kết nối trực tuyến",
        soTinChi: 2
    },

    {
        maHocPhan: "0221821",
        tenHocPhan: "Hệ quản trị CSDL SQL Server",
        soTinChi: 2
    },

    {
        maHocPhan: "0221822",
        tenHocPhan: "Cơ sở Kỹ thuật lập trình",
        soTinChi: 2
    },

    {
        maHocPhan: "0221823",
        tenHocPhan: "Nhập môn IoT",
        soTinChi: 2
    },

    {
        maHocPhan: "0221824",
        tenHocPhan: "Công nghệ Java",
        soTinChi: 3
    },

    {
        maHocPhan: "0221825",
        tenHocPhan: "Lập trình windows",
        soTinChi: 3
    },

    {
        maHocPhan: "0221826",
        tenHocPhan: "Công nghệ ASP.Net",
        soTinChi: 2
    },

    {
        maHocPhan: "0331409",
        tenHocPhan: "Điện toán đám mây",
        soTinChi: 2
    },

    {
        maHocPhan: "7320008",
        tenHocPhan: "Lập trình website",
        soTinChi: 3
    },

    {
        maHocPhan: "7320023",
        tenHocPhan: "Thị giác máy tính và ứng dụng",
        soTinChi: 2
    },

    {
        maHocPhan: "KyNangLKT",
        tenHocPhan: "Kỹ năng lập kế hoạch và tổ chức",
        soTinChi: 2
    }
];


// ======================================================
// HỌC PHẦN BẮT BUỘC
// 49 MÔN = 124 TÍN CHỈ
// ======================================================

const danhSachBatBuoc = [

    "0000102",
    "0000104",
    "0000105",
    "0000106",
    "0000107_2",

    "0000301",
    "0000302",
    "0000310",
    "0000515",

    "0000701",
    "0000702",
    "0000703",
    "0000705",

    "0221008_CNTT",

    "0221102",
    "0221103",
    "0221104",
    "0221105",
    "0221106",
    "0221111",

    "0221201",
    "0221208",
    "0221211",
    "0221212",

    "0221221",
    "0221271",

    "0221303",
    "0221307",
    "0221311",
    "0221312",
    "0221313",
    "0221314",

    "0221374",

    "0221502_3",
    "0221508",
    "0221601",

    "0221801",
    "0221802",
    "0221812",
    "0221814",
    "0221816",

    "0221821",
    "0221822",
    "0221823",
    "0221824",
    "0221825",

    "7320008",
    "7320023",

    "KyNangLKT"
];


// ======================================================
// 6 HỌC PHẦN TỰ CHỌN
// CHỌN 3/6 = 6 TÍN
// ======================================================

const danhSachTuChon = [

    "0331409",

    "0221215",

    "0221819",

    "0221826",

    "0221214",

    "0221820"
];


// ======================================================
// HỌC PHẦN THAY THẾ ĐỒ ÁN
// ======================================================

const danhSachThayTheDoAn = [

    "0221001_CNTT",

    "0221309",

    "0221315",

    "0221316",

    "0221401",

    "0221404",

    "0221407",

    "0221408",

    "0221410",

    "0221413",

    "0221415",

    "0221416",

    "0221417",

    "0221418",

    "0221419",

    "0221421",

    "0221422",

    "0221504",

    "0221803",

    "0221817"
];


// ======================================================
// TIÊN QUYẾT
// ======================================================

const danhSachTienQuyet = {

    "0000702":
        "0000701",

    "0000703":
        "0000702",

    "0000705":
        "0000703",

    "0221271":
        "0000705"
};


// ======================================================
// HELPER LẤY HỌC PHẦN
// ======================================================

function layThongTinHocPhan(
    maHocPhan
) {

    return danhSachHocPhan.find(
        item =>
            item.maHocPhan ===
            maHocPhan
    );
}


// ======================================================
// XÁC ĐỊNH LOẠI HỌC PHẦN
// ======================================================

function xacDinhLoaiHocPhan(
    maHocPhan
) {

    if (
        maHocPhan ===
        MA_DO_AN_TOT_NGHIEP
    ) {

        return "DO_AN_TOT_NGHIEP";
    }


    if (
        danhSachBatBuoc.includes(
            maHocPhan
        )
    ) {

        return "BAT_BUOC";
    }


    if (
        danhSachTuChon.includes(
            maHocPhan
        )
    ) {

        return "TU_CHON";
    }


    if (
        danhSachThayTheDoAn.includes(
            maHocPhan
        )
    ) {

        return "THAY_THE_DO_AN";
    }


    throw new Error(
        `Học phần ${maHocPhan} chưa được phân loại.`
    );
}


// ======================================================
// KIỂM TRA CẤU HÌNH
// ======================================================

function kiemTraCauHinh() {

    const tatCaMa =
        new Set(
            danhSachHocPhan.map(
                item =>
                    item.maHocPhan
            )
        );


    // --------------------------------------------------
    // KIỂM TRA TRÙNG MÃ
    // --------------------------------------------------

    if (
        tatCaMa.size !==
        danhSachHocPhan.length
    ) {

        throw new Error(
            "Danh sách học phần có mã bị trùng."
        );
    }


    // --------------------------------------------------
    // KIỂM TRA TẤT CẢ MÔN ĐÃ ĐƯỢC PHÂN LOẠI
    // --------------------------------------------------

    for (
        const hp
        of danhSachHocPhan
    ) {

        xacDinhLoaiHocPhan(
            hp.maHocPhan
        );
    }


    // --------------------------------------------------
    // KIỂM TRA BẮT BUỘC
    // --------------------------------------------------

    for (
        const code
        of danhSachBatBuoc
    ) {

        if (!tatCaMa.has(code)) {

            throw new Error(
                `Không tìm thấy môn bắt buộc ${code}`
            );
        }
    }


    // --------------------------------------------------
    // KIỂM TRA TỰ CHỌN
    // --------------------------------------------------

    for (
        const code
        of danhSachTuChon
    ) {

        if (!tatCaMa.has(code)) {

            throw new Error(
                `Không tìm thấy môn tự chọn ${code}`
            );
        }


        if (
            danhSachBatBuoc.includes(
                code
            )
        ) {

            throw new Error(
                `${code} vừa BAT_BUOC vừa TU_CHON`
            );
        }
    }


    // --------------------------------------------------
    // KIỂM TRA THAY THẾ ĐỒ ÁN
    // --------------------------------------------------

    for (
        const code
        of danhSachThayTheDoAn
    ) {

        if (!tatCaMa.has(code)) {

            throw new Error(
                `Không tìm thấy môn thay thế ${code}`
            );
        }


        if (
            danhSachBatBuoc.includes(code) ||
            danhSachTuChon.includes(code)
        ) {

            throw new Error(
                `${code} bị phân loại trùng.`
            );
        }
    }


    // --------------------------------------------------
    // ĐỒ ÁN TỐT NGHIỆP
    // --------------------------------------------------

    if (
        !tatCaMa.has(
            MA_DO_AN_TOT_NGHIEP
        )
    ) {

        throw new Error(
            "Không tìm thấy Đồ án tốt nghiệp."
        );
    }


    // --------------------------------------------------
    // TỔNG TÍN CHỈ BẮT BUỘC
    // --------------------------------------------------

    const tongBatBuoc =
        danhSachBatBuoc.reduce(
            (sum, code) => {

                const hp =
                    layThongTinHocPhan(
                        code
                    );

                return (
                    sum +
                    Number(
                        hp.soTinChi
                    )
                );
            },
            0
        );


    // --------------------------------------------------
    // TÍN CHỈ TỰ CHỌN
    // --------------------------------------------------

    const tinChiTuChon =
        danhSachTuChon.map(
            code =>
                Number(
                    layThongTinHocPhan(
                        code
                    ).soTinChi
                )
        );


    const tatCaTuChonHaiTin =
        tinChiTuChon.every(
            value =>
                value === 2
        );


    if (!tatCaTuChonHaiTin) {

        throw new Error(
            "6 môn tự chọn phải đều là 2 tín chỉ."
        );
    }


    const tongTuChonDuocTinh =
        SO_MON_TU_CHON_CAN_DAT * 2;


    // --------------------------------------------------
    // ĐỒ ÁN
    // --------------------------------------------------

    const doAn =
        layThongTinHocPhan(
            MA_DO_AN_TOT_NGHIEP
        );


    const tinChiDoAn =
        Number(
            doAn.soTinChi
        );


    // --------------------------------------------------
    // TỔNG CẤU TRÚC
    // --------------------------------------------------

    const tongCauTruc =
        tongBatBuoc +
        tongTuChonDuocTinh +
        tinChiDoAn;


    console.log("");
    console.log(
        "Kiểm tra cấu trúc CTĐT:"
    );

    console.log(
        `BAT_BUOC = ${tongBatBuoc} tín`
    );

    console.log(
        `TU_CHON = ${tongTuChonDuocTinh} tín`
    );

    console.log(
        `ĐỒ ÁN/THAY THẾ = ${tinChiDoAn} tín`
    );

    console.log(
        `TỔNG = ${tongCauTruc} tín`
    );


    // --------------------------------------------------
    // PHẢI ĐÚNG 124 TÍN BẮT BUỘC
    // --------------------------------------------------

    if (
        tongBatBuoc !== 124
    ) {

        throw new Error(
            `BAT_BUOC phải bằng 124 tín nhưng hiện là ${tongBatBuoc}`
        );
    }


    // --------------------------------------------------
    // PHẢI ĐÚNG 140 TÍN TOÀN CHƯƠNG TRÌNH
    // --------------------------------------------------

    if (
        tongCauTruc !==
        TONG_TIN_CHI_YEU_CAU
    ) {

        throw new Error(
            `CTĐT phải bằng ${TONG_TIN_CHI_YEU_CAU} tín nhưng hiện là ${tongCauTruc}`
        );
    }


    // --------------------------------------------------
    // PHẢI CÓ ÍT NHẤT 10 TÍN THAY THẾ ĐỒ ÁN
    // --------------------------------------------------

    const tongTinChiThayThe =
        danhSachThayTheDoAn.reduce(
            (sum, code) => {

                const hp =
                    layThongTinHocPhan(
                        code
                    );

                return (
                    sum +
                    Number(
                        hp.soTinChi
                    )
                );
            },
            0
        );


    if (
        tongTinChiThayThe <
        SO_TIN_CHI_KHOI_TOT_NGHIEP
    ) {

        throw new Error(
            "Tổng tín chỉ học phần thay thế không đủ 10 tín."
        );
    }


    console.log(
        `Nguồn môn thay thế = ${tongTinChiThayThe} tín`
    );
}


// ======================================================
// MAIN
// ======================================================

async function taoChuongTrinh() {

    try {

        await connect();

        console.log(
            "Đã kết nối MongoDB"
        );


        // ==================================================
        // 1. KIỂM TRA CẤU HÌNH
        // ==================================================

        kiemTraCauHinh();


        // ==================================================
        // 2. XÓA CÁC MÔN KHÔNG CÒN DÙNG
        // ==================================================

        await HocPhan.deleteMany({

            maHocPhan: {
                $in: [

                    // GE4 trùng, không giữ
                    "0000704",

                    // Toán rời rạc đã quyết định bỏ
                    "0221332"
                ]
            }
        });


        // ==================================================
        // 3. TẠO / CẬP NHẬT HỌC PHẦN
        // ==================================================

        for (
            const hp
            of danhSachHocPhan
        ) {

            await HocPhan.updateOne(

                {
                    maHocPhan:
                        hp.maHocPhan
                },

                {
                    $set: {

                        tenHocPhan:
                            hp.tenHocPhan,

                        soTinChi:
                            hp.soTinChi
                    }
                },

                {
                    upsert: true
                }
            );
        }


        console.log(
            `Đã cập nhật ${danhSachHocPhan.length} học phần`
        );


        // ==================================================
        // 4. TẠO / CẬP NHẬT CTĐT
        // ==================================================

        const chuongTrinh =
            await ChuongTrinhDaoTao
                .findOneAndUpdate(

                    {
                        maChuongTrinh:
                            MA_CHUONG_TRINH
                    },

                    {
                        $set: {

                            tenChuongTrinh:
                                TEN_CHUONG_TRINH,

                            tongTinChiYeuCau:
                                TONG_TIN_CHI_YEU_CAU
                        }
                    },

                    {
                        upsert: true,
                        new: true,
                        setDefaultsOnInsert: true
                    }
                );


        if (!chuongTrinh) {

            throw new Error(
                "Không tạo được chương trình đào tạo."
            );
        }


        // ==================================================
        // 5. NHÓM TỰ CHỌN
        // ==================================================

        const nhomTuChon =
            await NhomTuChon
                .findOneAndUpdate(

                    {
                        maNhom:
                            "TC_CNTT_01"
                    },

                    {
                        $set: {

                            tenNhom:
                                "Nhóm tự chọn CNTT - chọn 3 trong 6",

                            soMonCanDat:
                                SO_MON_TU_CHON_CAN_DAT
                        }
                    },

                    {
                        upsert: true,
                        new: true,
                        setDefaultsOnInsert: true
                    }
                );


        if (!nhomTuChon) {

            throw new Error(
                "Không tạo được nhóm tự chọn."
            );
        }


        // ==================================================
        // 6. LẤY HỌC PHẦN TỪ DATABASE
        // ==================================================

        const hocPhanTrongDB =
            await HocPhan.find({

                maHocPhan: {

                    $in:
                        danhSachHocPhan.map(
                            item =>
                                item.maHocPhan
                        )
                }
            });


        const hocPhanMap =
            new Map();


        for (
            const hp
            of hocPhanTrongDB
        ) {

            hocPhanMap.set(
                hp.maHocPhan,
                hp
            );
        }


        // ==================================================
        // 7. XÓA QUAN HỆ CTĐT CŨ
        // ==================================================

        await HocPhanTrongCTDT
            .deleteMany({

                chuongTrinhDaoTao:
                    chuongTrinh._id
            });


        // ==================================================
        // 8. TẠO LẠI HỌC PHẦN TRONG CTĐT
        // ==================================================

        let soBatBuoc = 0;

        let soTuChon = 0;

        let soDoAn = 0;

        let soThayThe = 0;


        for (
            const item
            of danhSachHocPhan
        ) {

            const hp =
                hocPhanMap.get(
                    item.maHocPhan
                );


            if (!hp) {

                throw new Error(
                    `Không tìm thấy ${item.maHocPhan} trong database`
                );
            }


            const loaiHocPhan =
                xacDinhLoaiHocPhan(
                    item.maHocPhan
                );


            // ----------------------------------------------
            // TIÊN QUYẾT
            // ----------------------------------------------

            let hocPhanTienQuyet =
                null;


            const maTienQuyet =
                danhSachTienQuyet[
                    item.maHocPhan
                ];


            if (maTienQuyet) {

                const tienQuyet =
                    hocPhanMap.get(
                        maTienQuyet
                    );


                if (!tienQuyet) {

                    throw new Error(
                        `Không tìm thấy môn tiên quyết ${maTienQuyet}`
                    );
                }


                hocPhanTienQuyet =
                    tienQuyet._id;
            }


            // ----------------------------------------------
            // TẠO QUAN HỆ
            // ----------------------------------------------

            await HocPhanTrongCTDT.create({

                chuongTrinhDaoTao:
                    chuongTrinh._id,

                hocPhan:
                    hp._id,

                loaiHocPhan,

                hocPhanTienQuyet,

                nhomTuChon:
                    loaiHocPhan ===
                    "TU_CHON"
                        ? nhomTuChon._id
                        : null
            });


            // ----------------------------------------------
            // ĐẾM
            // ----------------------------------------------

            if (
                loaiHocPhan ===
                "BAT_BUOC"
            ) {

                soBatBuoc++;

            } else if (
                loaiHocPhan ===
                "TU_CHON"
            ) {

                soTuChon++;

            } else if (
                loaiHocPhan ===
                "DO_AN_TOT_NGHIEP"
            ) {

                soDoAn++;

            } else if (
                loaiHocPhan ===
                "THAY_THE_DO_AN"
            ) {

                soThayThe++;
            }
        }


        // ==================================================
        // 9. GÁN CTĐT CHO SV001 -> SV150
        // ==================================================

        const danhSachMaSinhVien =
            [];


        for (
            let i = 1;
            i <= 150;
            i++
        ) {

            danhSachMaSinhVien.push(

                `SV${String(i).padStart(
                    3,
                    "0"
                )}`
            );
        }


        const ketQuaGan =
            await SinhVien.updateMany(

                {
                    maSinhVien: {

                        $in:
                            danhSachMaSinhVien
                    }
                },

                {
                    $set: {

                        chuongTrinhDaoTao:
                            chuongTrinh._id
                    }
                }
            );


        // ==================================================
        // 10. KẾT QUẢ
        // ==================================================

        console.log("");

        console.log(
            "=============================================="
        );

        console.log(
            "TẠO CHƯƠNG TRÌNH ĐÀO TẠO THÀNH CÔNG"
        );

        console.log(
            "=============================================="
        );

        console.log(
            `CTĐT: ${TEN_CHUONG_TRINH}`
        );

        console.log(
            `Tổng yêu cầu: ${TONG_TIN_CHI_YEU_CAU} tín`
        );

        console.log("");

        console.log(
            `BAT_BUOC: ${soBatBuoc} môn / 124 tín`
        );

        console.log(
            `TU_CHON: ${soTuChon} môn / chọn 3 = 6 tín`
        );

        console.log(
            `DO_AN_TOT_NGHIEP: ${soDoAn} môn / 10 tín`
        );

        console.log(
            `THAY_THE_DO_AN: ${soThayThe} môn`
        );

        console.log("");

        console.log(
            `Tìm thấy ${ketQuaGan.matchedCount} sinh viên`
        );

        console.log(
            `Có ${ketQuaGan.modifiedCount} sinh viên cần cập nhật CTĐT`
        );

        console.log(
            "=============================================="
        );


    } catch (error) {

        console.error("");

        console.error(
            "LỖI TẠO CHƯƠNG TRÌNH:"
        );

        console.error(
            error
        );

    } finally {

        await mongoose.disconnect();

        console.log(
            "Đã đóng kết nối MongoDB"
        );
    }
}


// ======================================================
// CHẠY
// ======================================================

taoChuongTrinh();