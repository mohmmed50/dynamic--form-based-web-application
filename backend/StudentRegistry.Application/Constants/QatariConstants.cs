namespace StudentRegistry.Application.Constants
{
    // Qatari-specific rules (scientific track, grade-12-only). Shared single-year-fixed-total
    // rules (max mark, denominator, التربية الإسلامية) live in SingleYearFixedTotalConstants.
    // Referenced by ConfigController (API), StudentCreateDtoValidator, and StudentService.
    public static class QatariConstants
    {
        // §1.2 — counted subjects for المسار العلمي, exactly 7.
        public static readonly string[] ScientificTrackSubjects =
        {
            "اللغة العربية", "اللغة الإنجليزية", "الرياضيات", "الكيمياء",
            "الأحياء", "الفيزياء", "الحوسبة وتكنولوجيا المعلومات"
        };

        // §1.6 — only المسار العلمي has a defined subject list today.
        // TODO: add subject lists for المسار الأدبي والإنسانيات and مسار التكنولوجيا once the
        // official Qatari track subject lists are provided — do not reuse the scientific list.
        public const string ScientificTrack = "المسار العلمي";
        public const string NonScientificTrackError =
            "قائمة مواد هذا المسار غير معتمدة بعد في النظام — يرجى مراجعة مكتب تنسيق القبول بالجامعات والمعاهد المصرية.";
    }
}
