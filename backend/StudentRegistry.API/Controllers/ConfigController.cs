using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace StudentRegistry.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConfigController : ControllerBase
    {
        [HttpGet("subjects")]
        public IActionResult GetSubjectsConfig()
        {
            var config = new
            {
                certifications = new Dictionary<string, object>
                {
                    { "ig", new { name = "شهادات الـ IG (IGCSE/O-Level/A-Level)", tracks = new[] { "IGCSE (Early Years) - مواد عامة", "A-Levels (Advanced Years) - تخصص علمي أو أدبي", "AS-Levels (Intermediate Year) - انتقالى" } } },
                    { "saudi", new { name = "شهادة سعودية", tracks = new[] { "المسار العام", "مسار العلوم", "مسار الإدارة والأعمال", "مسار الهندسة والتكنولوجيا", "مسار العلوم الإنسانية" } } },
                    { "qatari", new { name = "شهادة قطرية", tracks = new[] { "المسار العلمي", "المسار الأدبي والإنسانيات", "مسار التكنولوجيا" } } },
                    { "bahraini", new { name = "شهادة بحرينية", tracks = new[] { "مسار العلوم والرياضيات", "مسار اللغات والعلوم الإنسانية", "مسار العلوم التجارية" } } },
                    { "kuwaiti", new { name = "شهادة كويتية", tracks = new[] { "القسم العلمي", "القسم الأدبي" } } }
                },
                subjects = new Dictionary<string, string[]>
                {
                    { "year_1", new[] { "اللغة العربية", "اللغة الإنجليزية", "الرياضيات", "الكيمياء", "الفيزياء", "الأحياء", "الدراسات الإسلامية", "الدراسات الاجتماعية" } },
                    { "year_2", new[] { "اللغة العربية", "اللغة الإنجليزية", "الرياضيات (2)", "الكيمياء", "الفيزياء", "الأحياء", "الحاسب الآلي", "الدراسات الإسلامية" } },
                    { "year_3", new[] { "اللغة العربية", "اللغة الإنجليزية", "الرياضيات (3)", "الكيمياء", "الفيزياء", "الجيولوجيا والعلوم البيئية", "الدراسات الإسلامية", "التربية الوطنية" } }
                }
            };

            return Ok(config);
        }

        [HttpGet("subjects-saudi")]
        public IActionResult GetSaudiSubjectsConfig()
        {
            // Source of truth: official Saudi weighted-grade spreadsheet.
            // No fixed coefficients here anymore — the coefficient is derived per submission
            // from the student's own "Achieved" and "Weighted" entries (Weighted / Achieved,
            // must be a whole number). Duplicate subject names within a block are intentional —
            // they represent separate exams/terms for the same subject.
            var saudiConfig = new Dictionary<string, string[]>
            {
                {
                    "block_1", new[]
                    {
                        "اللغة الإنجليزية", "الأحياء", "الرياضيات", "الكفايات اللغوية",
                        "التفكير الناقد", "تقنية رقمية", "الفيزياء", "اللغة الإنجليزية",
                        "علم البيئة", "الرياضيات", "الكفايات اللغوية", "تربية مهنية",
                        "تقنية رقمية", "اللغة الإنجليزية", "دراسات اجتماعية", "الرياضيات",
                        "الكيمياء", "المعرفة المالية", "تقنية رقمية"
                    }
                },
                {
                    "block_2", new[]
                    {
                        "اللغة الإنجليزية", "الأحياء", "الرياضيات", "الكيمياء", "الفنون",
                        "اللغة الإنجليزية", "التاريخ", "الأحياء", "الرياضيات", "الكيمياء",
                        "الكفايات اللغوية", "تقنية رقمية", "الفيزياء", "اللغة الإنجليزية",
                        "الأحياء", "الرياضيات", "الكيمياء", "تقنية رقمية"
                    }
                },
                {
                    "block_3", new[]
                    {
                        "الفيزياء", "الرياضيات", "اللغة الإنجليزية", "البحث ومصادر المعلومات",
                        "النشاط", "علوم الارض والفضاء", "الكيمياء", "تقنية رقمية",
                        "التنمية المستدامه", "الفيزياء", "اللغة الإنجليزية", "الرياضيات",
                        "الجغرافيا", "النشاط", "الدراسات الادبية", "علوم الارض والفضاء",
                        "دراسات نفسية واجتماعية", "مواطنة رقمية", "مهارات حياتية 2",
                        "التنمية المستدامه"
                    }
                }
            };

            return Ok(saudiConfig);
        }
    }
}
