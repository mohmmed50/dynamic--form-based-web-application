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
