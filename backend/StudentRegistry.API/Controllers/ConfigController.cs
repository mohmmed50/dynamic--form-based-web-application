using Microsoft.AspNetCore.Mvc;
using StudentRegistry.Application.Constants;
using System.Collections.Generic;
using System.Linq;

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
                    { "kuwaiti", new { name = "شهادة كويتية", tracks = new[] { "القسم العلمي", "القسم الأدبي" } } },
                    // §1.6 — Omani has one track only; the dropdown offers a single fixed value.
                    { "omani", new { name = "شهادة عمانية", tracks = new[] { OmaniConstants.SingleTrack } } }
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

        [HttpGet("subjects-kuwaiti")]
        public IActionResult GetKuwaitiSubjectsConfig()
        {
            // Max marks are fixed (taken from an official Kuwaiti certificate sample) — the student
            // only enters the obtained mark; the weight per year is entered by the student themselves
            // since it is printed on their own certificate (see KuwaitiConstants for details).
            static object[] ToSubjectList(Dictionary<string, decimal> maxMarks) =>
                maxMarks.Select(kv => (object)new { name = kv.Key, maxMark = kv.Value }).ToArray();

            var kuwaitiConfig = new
            {
                grade_10 = ToSubjectList(KuwaitiConstants.Grade10MaxMarks),
                grade_11 = ToSubjectList(KuwaitiConstants.Grade11MaxMarks),
                grade_12 = ToSubjectList(KuwaitiConstants.Grade12MaxMarks),
                years_count_options = new[] { KuwaitiConstants.OneYear, KuwaitiConstants.TwoYears, KuwaitiConstants.ThreeYears }
            };

            return Ok(kuwaitiConfig);
        }

        [HttpGet("subjects-qatari")]
        public IActionResult GetQatariSubjectsConfig()
        {
            var qatariConfig = new
            {
                scientific = QatariConstants.ScientificTrackSubjects,
                max_mark_per_subject = SingleYearFixedTotalConstants.MaxMarkPerSubject,
                total_max = SingleYearFixedTotalConstants.TotalMaxMark,
                islamic_education_subject = SingleYearFixedTotalConstants.IslamicEducationSubject,
                scientific_track_name = QatariConstants.ScientificTrack
            };

            return Ok(qatariConfig);
        }

        [HttpGet("subjects-omani")]
        public IActionResult GetOmaniSubjectsConfig()
        {
            var omaniConfig = new
            {
                subjects = OmaniConstants.Subjects,
                max_mark_per_subject = SingleYearFixedTotalConstants.MaxMarkPerSubject,
                total_max = SingleYearFixedTotalConstants.TotalMaxMark,
                islamic_education_subject = SingleYearFixedTotalConstants.IslamicEducationSubject
            };

            return Ok(omaniConfig);
        }
    }
}
