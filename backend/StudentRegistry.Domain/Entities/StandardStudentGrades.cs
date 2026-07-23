namespace StudentRegistry.Domain.Entities
{
    public class StandardStudentGrades
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string YearOfStudy { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public decimal Grade { get; set; }
        public decimal WeightedPercentage { get; set; }
        public decimal Achieved { get; set; }

        // Kuwaiti-only fields (null for Qatari/Bahraini rows).
        public int? GradeLevel { get; set; }
        public decimal? MaxMark { get; set; }

        // Navigation property
        public virtual Student Student { get; set; } = null!;
    }
}
