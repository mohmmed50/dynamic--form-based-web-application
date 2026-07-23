using System;
using System.Collections.Generic;

namespace StudentRegistry.Application.DTOs
{
    public class StudentCreateDto
    {
        public string StudentName { get; set; } = string.Empty;
        public string StudentNameEn { get; set; } = string.Empty;
        public string NationalId { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string GuardianName { get; set; } = string.Empty;
        public string GuardianPhone { get; set; } = string.Empty;
        public string GuardianRelation { get; set; } = string.Empty;
        public string AddressGov { get; set; } = string.Empty;
        public string AddressCenter { get; set; } = string.Empty;
        public string? AddressVillage { get; set; }
        public string AddressStreet { get; set; } = string.Empty;
        public string AddressBuilding { get; set; } = string.Empty;
        public string? AddressFloor { get; set; }
        public string Certification { get; set; } = string.Empty;
        public string Track { get; set; } = string.Empty;

        // Base64 encoded image string from frontend
        public string Photo { get; set; } = string.Empty;

        // Saudi specific fields
        public string? YearsCount { get; set; }
        public List<SaudiGradeCreateDto>? SaudiGrades { get; set; }

        // IG specific fields
        public string? IgProgram { get; set; }
        public decimal? Factor { get; set; }
        public decimal? SportsBonus { get; set; }
        public List<IgGradeCountCreateDto>? IgGradeCounts { get; set; }

        // Standard certificate fields
        public string? YearOfStudy { get; set; }
        public List<StandardGradeCreateDto>? StandardGrades { get; set; }

        // Kuwaiti specific fields
        public KuwaitiDataCreateDto? KuwaitiData { get; set; }

        // Qatari specific fields
        public QatariDataCreateDto? QatariData { get; set; }
    }

    public class KuwaitiDataCreateDto
    {
        // "Two Years" (grade 11 + 12) or "Three Years" (grade 10 + 11 + 12) — mirrors Saudi's YearsCount.
        public string YearsCount { get; set; } = string.Empty;
        public bool HasSecondAttempt { get; set; }

        // Weight (%) for each included grade level, as printed on the student's own certificate.
        // Grade10Weight is only used/required when YearsCount is "Three Years".
        public decimal? Grade10Weight { get; set; }
        public decimal? Grade11Weight { get; set; }
        public decimal? Grade12Weight { get; set; }

        public List<KuwaitiSubjectGradeCreateDto>? Grade10Subjects { get; set; }
        public List<KuwaitiSubjectGradeCreateDto>? Grade11Subjects { get; set; }
        public List<KuwaitiSubjectGradeCreateDto>? Grade12Subjects { get; set; }
    }

    public class KuwaitiSubjectGradeCreateDto
    {
        public string SubjectName { get; set; } = string.Empty;
        public decimal Obtained { get; set; }
        // Max mark is fixed server-side (KuwaitiConstants) — never accepted from the client.
    }

    public class QatariDataCreateDto
    {
        // The 7 scientific-track subjects — max mark is fixed server-side (§1.2), never client-supplied.
        public List<QatariSubjectMarkCreateDto>? Subjects { get; set; }

        // §1.3 — documentation-only, never fed into the calculation.
        public decimal? IslamicEducationMark { get; set; }

        // §1.5 — documentation-only comparison figures from the printed certificate (out of 800).
        public decimal? PrintedTotal { get; set; }
        public decimal? PrintedPercentage { get; set; }
    }

    public class QatariSubjectMarkCreateDto
    {
        public string SubjectName { get; set; } = string.Empty;
        public decimal Mark { get; set; }
    }

    public class SaudiGradeCreateDto
    {
        public string YearLabel { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public int Coefficient { get; set; }
        public decimal Achieved { get; set; }
    }

    public class IgGradeCountCreateDto
    {
        public string GradeType { get; set; } = string.Empty;
        public string Grade { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class StandardGradeCreateDto
    {
        public string YearOfStudy { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public decimal Grade { get; set; }
        public decimal WeightedPercentage { get; set; }
    }

    public class StudentResponseDto
    {
        public int Id { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string StudentNameEn { get; set; } = string.Empty;
        public string NationalId { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string GuardianName { get; set; } = string.Empty;
        public string GuardianPhone { get; set; } = string.Empty;
        public string GuardianRelation { get; set; } = string.Empty;
        public string AddressGov { get; set; } = string.Empty;
        public string AddressCenter { get; set; } = string.Empty;
        public string? AddressVillage { get; set; }
        public string AddressStreet { get; set; } = string.Empty;
        public string AddressBuilding { get; set; } = string.Empty;
        public string? AddressFloor { get; set; }
        public string Certification { get; set; } = string.Empty;
        public string Track { get; set; } = string.Empty;
        public string PhotoPath { get; set; } = string.Empty;
        public DateTime SubmittedAt { get; set; }

        // Associated records depending on certificate type
        public SaudiTotalsResponseDto? SaudiTotals { get; set; }
        public List<SaudiGradeResponseDto>? SaudiGrades { get; set; }
        public IgGradesResponseDto? IgGrades { get; set; }
        public List<StandardGradeResponseDto>? StandardGrades { get; set; }
        public KuwaitiTotalsResponseDto? KuwaitiTotals { get; set; }
        public List<KuwaitiGradeResponseDto>? KuwaitiGrades { get; set; }
        public QatariTotalsResponseDto? QatariTotals { get; set; }
        public List<QatariGradeResponseDto>? QatariGrades { get; set; }
    }

    public class KuwaitiTotalsResponseDto
    {
        public string YearsCount { get; set; } = string.Empty;
        public decimal? Grade10Percentage { get; set; }
        public decimal? Grade11Percentage { get; set; }
        public decimal Grade12Percentage { get; set; }
        public decimal? Grade10Weight { get; set; }
        public decimal? Grade11Weight { get; set; }
        public decimal Grade12Weight { get; set; }
        // The final equivalent percentage (0-100) — the percentage form of EquivalentTotal (out of 410).
        public decimal FinalPercentage { get; set; }
        public decimal EquivalentTotal { get; set; }
        public bool HasSecondAttempt { get; set; }
        public string Disclaimer { get; set; } = string.Empty;
        public string? SecondAttemptWarning { get; set; }
    }

    public class KuwaitiGradeResponseDto
    {
        public int GradeLevel { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public decimal Obtained { get; set; }
        public decimal MaxMark { get; set; }
    }

    public class QatariTotalsResponseDto
    {
        public decimal FinalTotal { get; set; }   // out of 700
        public decimal Percentage { get; set; }
        public decimal? IslamicEducationMark { get; set; } // documentation-only, غير محتسبة
        public decimal? PrintedTotal { get; set; }          // out of 800, documentation-only
        public decimal? PrintedPercentage { get; set; }
        public string? ComparisonNote { get; set; }
        public string Disclaimer { get; set; } = string.Empty;
    }

    public class QatariGradeResponseDto
    {
        public string SubjectName { get; set; } = string.Empty;
        public decimal Mark { get; set; }
    }

    public class SaudiTotalsResponseDto
    {
        public string YearsCount { get; set; } = string.Empty;
        public decimal TotalAchieved { get; set; }
        public decimal TotalWeighted { get; set; }
        public int TotalCoefficients { get; set; }
        public decimal FinalPercentage { get; set; }
    }

    public class SaudiGradeResponseDto
    {
        public string YearLabel { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public int Coefficient { get; set; }
        public decimal Achieved { get; set; }
        public decimal Weighted { get; set; }
    }

    public class IgGradesResponseDto
    {
        public string IgProgram { get; set; } = string.Empty;
        public decimal Factor { get; set; }
        public decimal SportsBonus { get; set; }
        public decimal ScorePercentage { get; set; }
        public decimal GovernmentScore { get; set; }
        public List<IgGradeCountResponseDto> GradeCounts { get; set; } = new List<IgGradeCountResponseDto>();
    }

    public class IgGradeCountResponseDto
    {
        public string GradeType { get; set; } = string.Empty;
        public string Grade { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class StandardGradeResponseDto
    {
        public string YearOfStudy { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public decimal Grade { get; set; }
        public decimal WeightedPercentage { get; set; }
        public decimal Achieved { get; set; }
    }
}
