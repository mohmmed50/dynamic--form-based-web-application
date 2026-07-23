using System.Collections.Generic;

namespace StudentRegistry.Application.Constants
{
    // Single source of truth for the Kuwaiti (unified 3-year cumulative) certificate rules.
    // Referenced by ConfigController (API), StudentCreateDtoValidator, and StudentService.
    // Max marks below are taken from an official Kuwaiti Ministry of Education certificate
    // sample (شهادة إتمام دراسة المرحلة الثانوية) — do not adjust without an updated source document.
    public static class KuwaitiConstants
    {
        // §1.1 — counted subjects, per grade level, with their fixed max mark.
        // Max mark is NOT entered by the student — the server is authoritative.
        public static readonly Dictionary<string, decimal> Grade10MaxMarks = new()
        {
            { "اللغة العربية", 60m },
            { "اللغة الإنجليزية", 60m },
            { "الفيزياء", 60m },
            { "الكيمياء", 60m },
            { "الرياضيات", 80m },
            { "الأحياء", 40m },
            { "الاجتماعيات", 40m },
            { "المعلوماتية", 20m }
        };

        public static readonly Dictionary<string, decimal> Grade11MaxMarks = new()
        {
            { "اللغة العربية", 80m },
            { "اللغة الإنجليزية", 80m },
            { "الفيزياء", 80m },
            { "الكيمياء", 80m },
            { "الرياضيات", 100m },
            { "الجيولوجيا", 60m },
            { "الأحياء", 60m },
            { "المعلوماتية", 20m }
        };

        public static readonly Dictionary<string, decimal> Grade12MaxMarks = new()
        {
            { "اللغة العربية", 80m },
            { "اللغة الإنجليزية", 80m },
            { "الفيزياء", 80m },
            { "الكيمياء", 80m },
            { "الرياضيات", 100m },
            { "الأحياء", 80m },
            { "المعلوماتية", 20m }
        };

        // §1.2 — permanently excluded, never rendered/summed for any grade level.
        public static readonly string[] ExcludedSubjects =
        {
            "التربية الإسلامية", "أي مادة دينية", "القرآن الكريم", "التربية البدنية", "السلوك",
            "التربية الوطنية والعسكرية", "الدستور وحقوق الإنسان", "الاختيار الحر 1", "الاختيار الحر 2"
        };

        // Number-of-years options, mirroring the Saudi certificate's YearsCount pattern.
        public const string OneYear = "One Year";       // grade 12 only — weight forced to 100%
        public const string TwoYears = "Two Years";     // grade 11 + grade 12
        public const string ThreeYears = "Three Years"; // grade 10 + grade 11 + grade 12

        // §1.6 — second-attempt (دور ثاني) is a records/admin concern, not a calculation concern.
        public const string SecondAttemptWarning =
            "تم تسجيل مواد بنظام الدور الثاني — يلزم تقديم خطاب اعتذار رسمي قبل قبول النتيجة.";

        // §1.7 — every Kuwaiti result carries this disclaimer.
        public const string Disclaimer =
            "هذه النتيجة تقديرية ويجب تأكيدها رسمياً من مكتب تنسيق القبول بالجامعات والمعاهد المصرية.";
    }
}
