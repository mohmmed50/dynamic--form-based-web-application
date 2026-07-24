namespace StudentRegistry.Application.Constants
{
    // Subjects excluded from the Egyptian equivalency (تنسيق) calculation for the Saudi
    // certificate. Students may freely add/remove subjects per year on the client, so this
    // denylist is enforced server-side too (mirrors wwwroot/js/form-handler.js's
    // SAUDI_DENIED_SUBJECTS_EXACT / SAUDI_DENIED_KEYWORDS — keep both in sync).
    public static class SaudiConstants
    {
        public static readonly string[] DeniedSubjectsExact =
        {
            "الفقه", "القرآن الكريم والتفسير", "الحديث", "التوحيد",
            "التربية الصحية والبدنية", "اللياقة والثقافة الصحية"
        };

        // Note: "رياضه"/"رياضيه" (sport, noun/adjective) deliberately do NOT match "الرياضيات"
        // (Mathematics) after normalization — verify with any new keyword before adding it here.
        public static readonly string[] DeniedKeywords =
        {
            "قرآن", "تفسير", "حديث", "توحيد", "فقه", "اسلام", "اسلاميه", "عقيده", "شريعه", "دينيه",
            "رياضه", "رياضيه", "بدني", "بدنيه", "لياقه", "دفاع عن النفس",
            "اختياري", "اختيار حر", "ماده حره", "نشاط حر"
        };
    }
}
