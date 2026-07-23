namespace StudentRegistry.Application.Constants
{
    // Single source of truth for the Qatari (scientific track, grade-12-only) certificate rules.
    // Referenced by ConfigController (API), StudentCreateDtoValidator, and StudentService.
    public static class QatariConstants
    {
        // §1.2 — counted subjects for المسار العلمي, exactly 7. Max mark is fixed at 100 per
        // subject and is never collected from the student — the denominator is the constant below.
        public static readonly string[] ScientificTrackSubjects =
        {
            "اللغة العربية", "اللغة الإنجليزية", "الرياضيات", "الكيمياء",
            "الأحياء", "الفيزياء", "الحوسبة وتكنولوجيا المعلومات"
        };

        public const decimal MaxMarkPerSubject = 100m;
        public const decimal TotalMaxMark = 700m; // constant denominator — never derived from submitted rows

        // §1.3 — permanently excluded from both numerator and denominator, collected separately
        // as a documentation-only field (KuwaitiData-style asymmetry, but Qatari-specific).
        public const string IslamicEducationSubject = "التربية الإسلامية";

        // §1.6 — only المسار العلمي has a defined subject list today.
        // TODO: add subject lists for المسار الأدبي والإنسانيات and مسار التكنولوجيا once the
        // official Qatari track subject lists are provided — do not reuse the scientific list.
        public const string ScientificTrack = "المسار العلمي";
        public const string NonScientificTrackError =
            "قائمة مواد هذا المسار غير معتمدة بعد في النظام — يرجى مراجعة مكتب تنسيق القبول بالجامعات والمعاهد المصرية.";
    }
}
