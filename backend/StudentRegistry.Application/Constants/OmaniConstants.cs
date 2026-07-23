namespace StudentRegistry.Application.Constants
{
    // Omani-specific rules (single track, grade-12-only). Shared single-year-fixed-total rules
    // (max mark, denominator, التربية الإسلامية) live in SingleYearFixedTotalConstants.
    // Referenced by ConfigController (API), StudentCreateDtoValidator, and StudentService.
    public static class OmaniConstants
    {
        // §1.2 — counted subjects, exactly 7.
        public static readonly string[] Subjects =
        {
            "اللغة العربية", "اللغة الإنجليزية", "الرياضيات المتقدمة", "الفيزياء",
            "الكيمياء", "الأحياء", "الدراسات الاجتماعية"
        };

        // §1.6 — the source rules describe one track only. No track selector is built for this
        // certificate; the shared track field is set to this single fixed value.
        public const string SingleTrack = "الشهادة الثانوية العمانية";
    }
}
