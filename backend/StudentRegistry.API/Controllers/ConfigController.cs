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
                    { "saudi", new { name = "شهادة سعودية", tracks = new[] { "مسار العلوم", "مسار الإدارة والأعمال", "مسار الهندسة والتكنولوجيا", "مسار العلوم الإنسانية" } } },
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
            var saudiConfig = new Dictionary<string, object[]>
            {
                {
                    "block_1", new object[]
                    {
                        new { name = "مصادر المعلومات والبحث", coefficient = 3 },
                        new { name = "الفيزياء", coefficient = 5 },
                        new { name = "الرياضيات", coefficient = 4 },
                        new { name = "الجغرافيا", coefficient = 3 },
                        new { name = "الكيمياء", coefficient = 5 },
                        new { name = "اللغة الإنجليزية", coefficient = 4 },
                        new { name = "التقنية الرقمية", coefficient = 3 },
                        new { name = "التنمية المستدامة", coefficient = 3 },
                        new { name = "المهارات الحياتية", coefficient = 3 },
                        new { name = "المواطنة الرقمية", coefficient = 3 },
                        new { name = "علم الأرض والفضاء", coefficient = 4 },
                        new { name = "الفقه", coefficient = 3 },
                        new { name = "التربية الصحية والبدنية", coefficient = 4 },
                        new { name = "الدراسات النفسية والاجتماعية", coefficient = 3 },
                        new { name = "الدراسات الأدبية", coefficient = 3 }
                    }
                },
                {
                    "block_2", new object[]
                    {
                        new { name = "علم الأحياء", coefficient = 4 },
                        new { name = "التربية البدنية والدفاع عن النفس", coefficient = 5 },
                        new { name = "اللياقة والثقافة الصحية", coefficient = 5 },
                        new { name = "الفنون", coefficient = 3 },
                        new { name = "الكيمياء", coefficient = 5 },
                        new { name = "اللغة الإنجليزية", coefficient = 5 },
                        new { name = "التوحيد", coefficient = 5 },
                        new { name = "الكفايات اللغوية", coefficient = 3 },
                        new { name = "التاريخ", coefficient = 5 },
                        new { name = "التقنية الرقمية", coefficient = 3 },
                        new { name = "الفيزياء", coefficient = 5 }
                    }
                },
                {
                    "block_3", new object[]
                    {
                        new { name = "القرآن الكريم والتفسير", coefficient = 4 },
                        new { name = "الكفايات اللغوية", coefficient = 5 },
                        new { name = "علم الأحياء", coefficient = 5 },
                        new { name = "التربية البدنية والدفاع عن النفس", coefficient = 5 },
                        new { name = "اللغة الإنجليزية", coefficient = 5 },
                        new { name = "التقنية الرقمية", coefficient = 3 },
                        new { name = "التفكير الناقد", coefficient = 4 },
                        new { name = "الفيزياء", coefficient = 5 },
                        new { name = "علم البيئة", coefficient = 3 },
                        new { name = "الرياضيات", coefficient = 5 },
                        new { name = "التربية الصحية والبدنية", coefficient = 3 },
                        new { name = "التربية المهنية", coefficient = 3 },
                        new { name = "الدراسات الاجتماعية", coefficient = 5 },
                        new { name = "الكيمياء", coefficient = 5 },
                        new { name = "الحديث والثقافة الإسلامية", coefficient = 3 }
                    }
                }
            };

            return Ok(saudiConfig);
        }
    }
}
