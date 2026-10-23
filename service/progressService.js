
function getId(value) {
    if (!value) {
        return null;
    }
    if (value._id) {
        return String(value._id);
    }
    return String(value);
}

function getCourseStatus(results = []) {
    if (!Array.isArray(results) || results.length === 0) {
        return "CHUA_HOC";
    }

    const coLanDat = results.some(
        item => item.trangThai === "DAT"
    );

    if (coLanDat) {
        return "DAT";
    }

    return "CHUA_DAT";
}

function buildCourseProgress(curriculumCourses = [], results = []) {
    const resultMap = new Map();

    for (const result of results) {
        const hocPhanId = getId(result.hocPhan);

        if (!hocPhanId) {
            continue;
        }

        if (!resultMap.has(hocPhanId)) {
            resultMap.set(hocPhanId, []);
        }

        resultMap.get(hocPhanId).push(result);
    }

    return curriculumCourses.map(item => {
        const hocPhanId = getId(item.hocPhan);
        const lichSu = hocPhanId
            ? (resultMap.get(hocPhanId) || [])
            : [];

        return {
            hocPhan: item.hocPhan,
            loaiHocPhan: item.loaiHocPhan,
            hocPhanTienQuyet: item.hocPhanTienQuyet || null,
            nhomTuChon: item.nhomTuChon || null,
            status: getCourseStatus(lichSu),
            soLanHoc: lichSu.length,
            lichSu
        };
    });
}

function calculateRawCompletedCredits(courseProgress = []) {
    return courseProgress.reduce((total, item) => {
        if (item.status !== "DAT") {
            return total;
        }

        return total + Number(item.hocPhan?.soTinChi || 0);
    }, 0);
}

function calculateRequiredCatalogCredits(courseProgress = []) {
    return courseProgress.reduce((total, item) => {
        if (item.loaiHocPhan !== "BAT_BUOC") {
            return total;
        }

        return total + Number(item.hocPhan?.soTinChi || 0);
    }, 0);
}

function calculateRequiredCompletedCredits(courseProgress = []) {
    return courseProgress.reduce((total, item) => {
        if (item.loaiHocPhan !== "BAT_BUOC") {
            return total;
        }

        if (item.status !== "DAT") {
            return total;
        }

        return total + Number(item.hocPhan?.soTinChi || 0);
    }, 0);
}

function calculateElectiveProgress(courseProgress = []) {
    const electiveCourses = courseProgress.filter(
        item => item.loaiHocPhan === "TU_CHON"
    );

    if (electiveCourses.length === 0) {
        return {
            totalCourseCount: 0,
            requiredCourseCount: 0,
            requiredCredits: 0,
            passedCourseCount: 0,
            countedCredits: 0,
            actualPassedCredits: 0,
            completed: true,
            passedCourses: []
        };
    }

    let requiredCourseCount = 3;

    const itemCoNhom = electiveCourses.find(
        item =>
            item.nhomTuChon &&
            Number(item.nhomTuChon.soMonCanDat) > 0
    );

    if (itemCoNhom) {
        requiredCourseCount = Number(
            itemCoNhom.nhomTuChon.soMonCanDat
        );
    }

    const creditValues = [
        ...new Set(
            electiveCourses.map(
                item => Number(item.hocPhan?.soTinChi || 0)
            )
        )
    ];

    let requiredCredits = 0;

    if (creditValues.length === 1) {
        requiredCredits =
            requiredCourseCount * creditValues[0];
    }

    const passedCourses = electiveCourses.filter(
        item => item.status === "DAT"
    );

    const actualPassedCredits = passedCourses.reduce(
        (total, item) => {
            return total + Number(item.hocPhan?.soTinChi || 0);
        },
        0
    );

    const countedCourses = passedCourses.slice(
        0,
        requiredCourseCount
    );

    const countedCredits = countedCourses.reduce(
        (total, item) => {
            return total + Number(item.hocPhan?.soTinChi || 0);
        },
        0
    );

    return {
        totalCourseCount: electiveCourses.length,
        requiredCourseCount,
        requiredCredits,
        passedCourseCount: passedCourses.length,
        countedCredits,
        actualPassedCredits,
        completed: passedCourses.length >= requiredCourseCount,
        passedCourses
    };
}

function calculateFinalProjectProgress(courseProgress = []) {
    const doAnCourse = courseProgress.find(
        item => item.loaiHocPhan === "DO_AN_TOT_NGHIEP"
    );

    const replacementCoursesAll = courseProgress.filter(
        item => item.loaiHocPhan === "THAY_THE_DO_AN"
    );

    let requiredCredits = 10;

    if (
        doAnCourse &&
        Number(doAnCourse.hocPhan?.soTinChi) > 0
    ) {
        requiredCredits = Number(
            doAnCourse.hocPhan.soTinChi
        );
    }

    const doAnStatus = doAnCourse
        ? doAnCourse.status
        : "CHUA_HOC";

    const replacementCourses = replacementCoursesAll.filter(
        item => item.status === "DAT"
    );

    const replacementPassedCredits = replacementCourses.reduce(
        (total, item) => {
            return total + Number(item.hocPhan?.soTinChi || 0);
        },
        0
    );

    if (doAnStatus === "DAT") {
        return {
            completed: true,
            method: "DO_AN_TOT_NGHIEP",
            requiredCredits,
            countedCredits: requiredCredits,
            doAnStatus,
            replacementPassedCredits,
            replacementCourses,
            replacementCoursesAll
        };
    }

    const countedCredits = Math.min(
        replacementPassedCredits,
        requiredCredits
    );

    const completed =
        replacementPassedCredits >= requiredCredits;

    return {
        completed,
        method: completed ? "THAY_THE_DO_AN" : null,
        requiredCredits,
        countedCredits,
        doAnStatus,
        replacementPassedCredits,
        replacementCourses,
        replacementCoursesAll
    };
}

function getMissingRequiredCourses(courseProgress = []) {
    return courseProgress.filter(item => {
        if (item.loaiHocPhan !== "BAT_BUOC") {
            return false;
        }

        return (
            item.status === "CHUA_HOC" ||
            item.status === "CHUA_DAT"
        );
    });
}

// ======================================================
// SUA TC21, TC22: KIEM TRA QUAN HE TIEN QUYET
// ======================================================

function validatePrerequisites(courseProgress = []) {
    const courseMap = new Map();
    const prerequisiteMap = new Map();

    for (const item of courseProgress) {
        const id = getId(item.hocPhan);

        if (id) {
            courseMap.set(id, item);
        }
    }

    // Kiểm tra học phần tiên quyết tồn tại và không tự tham chiếu.
    for (const item of courseProgress) {
        if (!item.hocPhanTienQuyet) {
            continue;
        }

        const id = getId(item.hocPhan);
        const prerequisiteId = getId(item.hocPhanTienQuyet);

        const maHocPhan =
            item.hocPhan?.maHocPhan || id || "không xác định";

        if (!prerequisiteId || !courseMap.has(prerequisiteId)) {
            return {
                valid: false,
                message:
                    `Học phần ${maHocPhan} tham chiếu học phần tiên quyết không tồn tại trong CTĐT.`
            };
        }

        // TC21: Học phần lấy chính mình làm tiên quyết.
        if (id === prerequisiteId) {
            return {
                valid: false,
                message:
                    `Học phần ${maHocPhan} không được lấy chính mình làm học phần tiên quyết.`
            };
        }

        prerequisiteMap.set(id, prerequisiteId);
    }

    // TC22: Sử dụng DFS để phát hiện chu trình.
    // 1: đang duyệt; 2: đã duyệt xong.
    const state = new Map();
    const stack = [];

    function detectCycle(id) {
        if (state.get(id) === 1) {
            return [
                ...stack.slice(stack.indexOf(id)),
                id
            ];
        }

        if (state.get(id) === 2) {
            return null;
        }

        state.set(id, 1);
        stack.push(id);

        const prerequisiteId = prerequisiteMap.get(id);

        if (prerequisiteId) {
            const cycle = detectCycle(prerequisiteId);

            if (cycle) {
                return cycle;
            }
        }

        stack.pop();
        state.set(id, 2);

        return null;
    }

    for (const id of courseMap.keys()) {
        const cycle = detectCycle(id);

        if (cycle) {
            const codes = cycle.map(
                courseId =>
                    courseMap.get(courseId)?.hocPhan?.maHocPhan ||
                    courseId
            );

            return {
                valid: false,
                message:
                    `Quan hệ tiên quyết tạo vòng phụ thuộc: ${codes.join(" -> ")}.`
            };
        }
    }

    return {
        valid: true,
        message: null
    };
}

// ======================================================
// SUA TC23: KIEM TRA CAU TRUC CHUONG TRINH DAO TAO
// ======================================================

function validateCurriculumStructure(
    courseProgress = [],
    requiredCredits = 0
) {
    const requiredCatalogCredits =
        calculateRequiredCatalogCredits(courseProgress);

    const electiveProgress =
        calculateElectiveProgress(courseProgress);

    if (
        electiveProgress.totalCourseCount > 0 &&
        electiveProgress.requiredCredits <= 0
    ) {
        return {
            valid: false,
            message:
                "Không xác định được số tín chỉ yêu cầu của nhóm tự chọn."
        };
    }

    // TC23: Số môn được cung cấp phải đủ số môn yêu cầu.
    if (
        electiveProgress.totalCourseCount <
        electiveProgress.requiredCourseCount
    ) {
        return {
            valid: false,
            message:
                `Nhóm tự chọn yêu cầu ${electiveProgress.requiredCourseCount} học phần nhưng CTĐT chỉ cung cấp ${electiveProgress.totalCourseCount} học phần.`
        };
    }

    const doAnCourse = courseProgress.find(
        item => item.loaiHocPhan === "DO_AN_TOT_NGHIEP"
    );

    if (!doAnCourse) {
        return {
            valid: false,
            message:
                "CTĐT chưa có học phần Đồ án tốt nghiệp."
        };
    }

    const finalProjectRequiredCredits = Number(
        doAnCourse.hocPhan?.soTinChi || 0
    );

    if (finalProjectRequiredCredits <= 0) {
        return {
            valid: false,
            message:
                "Số tín chỉ Đồ án tốt nghiệp không hợp lệ."
        };
    }

    const replacementAvailableCredits = courseProgress
        .filter(
            item => item.loaiHocPhan === "THAY_THE_DO_AN"
        )
        .reduce((total, item) => {
            return total + Number(item.hocPhan?.soTinChi || 0);
        }, 0);

    if (
        replacementAvailableCredits <
        finalProjectRequiredCredits
    ) {
        return {
            valid: false,
            message:
                "Các học phần thay thế đồ án không đủ số tín chỉ yêu cầu."
        };
    }

    const structureCredits =
        requiredCatalogCredits +
        electiveProgress.requiredCredits +
        finalProjectRequiredCredits;

    if (structureCredits !== requiredCredits) {
        return {
            valid: false,
            message:
                `Cấu hình CTĐT không khớp: bắt buộc ${requiredCatalogCredits} + tự chọn ${electiveProgress.requiredCredits} + đồ án/thay thế ${finalProjectRequiredCredits} = ${structureCredits} tín, trong khi CTĐT yêu cầu ${requiredCredits} tín.`,
            requiredCatalogCredits,
            electiveRequiredCredits:
                electiveProgress.requiredCredits,
            finalProjectRequiredCredits,
            structureCredits
        };
    }

    return {
        valid: true,
        requiredCatalogCredits,
        electiveRequiredCredits:
            electiveProgress.requiredCredits,
        finalProjectRequiredCredits,
        structureCredits,
        replacementAvailableCredits
    };
}

function calculateCompletionRate(
    completedCredits,
    requiredCredits
) {
    const completed = Number(completedCredits);
    const required = Number(requiredCredits);

    if (!Number.isFinite(required) || required <= 0) {
        return 0;
    }

    const rate = (completed / required) * 100;

    return Number(
        Math.min(100, Math.max(0, rate)).toFixed(1)
    );
}

function calculateStudentProgress(arg1, arg2, arg3) {
    let sinhVien;
    let chuongTrinhDaoTao;
    let curriculumCourses;
    let results;

    if (
        arg1 &&
        typeof arg1 === "object" &&
        Object.prototype.hasOwnProperty.call(
            arg1,
            "curriculumCourses"
        )
    ) {
        sinhVien = arg1.sinhVien || null;

        chuongTrinhDaoTao =
            arg1.chuongTrinhDaoTao ||
            sinhVien?.chuongTrinhDaoTao ||
            null;

        curriculumCourses = Array.isArray(arg1.curriculumCourses)
            ? arg1.curriculumCourses
            : [];

        results = Array.isArray(arg1.results)
            ? arg1.results
            : [];
    } else {
        sinhVien = arg1 || null;

        chuongTrinhDaoTao =
            sinhVien?.chuongTrinhDaoTao || null;

        curriculumCourses = Array.isArray(arg2)
            ? arg2
            : [];

        results = Array.isArray(arg3)
            ? arg3
            : [];
    }

    // Sinh viên chưa được gán chương trình đào tạo.
    if (!chuongTrinhDaoTao) {
        return {
            dataStatus: "CHUA_DU_DU_LIEU",
            message:
                "Sinh viên chưa được gán chương trình đào tạo.",
            completedCredits: 0,
            requiredCredits: 0,
            rawCompletedCredits: 0,
            completionRate: 0,
            courseProgress: [],
            missingRequiredCourses: [],
            electiveProgress: null,
            finalProjectProgress: null
        };
    }

    const requiredCredits = Number(
        chuongTrinhDaoTao.tongTinChiYeuCau
    );

    if (
        !Number.isFinite(requiredCredits) ||
        requiredCredits <= 0
    ) {
        return {
            dataStatus: "DU_LIEU_KHONG_HOP_LE",
            message:
                "Tổng tín chỉ yêu cầu của CTĐT không hợp lệ.",
            completedCredits: 0,
            requiredCredits: 0,
            rawCompletedCredits: 0,
            completionRate: 0,
            courseProgress: [],
            missingRequiredCourses: [],
            electiveProgress: null,
            finalProjectProgress: null
        };
    }

    if (curriculumCourses.length === 0) {
        return {
            dataStatus: "CHUA_DU_DU_LIEU",
            message:
                "Chương trình đào tạo chưa có dữ liệu học phần.",
            completedCredits: 0,
            requiredCredits,
            rawCompletedCredits: 0,
            completionRate: 0,
            courseProgress: [],
            missingRequiredCourses: [],
            electiveProgress: null,
            finalProjectProgress: null
        };
    }

    const courseProgress = buildCourseProgress(
        curriculumCourses,
        results
    );

    // Kiểm tra quan hệ tiên quyết.
    const prerequisiteValidation =
        validatePrerequisites(courseProgress);

    if (!prerequisiteValidation.valid) {
        return {
            dataStatus: "DU_LIEU_KHONG_HOP_LE",
            message: prerequisiteValidation.message,
            completedCredits: 0,
            requiredCredits,
            rawCompletedCredits: 0,
            completionRate: 0,
            courseProgress,
            missingRequiredCourses: [],
            electiveProgress: null,
            finalProjectProgress: null
        };
    }

    // Kiểm tra cấu trúc CTĐT.
    const structure = validateCurriculumStructure(
        courseProgress,
        requiredCredits
    );

    if (!structure.valid) {
        return {
            dataStatus: "DU_LIEU_KHONG_HOP_LE",
            message: structure.message,
            completedCredits: 0,
            requiredCredits,
            rawCompletedCredits:
                calculateRawCompletedCredits(courseProgress),
            completionRate: 0,
            courseProgress,
            missingRequiredCourses: [],
            electiveProgress: null,
            finalProjectProgress: null,
            structure
        };
    }

    const requiredCompletedCredits =
        calculateRequiredCompletedCredits(courseProgress);

    const electiveProgress =
        calculateElectiveProgress(courseProgress);

    const finalProjectProgress =
        calculateFinalProjectProgress(courseProgress);

    const completedCredits =
        requiredCompletedCredits +
        electiveProgress.countedCredits +
        finalProjectProgress.countedCredits;

    if (completedCredits > requiredCredits) {
        return {
            dataStatus: "DU_LIEU_KHONG_HOP_LE",
            message:
                `Tín chỉ tính tiến độ (${completedCredits}) vượt quá tổng yêu cầu (${requiredCredits}).`,
            completedCredits,
            requiredCredits,
            rawCompletedCredits:
                calculateRawCompletedCredits(courseProgress),
            completionRate: 0,
            courseProgress,
            missingRequiredCourses:
                getMissingRequiredCourses(courseProgress),
            electiveProgress,
            finalProjectProgress,
            structure
        };
    }

    const rawCompletedCredits =
        calculateRawCompletedCredits(courseProgress);

    const missingRequiredCourses =
        getMissingRequiredCourses(courseProgress);

    const completionRate = calculateCompletionRate(
        completedCredits,
        requiredCredits
    );

    return {
        dataStatus: "VALID",
        message: null,
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
