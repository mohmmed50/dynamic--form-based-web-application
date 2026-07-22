namespace StudentRegistry.Domain.Entities
{
    public class IgStudentGradeCounts
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string GradeType { get; set; } = string.Empty; // e.g. igcse-legacy, igcse-numeric, as-level, a-level
        public string Grade { get; set; } = string.Empty; // e.g. A_STAR, A, 9, 8
        public int Count { get; set; }

        // Navigation property
        public virtual Student Student { get; set; } = null!;
    }
}
