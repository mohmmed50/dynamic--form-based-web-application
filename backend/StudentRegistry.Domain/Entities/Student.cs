using System;
using System.Collections.Generic;

namespace StudentRegistry.Domain.Entities
{
    public class Student
    {
        public int Id { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string NationalId { get; set; } = string.Empty;
        public string Certification { get; set; } = string.Empty;
        public string Track { get; set; } = string.Empty;
        public string PhotoPath { get; set; } = string.Empty;
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual SaudiStudentTotals? SaudiTotals { get; set; }
        public virtual ICollection<SaudiStudentGrades> SaudiGrades { get; set; } = new List<SaudiStudentGrades>();
        public virtual IgStudentGrades? IgGrades { get; set; }
        public virtual ICollection<IgStudentGradeCounts> IgGradeCounts { get; set; } = new List<IgStudentGradeCounts>();
        public virtual ICollection<StandardStudentGrades> StandardGrades { get; set; } = new List<StandardStudentGrades>();
    }
}
