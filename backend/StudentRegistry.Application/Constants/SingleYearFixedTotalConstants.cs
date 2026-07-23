namespace StudentRegistry.Application.Constants
{
    // Shared rules for certificates that are single-grade-level, fixed-100-per-subject,
    // fixed-denominator, no-weight calculations — currently Qatari and Omani.
    // Referenced by ConfigController (API), StudentCreateDtoValidator, and StudentService's
    // shared ProcessSingleYearFixedTotalCertificate.
    public static class SingleYearFixedTotalConstants
    {
        public const decimal MaxMarkPerSubject = 100m;
        public const decimal TotalMaxMark = 700m; // constant denominator — never derived from submitted rows

        // Permanently excluded from both numerator and denominator, collected separately as a
        // documentation-only field.
        public const string IslamicEducationSubject = "التربية الإسلامية";
    }
}
