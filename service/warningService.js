// ======================================================
// warningService.js
// ======================================================


// ======================================================
// LẤY ID AN TOÀN
// ======================================================

function getId(value) {

    if (!value) {
        return null;
    }

    if (value._id) {
        return value._id.toString();
    }

    return value.toString();
}


// ======================================================
// TẠO CẢNH BÁO
// ======================================================

function buildWarnings(courseProgress = []) {

    const warnings = [];


    // ==================================================
    // DUYỆT TỪNG HỌC PHẦN
    // ==================================================

    for (const item of courseProgress) {

        if (!item || !item.hocPhan) {
            continue;
        }


        // ==================================================
        // 1. CẢNH BÁO MÔN BẮT BUỘC CHƯA HỌC
        // ==================================================

        if (
            item.loaiHocPhan === "BAT_BUOC" &&
            item.status === "CHUA_HOC"
        ) {

            warnings.push({

                code:
                    "REQUIRED_NOT_STUDIED",

                type:
                    "REQUIRED_NOT_STUDIED",

                hocPhan:
                    item.hocPhan,

                message:
                    `Học phần bắt buộc ${item.hocPhan.tenHocPhan} chưa được học.`
            });
        }


        // ==================================================
        // 2. CẢNH BÁO MÔN BẮT BUỘC CHƯA ĐẠT
        // ==================================================

        if (
            item.loaiHocPhan === "BAT_BUOC" &&
            item.status === "CHUA_DAT"
        ) {

            warnings.push({

                code:
                    "REQUIRED_NOT_PASSED",

                type:
                    "REQUIRED_NOT_PASSED",

                hocPhan:
                    item.hocPhan,

                message:
                    `Học phần bắt buộc ${item.hocPhan.tenHocPhan} chưa đạt.`
            });
        }


        // ==================================================
        // 3. CẢNH BÁO TIÊN QUYẾT
        // ==================================================

        if (
            item.hocPhanTienQuyet
        ) {

            const prerequisiteId =
                getId(
                    item.hocPhanTienQuyet
                );


            const prerequisiteProgress =
                courseProgress.find(
                    course => {

                        return (
                            getId(
                                course.hocPhan
                            ) ===
                            prerequisiteId
                        );
                    }
                );


            /*
                Trường hợp không tìm thấy
                học phần tiên quyết trong CTĐT:

                Không sinh cảnh báo giả.

                progressService.js sẽ xử lý
                đây là DU_LIEU_KHONG_HOP_LE.
            */

            if (
                !prerequisiteProgress
            ) {
                continue;
            }


            /*
                Với môn bắt buộc:
                nếu tiên quyết chưa DAT
                → sinh cảnh báo.

                Với môn tự chọn hoặc môn thay thế:
                chỉ cảnh báo nếu sinh viên
                đã thực sự có kết quả môn đó.

                Như vậy tránh cảnh báo
                các môn tùy chọn mà sinh viên
                không hề chọn học.
            */

            let canhBaoTienQuyet =
                false;


            if (
                item.loaiHocPhan ===
                "BAT_BUOC"
            ) {

                canhBaoTienQuyet =
                    prerequisiteProgress
                        .status !== "DAT";

            } else {

                canhBaoTienQuyet =
                    item.status !== "CHUA_HOC" &&
                    prerequisiteProgress
                        .status !== "DAT";
            }


            if (
                canhBaoTienQuyet
            ) {

                warnings.push({

                    code:
                        "PREREQUISITE_NOT_MET",

                    type:
                        "PREREQUISITE_NOT_MET",

                    hocPhan:
                        item.hocPhan,

                    hocPhanTienQuyet:
                        item.hocPhanTienQuyet,

                    message:
                        `${item.hocPhan.tenHocPhan} chưa thỏa điều kiện tiên quyết ${item.hocPhanTienQuyet.tenHocPhan || ""}.`
                });
            }
        }
    }


    return warnings;
}


// ======================================================
// THỐNG KÊ CẢNH BÁO
// ======================================================

function summarizeWarnings(warnings = []) {

    return {

        total:
            warnings.length,

        requiredNotStudied:
            warnings.filter(
                item =>
                    item.code ===
                    "REQUIRED_NOT_STUDIED"
            ).length,

        requiredNotPassed:
            warnings.filter(
                item =>
                    item.code ===
                    "REQUIRED_NOT_PASSED"
            ).length,

        prerequisiteNotMet:
            warnings.filter(
                item =>
                    item.code ===
                    "PREREQUISITE_NOT_MET"
            ).length
    };
}


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    buildWarnings,

    summarizeWarnings
};