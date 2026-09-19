// ======================================================
// HELPER ID
// ======================================================

function getId(value) {

    if (!value) {
        return null;
    }


    if (value._id) {

        return String(
            value._id
        );
    }


    return String(
        value
    );
}


// ======================================================
// TRẠNG THÁI HỌC PHẦN
// ======================================================
//
// Không có kết quả
// -> CHUA_HOC
//
// Có ít nhất một lần DAT
// -> DAT
//
// Có kết quả nhưng không DAT lần nào
// -> CHUA_DAT
//
// ======================================================

function getCourseStatus(
    results = []
) {

    if (
        !Array.isArray(results) ||
        results.length === 0
    ) {

        return "CHUA_HOC";
    }


    const coLanDat =
        results.some(

            item =>
                item.trangThai ===
                "DAT"
        );


    if (coLanDat) {

        return "DAT";
    }


    return "CHUA_DAT";
}


// ======================================================
// XÂY DỰNG TIẾN ĐỘ TỪNG MÔN
// ======================================================

function buildCourseProgress(
    curriculumCourses = [],
    results = []
) {

    const resultMap =
        new Map();


    // ==================================================
    // NHÓM KẾT QUẢ THEO HỌC PHẦN
    // ==================================================

    for (
        const result
        of results
    ) {

        const hocPhanId =
            getId(
                result.hocPhan
            );


        if (!hocPhanId) {
            continue;
        }


        if (
            !resultMap.has(
                hocPhanId
            )
        ) {

            resultMap.set(
                hocPhanId,
                []
            );
        }


        resultMap
            .get(
                hocPhanId
            )
            .push(
                result
            );
    }


    // ==================================================
    // GHÉP KẾT QUẢ VỚI CTĐT
    // ==================================================

    return curriculumCourses.map(
        item => {

            const hocPhanId =
                getId(
                    item.hocPhan
                );


            const lichSu =
                hocPhanId
                    ? (
                        resultMap.get(
                            hocPhanId
                        ) || []
                    )
                    : [];


            return {

                hocPhan:
                    item.hocPhan,

                loaiHocPhan:
                    item.loaiHocPhan,

                hocPhanTienQuyet:
                    item.hocPhanTienQuyet ||
                    null,

                nhomTuChon:
                    item.nhomTuChon ||
                    null,

                status:
                    getCourseStatus(
                        lichSu
                    ),

                soLanHoc:
                    lichSu.length,

                lichSu
            };
        }
    );
}


// ======================================================
// TÍN CHỈ DAT THỰC TẾ
// ======================================================
//
// Chỉ dùng hiển thị tham khảo.
//
// Có thể bao gồm môn thay thế dư,
// nên KHÔNG dùng trực tiếp để tính %.
//
// ======================================================

function calculateRawCompletedCredits(
    courseProgress = []
) {

    return courseProgress.reduce(
        (total, item) => {

            if (
                item.status !==
                "DAT"
            ) {

                return total;
            }


            return (
                total +
                Number(
                    item.hocPhan
                        ?.soTinChi || 0
                )
            );
        },

        0
    );
}


// ======================================================
// TỔNG TÍN CHỈ BAT_BUOC TRONG CTĐT
// ======================================================

function calculateRequiredCatalogCredits(
    courseProgress = []
) {

    return courseProgress.reduce(
        (total, item) => {

            if (
                item.loaiHocPhan !==
                "BAT_BUOC"
            ) {

                return total;
            }


            return (
                total +
                Number(
                    item.hocPhan
                        ?.soTinChi || 0
                )
            );
        },

        0
    );
}


// ======================================================
// TÍN CHỈ BAT_BUOC SINH VIÊN ĐÃ ĐẠT
// ======================================================

function calculateRequiredCompletedCredits(
    courseProgress = []
) {

    return courseProgress.reduce(
        (total, item) => {

            if (
                item.loaiHocPhan !==
                "BAT_BUOC"
            ) {

                return total;
            }


            if (
                item.status !==
                "DAT"
            ) {

                return total;
            }


            return (
                total +
                Number(
                    item.hocPhan
                        ?.soTinChi || 0
                )
            );
        },

        0
    );
}


// ======================================================
// NHÓM TỰ CHỌN
// ======================================================

function calculateElectiveProgress(
    courseProgress = []
) {

    const electiveCourses =
        courseProgress.filter(

            item =>
                item.loaiHocPhan ===
                "TU_CHON"
        );


    // ==================================================
    // KHÔNG CÓ TỰ CHỌN
    // ==================================================

    if (
        electiveCourses.length ===
        0
    ) {

        return {

            totalCourseCount:
                0,

            requiredCourseCount:
                0,

            requiredCredits:
                0,

            passedCourseCount:
                0,

            countedCredits:
                0,

            actualPassedCredits:
                0,

            completed:
                true,

            passedCourses:
                []
        };
    }


    // ==================================================
    // SỐ MÔN CẦN ĐẠT
    // ==================================================

    let requiredCourseCount =
        3;


    const itemCoNhom =
        electiveCourses.find(

            item =>
                item.nhomTuChon &&
                Number(
                    item.nhomTuChon
                        .soMonCanDat
                ) > 0
        );


    if (itemCoNhom) {

        requiredCourseCount =
            Number(
                itemCoNhom
                    .nhomTuChon
                    .soMonCanDat
            );
    }


    // ==================================================
    // TẤT CẢ MÔN TỰ CHỌN HIỆN TẠI PHẢI CÙNG SỐ TC
    // ==================================================

    const creditValues =
        [
            ...new Set(

                electiveCourses.map(
                    item =>
                        Number(
                            item.hocPhan
                                ?.soTinChi || 0
                        )
                )
            )
        ];


    let requiredCredits =
        0;


    if (
        creditValues.length === 1
    ) {

        requiredCredits =

            requiredCourseCount *

            creditValues[0];
    }


    // ==================================================
    // MÔN ĐÃ ĐẠT
    // ==================================================

    const passedCourses =
        electiveCourses.filter(

            item =>
                item.status ===
                "DAT"
        );


    const actualPassedCredits =
        passedCourses.reduce(
            (total, item) => {

                return (
                    total +
                    Number(
                        item.hocPhan
                            ?.soTinChi || 0
                    )
                );
            },

            0
        );


    // ==================================================
    // CHỈ TÍNH ĐÚNG SỐ MÔN CẦN
    // ==================================================

    const countedCourses =
        passedCourses.slice(
            0,
            requiredCourseCount
        );


    const countedCredits =
        countedCourses.reduce(
            (total, item) => {

                return (
                    total +
                    Number(
                        item.hocPhan
                            ?.soTinChi || 0
                    )
                );
            },

            0
        );


    return {

        totalCourseCount:
            electiveCourses.length,

        requiredCourseCount,

        requiredCredits,

        passedCourseCount:
            passedCourses.length,

        countedCredits,

        actualPassedCredits,

        completed:
            passedCourses.length >=
            requiredCourseCount,

        passedCourses
    };
}


// ======================================================
// ĐỒ ÁN / THAY THẾ
// ======================================================

function calculateFinalProjectProgress(
    courseProgress = []
) {

    const doAnCourse =
        courseProgress.find(

            item =>
                item.loaiHocPhan ===
                "DO_AN_TOT_NGHIEP"
        );


    const replacementCoursesAll =
        courseProgress.filter(

            item =>
                item.loaiHocPhan ===
                "THAY_THE_DO_AN"
        );


    let requiredCredits =
        10;


    if (
        doAnCourse &&
        Number(
            doAnCourse
                .hocPhan
                ?.soTinChi
        ) > 0
    ) {

        requiredCredits =
            Number(
                doAnCourse
                    .hocPhan
                    .soTinChi
            );
    }


    const doAnStatus =
        doAnCourse
            ? doAnCourse.status
            : "CHUA_HOC";


    const replacementCourses =
        replacementCoursesAll.filter(

            item =>
                item.status ===
                "DAT"
        );


    const replacementPassedCredits =
        replacementCourses.reduce(
            (total, item) => {

                return (
                    total +
                    Number(
                        item.hocPhan
                            ?.soTinChi || 0
                    )
                );
            },

            0
        );


    // ==================================================
    // ĐÃ ĐẠT ĐỒ ÁN
    // ==================================================

    if (
        doAnStatus ===
        "DAT"
    ) {

        return {

            completed:
                true,

            method:
                "DO_AN_TOT_NGHIEP",

            requiredCredits,

            countedCredits:
                requiredCredits,

            doAnStatus,

            replacementPassedCredits,

            replacementCourses,

            replacementCoursesAll
        };
    }


    // ==================================================
    // DÙNG MÔN THAY THẾ
    // ==================================================

    const countedCredits =
        Math.min(

            replacementPassedCredits,

            requiredCredits
        );


    const completed =
        replacementPassedCredits >=
        requiredCredits;


    return {

        completed,

        method:
            completed
                ? "THAY_THE_DO_AN"
                : null,

        requiredCredits,

        countedCredits,

        doAnStatus,

        replacementPassedCredits,

        replacementCourses,

        replacementCoursesAll
    };
}


// ======================================================
// BAT_BUOC CÒN THIẾU
// ======================================================

function getMissingRequiredCourses(
    courseProgress = []
) {

    return courseProgress.filter(
        item => {

            if (
                item.loaiHocPhan !==
                "BAT_BUOC"
            ) {

                return false;
            }


            return (

                item.status ===
                    "CHUA_HOC" ||

                item.status ===
                    "CHUA_DAT"
            );
        }
    );
}


// ======================================================
// KIỂM TRA TIÊN QUYẾT CÓ THAM CHIẾU ĐÚNG KHÔNG
// ======================================================
//
// Chỉ kiểm tra cấu hình CTĐT.
//
// Không kiểm tra sinh viên đã đạt tiên quyết chưa.
// Việc đó thuộc warningService.
//
// ======================================================

function validatePrerequisites(
    courseProgress = []
) {

    const courseMap =
        new Map();


    for (
        const item
        of courseProgress
    ) {

        const id =
            getId(
                item.hocPhan
            );


        if (id) {

            courseMap.set(
                id,
                item
            );
        }
    }


    for (
        const item
        of courseProgress
    ) {

        if (
            !item.hocPhanTienQuyet
        ) {

            continue;
        }


        const tienQuyetId =
            getId(
                item.hocPhanTienQuyet
            );


        if (
            !tienQuyetId ||
            !courseMap.has(
                tienQuyetId
            )
        ) {

            return {

                valid:
                    false,

                message:
                    `Học phần ${
                        item.hocPhan
                            ?.maHocPhan ||
                        "không xác định"
                    } tham chiếu học phần tiên quyết không tồn tại trong CTĐT.`
            };
        }
    }


    return {

        valid:
            true,

        message:
            null
    };
}


// ======================================================
// KIỂM TRA CẤU TRÚC TỔNG TÍN CHỈ
// ======================================================
//
// Phải thỏa:
//
// BAT_BUOC
// + TU_CHON được yêu cầu
// + ĐỒ ÁN / THAY THẾ
// = tongTinChiYeuCau
//
// ======================================================

function validateCurriculumStructure(
    courseProgress = [],
    requiredCredits = 0
) {

    const requiredCatalogCredits =
        calculateRequiredCatalogCredits(
            courseProgress
        );


    const electiveProgress =
        calculateElectiveProgress(
            courseProgress
        );


    if (
        electiveProgress
            .totalCourseCount > 0 &&
        electiveProgress
            .requiredCredits <= 0
    ) {

        return {

            valid:
                false,

            message:
                "Không xác định được số tín chỉ yêu cầu của nhóm tự chọn."
        };
    }


    const doAnCourse =
        courseProgress.find(

            item =>
                item.loaiHocPhan ===
                "DO_AN_TOT_NGHIEP"
        );


    if (!doAnCourse) {

        return {

            valid:
                false,

            message:
                "CTĐT chưa có học phần Đồ án tốt nghiệp."
        };
    }


    const finalProjectRequiredCredits =
        Number(
            doAnCourse
                .hocPhan
                ?.soTinChi || 0
        );


    if (
        finalProjectRequiredCredits <=
        0
    ) {

        return {

            valid:
                false,

            message:
                "Số tín chỉ Đồ án tốt nghiệp không hợp lệ."
        };
    }


    // ==================================================
    // KIỂM TRA MÔN THAY THẾ CÓ ĐỦ 10 TÍN KHÔNG
    // ==================================================

    const replacementAvailableCredits =
        courseProgress
            .filter(

                item =>
                    item.loaiHocPhan ===
                    "THAY_THE_DO_AN"
            )

            .reduce(
                (total, item) => {

                    return (
                        total +
                        Number(
                            item.hocPhan
                                ?.soTinChi || 0
                        )
                    );
                },

                0
            );


    if (
        replacementAvailableCredits <
        finalProjectRequiredCredits
    ) {

        return {

            valid:
                false,

            message:
                "Các học phần thay thế đồ án không đủ số tín chỉ yêu cầu."
        };
    }


    const structureCredits =

        requiredCatalogCredits +

        electiveProgress
            .requiredCredits +

        finalProjectRequiredCredits;


    if (
        structureCredits !==
        requiredCredits
    ) {

        return {

            valid:
                false,

            message:
                `Cấu hình CTĐT không khớp: bắt buộc ${requiredCatalogCredits} + tự chọn ${electiveProgress.requiredCredits} + đồ án/thay thế ${finalProjectRequiredCredits} = ${structureCredits} tín, trong khi CTĐT yêu cầu ${requiredCredits} tín.`,

            requiredCatalogCredits,

            electiveRequiredCredits:
                electiveProgress
                    .requiredCredits,

            finalProjectRequiredCredits,

            structureCredits
        };
    }


    return {

        valid:
            true,

        requiredCatalogCredits,

        electiveRequiredCredits:
            electiveProgress
                .requiredCredits,

        finalProjectRequiredCredits,

        structureCredits,

        replacementAvailableCredits
    };
}


// ======================================================
// TỶ LỆ HOÀN THÀNH
// ======================================================

function calculateCompletionRate(
    completedCredits,
    requiredCredits
) {

    const completed =
        Number(
            completedCredits
        );


    const required =
        Number(
            requiredCredits
        );


    if (
        !Number.isFinite(required) ||
        required <= 0
    ) {

        return 0;
    }


    const rate =

        (
            completed /
            required
        ) * 100;


    return Number(

        Math.min(
            100,
            Math.max(
                0,
                rate
            )
        ).toFixed(1)
    );
}


// ======================================================
// HÀM CHÍNH
// ======================================================

function calculateStudentProgress(
    arg1,
    arg2,
    arg3
) {

    let sinhVien;

    let chuongTrinhDaoTao;

    let curriculumCourses;

    let results;


    // ==================================================
    // KIỂU GỌI MỚI
    // ==================================================

    if (
        arg1 &&
        typeof arg1 ===
            "object" &&
        Object.prototype
            .hasOwnProperty
            .call(
                arg1,
                "curriculumCourses"
            )
    ) {

        sinhVien =
            arg1.sinhVien ||
            null;


        chuongTrinhDaoTao =
            arg1.chuongTrinhDaoTao ||
            sinhVien
                ?.chuongTrinhDaoTao ||
            null;


        curriculumCourses =
            Array.isArray(
                arg1.curriculumCourses
            )
                ? arg1.curriculumCourses
                : [];


        results =
            Array.isArray(
                arg1.results
            )
                ? arg1.results
                : [];

    } else {

        // ==================================================
        // TƯƠNG THÍCH KIỂU GỌI CŨ
        // ==================================================

        sinhVien =
            arg1 ||
            null;


        chuongTrinhDaoTao =
            sinhVien
                ?.chuongTrinhDaoTao ||
            null;


        curriculumCourses =
            Array.isArray(
                arg2
            )
                ? arg2
                : [];


        results =
            Array.isArray(
                arg3
            )
                ? arg3
                : [];
    }


    // ==================================================
    // 1. CTĐT
    // ==================================================

    if (!chuongTrinhDaoTao) {

        return {

            dataStatus:
                "CHUA_DU_DU_LIEU",

            message:
                "Sinh viên chưa được gán chương trình đào tạo.",

            completedCredits:
                0,

            requiredCredits:
                0,

            rawCompletedCredits:
                0,

            completionRate:
                0,

            courseProgress:
                [],

            missingRequiredCourses:
                [],

            electiveProgress:
                null,

            finalProjectProgress:
                null
        };
    }


    // ==================================================
    // 2. TỔNG TC YÊU CẦU
    // ==================================================

    const requiredCredits =
        Number(
            chuongTrinhDaoTao
                .tongTinChiYeuCau
        );


    if (
        !Number.isFinite(
            requiredCredits
        ) ||
        requiredCredits <= 0
    ) {

        return {

            dataStatus:
                "DU_LIEU_KHONG_HOP_LE",

            message:
                "Tổng tín chỉ yêu cầu của CTĐT không hợp lệ.",

            completedCredits:
                0,

            requiredCredits:
                0,

            rawCompletedCredits:
                0,

            completionRate:
                0,

            courseProgress:
                [],

            missingRequiredCourses:
                [],

            electiveProgress:
                null,

            finalProjectProgress:
                null
        };
    }


    // ==================================================
    // 3. CTĐT CHƯA CÓ MÔN
    // ==================================================

    if (
        curriculumCourses.length ===
        0
    ) {

        return {

            dataStatus:
                "CHUA_DU_DU_LIEU",

            message:
                "Chương trình đào tạo chưa có dữ liệu học phần.",

            completedCredits:
                0,

            requiredCredits,

            rawCompletedCredits:
                0,

            completionRate:
                0,

            courseProgress:
                [],

            missingRequiredCourses:
                [],

            electiveProgress:
                null,

            finalProjectProgress:
                null
        };
    }


    // ==================================================
    // 4. TRẠNG THÁI TỪNG MÔN
    // ==================================================

    const courseProgress =
        buildCourseProgress(

            curriculumCourses,

            results
        );


    // ==================================================
    // 5. KIỂM TRA THAM CHIẾU TIÊN QUYẾT
    // ==================================================

    const prerequisiteValidation =
        validatePrerequisites(
            courseProgress
        );


    if (
        !prerequisiteValidation.valid
    ) {

        return {

            dataStatus:
                "DU_LIEU_KHONG_HOP_LE",

            message:
                prerequisiteValidation
                    .message,

            completedCredits:
                0,

            requiredCredits,

            rawCompletedCredits:
                0,

            completionRate:
                0,

            courseProgress,

            missingRequiredCourses:
                [],

            electiveProgress:
                null,

            finalProjectProgress:
                null
        };
    }


    // ==================================================
    // 6. KIỂM TRA 
    // ==================================================

    const structure =
        validateCurriculumStructure(

            courseProgress,

            requiredCredits
        );


    if (!structure.valid) {

        return {

            dataStatus:
                "DU_LIEU_KHONG_HOP_LE",

            message:
                structure.message,

            completedCredits:
                0,

            requiredCredits,

            rawCompletedCredits:
                calculateRawCompletedCredits(
                    courseProgress
                ),

            completionRate:
                0,

            courseProgress,

            missingRequiredCourses:
                [],

            electiveProgress:
                null,

            finalProjectProgress:
                null,

            structure
        };
    }


    // ==================================================
    // 7. BAT_BUOC ĐÃ ĐẠT
    // ==================================================

    const requiredCompletedCredits =
        calculateRequiredCompletedCredits(
            courseProgress
        );


    // ==================================================
    // 8. TỰ CHỌN
    // ==================================================

    const electiveProgress =
        calculateElectiveProgress(
            courseProgress
        );


    // ==================================================
    // 9. ĐỒ ÁN / THAY THẾ
    // ==================================================

    const finalProjectProgress =
        calculateFinalProjectProgress(
            courseProgress
        );


    // ==================================================
    // 10. TỔNG TIẾN ĐỘ THỰC
    // ==================================================
    //
    // KHÔNG còn Math.min(total, 124)
    // để che lỗi cấu hình.
    //
    // ==================================================

    const completedCredits =

        requiredCompletedCredits +

        electiveProgress
            .countedCredits +

        finalProjectProgress
            .countedCredits;


    // ==================================================
    // 11. BẢO VỆ
    // ==================================================

    if (
        completedCredits >
        requiredCredits
    ) {

        return {

            dataStatus:
                "DU_LIEU_KHONG_HOP_LE",

            message:
                `Tín chỉ tính tiến độ (${completedCredits}) vượt quá tổng yêu cầu (${requiredCredits}).`,

            completedCredits,

            requiredCredits,

            rawCompletedCredits:
                calculateRawCompletedCredits(
                    courseProgress
                ),

            completionRate:
                0,

            courseProgress,

            missingRequiredCourses:
                getMissingRequiredCourses(
                    courseProgress
                ),

            electiveProgress,

            finalProjectProgress,

            structure
        };
    }


    // ==================================================
    // 12. RAW CREDIT
    // ==================================================

    const rawCompletedCredits =
        calculateRawCompletedCredits(
            courseProgress
        );


    // ==================================================
    // 13. MÔN BẮT BUỘC THIẾU
    // ==================================================

    const missingRequiredCourses =
        getMissingRequiredCourses(
            courseProgress
        );


    // ==================================================
    // 14. %
    // ==================================================

    const completionRate =
        calculateCompletionRate(

            completedCredits,

            requiredCredits
        );


    // ==================================================
    // 15. RETURN
    // ==================================================

    return {

        dataStatus:
            "VALID",

        message:
            null,

        requiredCredits,

        completedCredits,

        rawCompletedCredits,

        requiredCompletedCredits,

        completionRate,

        courseProgress,

        missingRequiredCourses,

        electiveProgress,

        finalProjectProgress,

        structure
    };
}


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    getId,

    getCourseStatus,

    buildCourseProgress,

    calculateRawCompletedCredits,

    calculateRequiredCatalogCredits,

    calculateRequiredCompletedCredits,

    calculateElectiveProgress,

    calculateFinalProjectProgress,

    getMissingRequiredCourses,

    validatePrerequisites,

    validateCurriculumStructure,

    calculateCompletionRate,

    calculateStudentProgress
};