namespace StudentRegistry.Application.Constants
{
    // Yemeni-specific rules (single track, grade-12-only, no excluded subject). Shared
    // single-year-fixed-total rules (max mark per subject) live in SingleYearFixedTotalConstants;
    // the denominator is derived from Subjects.Length rather than a fixed constant.
    // Referenced by ConfigController (API), StudentCreateDtoValidator, and StudentService.
    public static class YemeniConstants
    {
        // §1.2 — counted subjects, exactly 6. No excluded subject for this certificate.
        public static readonly string[] Subjects =
        {
            "اللغة العربية", "اللغة الإنجليزية", "الرياضيات", "الفيزياء", "الكيمياء", "الأحياء"
        };

        // §1.1 — the source rules describe one track only. No track selector is built for this
        // certificate; the shared track field is set to this single fixed value.
        public const string SingleTrack = "الشهادة الثانوية اليمنية";
    }
}
