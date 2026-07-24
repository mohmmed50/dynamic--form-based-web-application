using System.Collections.Generic;
using System.Linq;

namespace StudentRegistry.Application.Constants
{
    // A single course-code table row (رمز المقرر + اسم المادة). SubjectName is the value that
    // actually participates in validation/calculation (matches StudentDto.SingleYearSubjectMarkCreateDto.SubjectName);
    // Code is display-only, shown in the UI before the subject name.
    public readonly record struct BahrainiCourseEntry(string Code, string SubjectName);

    // Bahraini-specific rules (last-two-years, single grade level per submission). Three tracks are
    // offered in the UI, but only العلمي والأدبي have a defined, counted subject list today —
    // مهني/فني has no published list yet, mirroring Qatari's pattern for undefined tracks.
    // Shared single-year-fixed-total rules (max mark per subject) live in SingleYearFixedTotalConstants.
    // Referenced by ConfigController (API), StudentCreateDtoValidator, and StudentService.
    public static class BahrainiConstants
    {
        public const string ScientificTrack = "علمي";
        public const string LiteraryTrack = "أدبي";
        public const string VocationalTrack = "مهني/فني";

        // §المسار العلمي — source: official course-code table, آخر سنتين فقط (ثاني ثانوي فصل 3+4
        // وثالث ثانوي فصل 5+6). Duplicate subject names within a semester are intentional — they
        // represent separate course codes/components graded separately (e.g. ريض253/ريض261 كلاهما
        // "الرياضيات (3)" في فصل 3؛ انج201 يتكرر في فصل 5 لأنه مقرر مهارات عامة منفصل).
        public static readonly BahrainiCourseEntry[] ScientificSemester3Courses =
        {
            new("انج201", "اللغة الإنجليزية - مهارات عامة"),
            new("حيا211", "الأحياء 2"),
            new("ريض253", "الرياضيات (3)"),
            new("ريض261", "الرياضيات (3)"),
            new("عرب201", "اللغة العربية (3)"),
            new("فيز210", "الفيزياء 2"),
            new("كيم211", "الكيمياء 2")
        };

        public static readonly BahrainiCourseEntry[] ScientificSemester4Courses =
        {
            new("اجا203", "تاريخ البحرين الحديث والمعاصر"),
            new("انج202", "اللغة الإنجليزية - مهارات عامة"),
            new("جيو211", "الجيولوجيا 1"),
            new("حيا217", "الأحياء 3"),
            new("ريض262", "الرياضيات (4)"),
            new("عرب202", "اللغة العربية (4)"),
            new("فيز218", "الفيزياء 3"),
            new("كيم214", "الكيمياء 3")
        };

        public static readonly BahrainiCourseEntry[] ScientificSemester5Courses =
        {
            new("اجا103", "تاريخ العالم الحديث والمعاصر"),
            new("انج201", "اللغة الإنجليزية - مهارات عامة"),
            new("انج301", "اللغة الإنجليزية - مهارات عامة"),
            new("حيا316", "الأحياء 4"),
            new("ريض364", "الرياضيات (5)"),
            new("عرب301", "اللغة العربية (5)"),
            new("فيز311", "الفيزياء 4"),
            new("كيم315", "الكيمياء 4")
        };

        public static readonly BahrainiCourseEntry[] ScientificSemester6Courses =
        {
            new("انج302", "اللغة الإنجليزية - مهارات عامة"),
            new("حيا317", "الأحياء 5"),
            new("ريض252", "الرياضيات 7"),
            new("ريض361", "الرياضيات (6)"),
            new("عرب302", "اللغة العربية (6)"),
            new("علم202", "التربية البيئية والتنمية المستدامة"),
            new("كيم318", "الكيمياء 5")
        };

        // §1 — semester label -> course rows (code + name), in display order. Used by ConfigController
        // to expose the grouped structure to the frontend (mirrors the Saudi block_1/2/3 UI pattern).
        public static readonly Dictionary<string, BahrainiCourseEntry[]> ScientificSemesters = new()
        {
            { "الفصل 3", ScientificSemester3Courses },
            { "الفصل 4", ScientificSemester4Courses },
            { "الفصل 5", ScientificSemester5Courses },
            { "الفصل 6", ScientificSemester6Courses }
        };

        // Flattened subject NAMES only (order preserved, codes dropped) — used for validation
        // (multiset match) and the shared ProcessSingleYearFixedTotalCertificate calculation.
        // 30 rows total → denominator 3000.
        public static readonly string[] ScientificTrackSubjects =
            ScientificSemesters.Values
                .SelectMany(courses => courses)
                .Select(c => c.SubjectName)
                .ToArray();

        // Counted subjects for المسار الأدبي, exactly 8. No official per-semester course-code table
        // has been provided for this track yet — kept as a flat, no-duplicate list.
        public static readonly string[] LiteraryTrackSubjects =
        {
            "اللغة العربية", "اللغة الإنجليزية", "الرياضيات", "الجغرافيا الاقتصادية",
            "تاريخ العالم الحديث والمعاصر", "تاريخ البحرين الحديث والمعاصر",
            "علم الاجتماع أو علم النفس", "تقنية المعلومات"
        };

        public const string VocationalTrackError =
            "قائمة مواد هذا المسار غير معتمدة بعد في النظام — يرجى مراجعة مكتب تنسيق القبول بالجامعات والمعاهد المصرية.";

        public const string Disclaimer =
            "هذا الحساب تقريبي واستشاري، يرجى التأكد من الجهات الرسمية.";

        public static string[] GetTrackSubjects(string track) => track switch
        {
            ScientificTrack => ScientificTrackSubjects,
            LiteraryTrack => LiteraryTrackSubjects,
            _ => System.Array.Empty<string>()
        };
    }
}
