const express = require("express");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const path = require("path");

const connect = require("./connect.js");


// ======================================================
// MODELS
// ======================================================

const TaiKhoan =
    require("./model/taikhoan.js");

const SinhVien =
    require("./model/sinhvien.js");

const PhanCongGVCN =
    require("./model/phanconggvcn.js");

const HocPhanTrongCTDT =
    require("./model/hocphantrongctdt.js");

const KetQuaHocTap =
    require("./model/ketquahoctap.js");


// ======================================================
// ĐĂNG KÝ MODEL DÙNG CHO POPULATE
// ======================================================

require("./model/chuongtrinhdaotao.js");
require("./model/hocphan.js");
require("./model/nhomtuchon.js");


// ======================================================
// SERVICES
// ======================================================

const progressService =
    require("./service/progressService.js");

const warningService =
    require("./service/warningService.js");


// ======================================================
// APP
// ======================================================

const app = express();

const PORT =
    process.env.PORT || 3000;


// ======================================================
// VIEW ENGINE
// ======================================================

app.set(
    "view engine",
    "ejs"
);

app.set(
    "views",
    path.join(
        __dirname,
        "view"
    )
);


// ======================================================
// STATIC FILE
// ======================================================

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);


// ======================================================
// BODY PARSER
// ======================================================

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    express.json()
);


// ======================================================
// SESSION
// ======================================================

app.use(

    session({

        name:
            "dak.sid",

        secret:
    process.env.SESSION_SECRET ||
    require("crypto").randomBytes(32).toString("hex"),

        resave:
            false,

        saveUninitialized:
            false,

        store:
            MongoStore.create({

                mongoUrl:
                    "mongodb://127.0.0.1:27017/HTSV"
            }),

        cookie: {

            maxAge:
                8 * 60 * 60 * 1000,

            httpOnly:
                true,

            sameSite:
                "lax",

            secure:
                process.env.NODE_ENV ===
                "production"
        }
    })
);


// ======================================================
// SESSION HELPER
// ======================================================

function regenerateSession(req) {

    return new Promise(
        (resolve, reject) => {

            req.session.regenerate(
                error => {

                    if (error) {

                        reject(error);

                    } else {

                        resolve();
                    }
                }
            );
        }
    );
}


function saveSession(req) {

    return new Promise(
        (resolve, reject) => {

            req.session.save(
                error => {

                    if (error) {

                        reject(error);

                    } else {

                        resolve();
                    }
                }
            );
        }
    );
}


// ======================================================
// MIDDLEWARE KIỂM TRA ĐĂNG NHẬP
// ======================================================

function requireLogin(
    req,
    res,
    next
) {

    if (
        !req.session ||
        !req.session.userId
    ) {

        return res.redirect(
            "/login"
        );
    }

    next();
}


// ======================================================
// MIDDLEWARE KIỂM TRA VAI TRÒ
// ======================================================

function requireRole(role) {

    return function (
        req,
        res,
        next
    ) {

        if (
            !req.session ||
            !req.session.userId
        ) {

            return res.redirect(
                "/login"
            );
        }


        if (
            req.session.vaiTro !==
            role
        ) {

            return res
                .status(403)
                .send(
                    "Bạn không có quyền truy cập chức năng này."
                );
        }


        next();
    };
}


// ======================================================
// CHUYỂN TRANG THEO VAI TRÒ
// ======================================================

function redirectTheoVaiTro(
    req,
    res
) {

    if (
        req.session.vaiTro ===
        "SINH_VIEN"
    ) {

        return res.redirect(
            "/sinhvien"
        );
    }


    if (
        req.session.vaiTro ===
        "GVCN"
    ) {

        return res.redirect(
            "/giangvien"
        );
    }


    return res.redirect(
        "/login"
    );
}


// ======================================================
// SUMMARY CẢNH BÁO RỖNG
// ======================================================

function emptyWarningSummary() {

    return {

        total:
            0,

        requiredNotStudied:
            0,

        requiredNotPassed:
            0,

        prerequisiteNotMet:
            0
    };
}


// ======================================================
// LẤY TIẾN ĐỘ CỦA SINH VIÊN
// ======================================================

async function getStudentProgress(
    sinhVien
) {

    // ==================================================
    // KHÔNG CÓ SINH VIÊN
    // ==================================================

    if (!sinhVien) {

        return {

            progress: {

                dataStatus:
                    "CHUA_DU_DU_LIEU",

                message:
                    "Không tìm thấy dữ liệu sinh viên."
            },

            warnings:
                [],

            warningSummary:
                emptyWarningSummary(),

            results:
                []
        };
    }


    // ==================================================
    // CHƯA GÁN CTĐT
    // ==================================================

    if (
        !sinhVien.chuongTrinhDaoTao
    ) {

        return {

            progress: {

                dataStatus:
                    "CHUA_DU_DU_LIEU",

                message:
                    "Sinh viên chưa được gán chương trình đào tạo.",

                completedCredits:
                    0,

                requiredCredits:
                    0,

                completionRate:
                    0,

                courseProgress:
                    [],

                missingRequiredCourses:
                    []
            },

            warnings:
                [],

            warningSummary:
                emptyWarningSummary(),

            results:
                []
        };
    }


    // ==================================================
    // ID CTĐT
    // ==================================================

    const chuongTrinhId =
        sinhVien
            .chuongTrinhDaoTao
            ._id ||
        sinhVien
            .chuongTrinhDaoTao;


    // ==================================================
    // LẤY CTĐT
    // ==================================================

    const curriculumCourses =
        await HocPhanTrongCTDT
            .find({

                chuongTrinhDaoTao:
                    chuongTrinhId
            })

            .populate(
                "hocPhan"
            )

            .populate(
                "hocPhanTienQuyet"
            )

            .populate(
                "nhomTuChon"
            );


    // ==================================================
    // LẤY KẾT QUẢ HỌC TẬP
    // ==================================================

    const results =
        await KetQuaHocTap
            .find({

                sinhVien:
                    sinhVien._id
            })

            .populate(
                "hocPhan"
            )

            .sort({

                namHoc:
                    1,

                hocKy:
                    1,

                lanHoc:
                    1
            });


    // ==================================================
    // TÍNH TIẾN ĐỘ
    // ==================================================

    const progress =
        progressService
            .calculateStudentProgress({

                sinhVien,

                chuongTrinhDaoTao:
                    sinhVien
                        .chuongTrinhDaoTao,

                curriculumCourses,

                results
            });


    // ==================================================
    // CẢNH BÁO
    // ==================================================

    let warnings =
        [];


    let warningSummary =
        emptyWarningSummary();


    if (
        progress &&
        progress.dataStatus ===
        "VALID"
    ) {

        warnings =
            warningService
                .buildWarnings(
                    progress.courseProgress ||
                    []
                );


        warningSummary =
            warningService
                .summarizeWarnings(
                    warnings
                );
    }


    return {

        progress,

        warnings,

        warningSummary,

        results
    };
}


// ======================================================
// ROUTE TRANG GỐC
// ======================================================

app.get(
    "/",

    (req, res) => {

        if (
            !req.session ||
            !req.session.userId
        ) {

            return res.redirect(
                "/login"
            );
        }


        return redirectTheoVaiTro(
            req,
            res
        );
    }
);


// ======================================================
// LOGIN - GET
// ======================================================

app.get(
    "/login",

    (req, res) => {

        if (
            req.session &&
            req.session.userId
        ) {

            return redirectTheoVaiTro(
                req,
                res
            );
        }


        return res.render(
            "login",

            {
                error:
                    null
            }
        );
    }
);


// ======================================================
// LOGIN - POST
// ======================================================

app.post(
    "/login",

    async (
        req,
        res,
        next
    ) => {

        try {

            // ==============================================
            // 1. LẤY INPUT
            // ==============================================

            const tenDangNhap =
                String(
                    req.body.tenDangNhap ||
                    ""
                )
                    .trim();


            const matKhau =
                String(
                    req.body.matKhau ||
                    ""
                );


            // ==============================================
            // 2. KIỂM TRA RỖNG
            // ==============================================

            if (
                !tenDangNhap ||
                !matKhau
            ) {

                return res.render(
                    "login",

                    {
                        error:
                            "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu."
                    }
                );
            }


            // ==============================================
            // 3. TÌM TÀI KHOẢN
            // ==============================================

            const taiKhoan =
                await TaiKhoan
                    .findOne({

                        tenDangNhap
                    });


            if (!taiKhoan) {

                return res.render(
                    "login",

                    {
                        error:
                            "Tên đăng nhập hoặc mật khẩu không đúng."
                    }
                );
            }


            // ==============================================
            // 4. KIỂM TRA TÀI KHOẢN HOẠT ĐỘNG
            // ==============================================

            if (
                !taiKhoan.trangThai
            ) {

                return res.render(
                    "login",

                    {
                        error:
                            "Tài khoản đã bị khóa."
                    }
                );
            }


            // ==============================================
            // 5. KIỂM TRA ROLE
            // ==============================================

            if (
                taiKhoan.vaiTro !==
                    "SINH_VIEN" &&
                taiKhoan.vaiTro !==
                    "GVCN"
            ) {

                return res.render(
                    "login",

                    {
                        error:
                            "Vai trò tài khoản không hợp lệ."
                    }
                );
            }


            // ==============================================
            // 6. SO SÁNH MẬT KHẨU
            // ==============================================

            const passwordDung =
                await bcrypt.compare(

                    matKhau,

                    taiKhoan
                        .passwordHash
                );


            if (!passwordDung) {

                return res.render(
                    "login",

                    {
                        error:
                            "Tên đăng nhập hoặc mật khẩu không đúng."
                    }
                );
            }


            // ==============================================
            // 7. TẠO SESSION MỚI
            // ==============================================

            await regenerateSession(
                req
            );


            req.session.userId =
                taiKhoan
                    ._id
                    .toString();


            req.session.vaiTro =
                taiKhoan.vaiTro;


            await saveSession(
                req
            );


            // ==============================================
            // 8. CHUYỂN TRANG
            // ==============================================

            return redirectTheoVaiTro(
                req,
                res
            );


        } catch (error) {

            next(error);
        }
    }
);


// ======================================================
// LOGOUT - GET
// ======================================================

app.get(
    "/logout",

    requireLogin,

    (req, res, next) => {

        req.session.destroy(
            error => {

                if (error) {

                    return next(
                        error
                    );
                }


                res.clearCookie(
                    "dak.sid"
                );


                return res.redirect(
                    "/login"
                );
            }
        );
    }
);


// ======================================================
// LOGOUT - POST
// ======================================================

app.post(
    "/logout",

    requireLogin,

    (req, res, next) => {

        req.session.destroy(
            error => {

                if (error) {

                    return next(
                        error
                    );
                }


                res.clearCookie(
                    "dak.sid"
                );


                return res.redirect(
                    "/login"
                );
            }
        );
    }
);


// ======================================================
// ======================================================
// SINH VIÊN
// ======================================================
// ======================================================


// ======================================================
// TRANG CHỦ SINH VIÊN
// ======================================================

app.get(
    "/sinhvien",

    requireRole(
        "SINH_VIEN"
    ),

    async (
        req,
        res,
        next
    ) => {

        try {

            // ==============================================
            // 1. TÌM SINH VIÊN THEO TÀI KHOẢN
            // ==============================================

            const sinhVien =
                await SinhVien
                    .findOne({

                        taiKhoan:
                            req.session
                                .userId
                    })

                    .populate(
                        "chuongTrinhDaoTao"
                    );


            if (!sinhVien) {

                return res
                    .status(404)
                    .send(
                        "Không tìm thấy hồ sơ sinh viên của tài khoản này."
                    );
            }


            // ==============================================
            // 2. TÍNH TIẾN ĐỘ
            // ==============================================

            const {

                progress,

                warnings,

                warningSummary,

                results

            } =
                await getStudentProgress(
                    sinhVien
                );


            // ==============================================
            // 3. RENDER
            // ==============================================

            return res.render(
                "sinhvien/trangchu",

                {

                    sinhVien,

                    progress,

                    warnings,

                    warningSummary,

                    results
                }
            );


        } catch (error) {

            next(error);
        }
    }
);


// ======================================================
// ROUTE TIẾN ĐỘ SINH VIÊN
// ======================================================

app.get(
    "/sinhvien/tiendo",

    requireRole(
        "SINH_VIEN"
    ),

    (req, res) => {

        return res.redirect(
            "/sinhvien"
        );
    }
);


// ======================================================
// ======================================================
// GIÁO VIÊN CHỦ NHIỆM
// ======================================================
// ======================================================


// ======================================================
// TRANG CHỦ GVCN
// ======================================================
// ======================================================
// TRANG CHỦ GVCN
// ======================================================

app.get(
    "/giangvien",

    requireRole("GVCN"),

    async (req, res, next) => {

        try {

            // ==============================================
            // 1. TÀI KHOẢN GVCN
            // ==============================================

            const giaoVien =
                await TaiKhoan
                    .findById(
                        req.session.userId
                    )
                    .lean();


            if (!giaoVien) {

                return res
                    .status(404)
                    .send(
                        "Không tìm thấy tài khoản giáo viên."
                    );
            }


            // ==============================================
            // 2. CÁC LỚP ĐANG ĐƯỢC PHÂN CÔNG
            // ==============================================

            const phanCongTrongDB =
                await PhanCongGVCN
                    .find({

                        gvcn:
                            req.session.userId,

                        trangThai:
                            true
                    })

                    .sort({

                        maLop:
                            1,

                        namHoc:
                            -1
                    })

                    .lean();


            // ==============================================
            // 3. LOẠI TRÙNG LỚP
            // Nếu có nhiều phân công cùng lớp,
            // giữ bản ghi mới nhất.
            // ==============================================

            const phanCongTheoLop =
                new Map();


            for (
                const phanCong
                of phanCongTrongDB
            ) {

                if (
                    !phanCongTheoLop.has(
                        phanCong.maLop
                    )
                ) {

                    phanCongTheoLop.set(
                        phanCong.maLop,
                        phanCong
                    );
                }
            }


            const danhSachPhanCongGoc =
                [
                    ...phanCongTheoLop.values()
                ];


            // ==============================================
            // 4. ĐẾM SINH VIÊN TỪNG LỚP
            // ==============================================

            const danhSachPhanCong =
                await Promise.all(

                    danhSachPhanCongGoc.map(
                        async phanCong => {

                            const soSinhVien =
                                await SinhVien
                                    .countDocuments({

                                        maLop:
                                            phanCong.maLop
                                    });


                            return {

                                ...phanCong,

                                soSinhVien
                            };
                        }
                    )
                );


            // ==============================================
            // 5. TỔNG SINH VIÊN
            // ==============================================

            const tongSinhVien =
                danhSachPhanCong.reduce(

                    (
                        tong,
                        phanCong
                    ) =>

                        tong +
                        phanCong.soSinhVien,

                    0
                );


            // ==============================================
            // 6. RENDER
            // ==============================================

            return res.render(
                "giangvien/trangchu",

                {

                    giaoVien,

                    danhSachPhanCong,

                    tongLop:
                        danhSachPhanCong.length,

                    tongSinhVien
                }
            );


        } catch (error) {

            next(error);
        }
    }
);
// ======================================================
// DANH SÁCH SINH VIÊN CỦA GVCN
// + LỌC THEO TÌNH TRẠNG
// ======================================================

app.get(
    "/giangvien/sinhvien",

    requireRole("GVCN"),

    async (req, res, next) => {

        try {

            // ==============================================
            // 1. LẤY CÁC LỚP ĐƯỢC PHÂN CÔNG
            // ==============================================

            const danhSachPhanCong =
                await PhanCongGVCN
                    .find({
                        gvcn: req.session.userId,
                        trangThai: true
                    })
                    .sort({
                        maLop: 1
                    });


            const danhSachLop = [
                ...new Set(
                    danhSachPhanCong.map(
                        item => item.maLop
                    )
                )
            ].sort();


            if (danhSachLop.length === 0) {

                return res.render(
                    "giangvien/danhsachsinhvien",
                    {
                        danhSachTheoDoi: [],
                        danhSachLop: [],
                        maLopDangChon: null,

                        thongKe: {
                            tatCa: 0,
                            coCanhBao: 0,
                            coMonChuaDat: 0,
                            datHienTai: 0
                        }
                    }
                );
            }


            // ==============================================
            // 2. XÁC ĐỊNH LỚP ĐANG CHỌN
            // ==============================================

            let maLopDangChon =
                req.query.maLop
                    ? String(
                        req.query.maLop
                    ).trim()
                    : null;


            if (
                danhSachLop.length === 1
            ) {

                maLopDangChon =
                    danhSachLop[0];
            }


            // Nếu chưa chọn lớp
            if (!maLopDangChon) {

                return res.render(
                    "giangvien/danhsachsinhvien",
                    {
                        danhSachTheoDoi: [],
                        danhSachLop,
                        maLopDangChon: null,

                        thongKe: {
                            tatCa: 0,
                            coCanhBao: 0,
                            coMonChuaDat: 0,
                            datHienTai: 0
                        }
                    }
                );
            }


            // ==============================================
            // 3. KIỂM TRA QUYỀN XEM LỚP
            // ==============================================

            if (
                !danhSachLop.includes(
                    maLopDangChon
                )
            ) {

                return res
                    .status(403)
                    .send(
                        "Bạn không được phân công phụ trách lớp này."
                    );
            }


            // ==============================================
            // 4. LẤY SINH VIÊN TRONG LỚP
            // ==============================================

            const danhSachSinhVien =
                await SinhVien
                    .find({
                        maLop: maLopDangChon
                    })
                    .populate(
                        "chuongTrinhDaoTao"
                    )
                    .sort({
                        maSinhVien: 1
                    });


            // ==============================================
            // 5. TÍNH TÌNH TRẠNG TỪNG SINH VIÊN
            // ==============================================

            const danhSachTheoDoi =
                await Promise.all(

                    danhSachSinhVien.map(
                        async sinhVien => {

                            const {
                                progress,
                                warnings,
                                warningSummary
                            } =
                                await getStudentProgress(
                                    sinhVien
                                );


                            const hopLe =
                                progress &&
                                progress.dataStatus ===
                                    "VALID";


                            const courseProgress =
                                hopLe
                                    ? (
                                        progress.courseProgress ||
                                        []
                                    )
                                    : [];


                            const danhSachChuaDat =
                                courseProgress.filter(
                                    item =>
                                        item.status ===
                                        "CHUA_DAT"
                                );


                            const soCanhBao =
                                Array.isArray(warnings)
                                    ? warnings.length
                                    : 0;


                            const coCanhBao =
                                soCanhBao > 0;


                            const coMonChuaDat =
                                danhSachChuaDat.length >
                                0;


                            /*
                                "Đạt hiện tại" KHÔNG có nghĩa
                                đủ điều kiện tốt nghiệp.

                                Chỉ dùng để lọc những SV
                                hiện không có cảnh báo và
                                không có môn CHUA_DAT.
                            */

                            const datHienTai =
                                hopLe &&
                                !coCanhBao &&
                                !coMonChuaDat;


                            return {

                                id:
                                    sinhVien._id
                                        .toString(),

                                maSinhVien:
                                    sinhVien.maSinhVien,

                                hoTen:
                                    sinhVien.hoTen,

                                maLop:
                                    sinhVien.maLop,

                                dataStatus:
                                    progress
                                        ? progress.dataStatus
                                        : "CHUA_DU_DU_LIEU",

                                completedCredits:
                                    hopLe
                                        ? progress.completedCredits
                                        : 0,

                                requiredCredits:
                                    hopLe
                                        ? progress.requiredCredits
                                        : 140,

                                completionRate:
                                    hopLe
                                        ? progress.completionRate
                                        : 0,

                                soMonChuaDat:
                                    danhSachChuaDat.length,

                                soCanhBao,

                                coCanhBao,

                                coMonChuaDat,

                                datHienTai,

                                warningSummary:
                                    warningSummary ||
                                    emptyWarningSummary()
                            };
                        }
                    )
                );


            // ==============================================
            // 6. THỐNG KÊ CHO CÁC THANH LỌC
            // ==============================================

            const thongKe = {

                tatCa:
                    danhSachTheoDoi.length,

                coCanhBao:
                    danhSachTheoDoi.filter(
                        item =>
                            item.coCanhBao
                    ).length,

                coMonChuaDat:
                    danhSachTheoDoi.filter(
                        item =>
                            item.coMonChuaDat
                    ).length,

                datHienTai:
                    danhSachTheoDoi.filter(
                        item =>
                            item.datHienTai
                    ).length
            };


            // ==============================================
            // 7. RENDER
            // ==============================================

            return res.render(
                "giangvien/danhsachsinhvien",

                {
                    danhSachTheoDoi,
                    danhSachLop,
                    maLopDangChon,
                    thongKe
                }
            );


        } catch (error) {

            next(error);
        }
    }
);




// ======================================================
// CHI TIẾT SINH VIÊN
// ======================================================

app.get(
    "/giangvien/sinhvien/:id",

    requireRole(
        "GVCN"
    ),

    async (
        req,
        res,
        next
    ) => {

        try {

            // ==============================================
            // 1. KIỂM TRA ID
            // ==============================================

            if (
                !mongoose.isValidObjectId(
                    req.params.id
                )
            ) {

                return res
                    .status(404)
                    .send(
                        "Sinh viên không tồn tại."
                    );
            }


            // ==============================================
            // 2. TÌM SINH VIÊN
            // ==============================================

            const sinhVien =
                await SinhVien
                    .findById(
                        req.params.id
                    )

                    .populate(
                        "chuongTrinhDaoTao"
                    );


            if (!sinhVien) {

                return res
                    .status(404)
                    .send(
                        "Không tìm thấy sinh viên."
                    );
            }


            // ==============================================
            // 3. KIỂM TRA PHÂN CÔNG GVCN
            // ==============================================

            const phanCong =
                await PhanCongGVCN
                    .findOne({

                        gvcn:
                            req.session
                                .userId,

                        maLop:
                            sinhVien.maLop,

                        trangThai:
                            true
                    });


            if (!phanCong) {

                return res
                    .status(403)
                    .send(
                        "Bạn không có quyền xem sinh viên này."
                    );
            }


            // ==============================================
            // 4. TÍNH TIẾN ĐỘ
            // ==============================================

            const {

                progress,

                warnings,

                warningSummary,

                results

            } =
                await getStudentProgress(
                    sinhVien
                );


            // ==============================================
            // 5. RENDER
            // ==============================================

            return res.render(
                "giangvien/chitietsinhvien",

                {

                    sinhVien,

                    progress,

                    warnings,

                    warningSummary,

                    results,

                    phanCong
                }
            );


        } catch (error) {

            next(error);
        }
    }
);


// ======================================================
// 404
// ======================================================

app.use(
    (req, res) => {

        res
            .status(404)
            .send(
                "Không tìm thấy trang."
            );
    }
);


// ======================================================
// ERROR HANDLER
// ======================================================

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            ""
        );

        console.error(
            "===================================="
        );

        console.error(
            "LỖI SERVER"
        );

        console.error(
            "===================================="
        );

        console.error(
            error
        );

        console.error(
            "===================================="
        );


        if (
            res.headersSent
        ) {

            return next(
                error
            );
        }


        return res
            .status(500)
            .send(
                "Đã xảy ra lỗi trong quá trình xử lý. Kiểm tra Terminal để xem chi tiết."
            );
    }
);


// ======================================================
// KHỞI ĐỘNG SERVER
// ======================================================

async function startServer() {

    try {

        await connect();


        console.log(
            "Đã kết nối MongoDB"
        );


        app.listen(
            PORT,

            () => {

                console.log(
                    `Server đang chạy tại http://localhost:${PORT}`
                );

                console.log(
                    `Trang đăng nhập: http://localhost:${PORT}/login`
                );
            }
        );


    } catch (error) {

        console.error(
            "Không thể khởi động server:"
        );

        console.error(
            error
        );


        process.exit(
            1
        );
    }
}


// ======================================================
// CHẠY SERVER
// ======================================================

startServer();