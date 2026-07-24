namespace StudentRegistry.Application.Constants
{
    // Shared rules for certificates that are single-grade-level, fixed-100-per-subject,
    // fixed-denominator, no-weight calculations — currently Qatari and Omani.
    // Referenced by ConfigController (API), StudentCreateDtoValidator, and StudentService's
    // shared ProcessSingleYearFixedTotalCertificate.
    public static class SingleYearFixedTotalConstants
    {
        public const decimal MaxMarkPerSubject = 100m;

        // Permanently excluded from both numerator and denominator for certs that carve it out
        // (Qatari, Omani), collected separately as a documentation-only field. Not every cert in
        // this family has an excluded subject — Yemeni has none, so callers must treat this as
        // optional rather than universally applied.
        public const string IslamicEducationSubject = "التربية الإسلامية";
    }
}
