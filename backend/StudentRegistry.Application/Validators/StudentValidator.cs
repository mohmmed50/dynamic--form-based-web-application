using FluentValidation;
using StudentRegistry.Application.DTOs;
using System;

namespace StudentRegistry.Application.Validators
{
    public class StudentCreateDtoValidator : AbstractValidator<StudentCreateDto>
    {
        public StudentCreateDtoValidator()
        {
            RuleFor(x => x.StudentName)
                .NotEmpty().WithMessage("الرجاء إدخال اسم الطالب كاملاً.")
                .MaximumLength(100).WithMessage("يجب ألا يزيد اسم الطالب عن 100 حرف.")
                .Must(NotContainHtml).WithMessage("اسم الطالب غير صالح ولا يمكن أن يحتوي على رموز أو وسوم HTML.");

            RuleFor(x => x.StudentNameEn)
                .NotEmpty().WithMessage("الرجاء إدخال اسم الطالب بالإنجليزية.")
                .MaximumLength(100).WithMessage("يجب ألا يزيد الاسم بالإنجليزية عن 100 حرف.")
                .Must(NotContainHtml).WithMessage("الاسم بالإنجليزية غير صالح ولا يمكن أن يحتوي على رموز أو وسوم HTML.");

            RuleFor(x => x.NationalId)
                .NotEmpty().WithMessage("الرجاء إدخال الرقم القومي.")
                .Length(8, 20).WithMessage("الرجاء إدخال رقم قومي صحيح (بين 8 و 20 خانة).")
                .Must(NotContainHtml).WithMessage("الرقم القومي غير صالح ولا يمكن أن يحتوي على رموز أو وسوم HTML.");

            RuleFor(x => x.Phone)
                .NotEmpty().WithMessage("الرجاء إدخال رقم هاتف الطالب.")
                .Matches(@"^[0-9+\s]{8,20}$").WithMessage("الرجاء إدخال رقم هاتف صحيح.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("الرجاء إدخال البريد الإلكتروني.")
                .EmailAddress().WithMessage("الرجاء إدخال بريد إلكتروني صحيح.");

            RuleFor(x => x.GuardianName)
                .NotEmpty().WithMessage("الرجاء إدخال اسم ولي الأمر.")
                .MaximumLength(100).WithMessage("يجب ألا يزيد اسم ولي الأمر عن 100 حرف.")
                .Must(NotContainHtml).WithMessage("اسم ولي الأمر غير صالح ولا يمكن أن يحتوي على رموز أو وسوم HTML.");

            RuleFor(x => x.GuardianPhone)
                .NotEmpty().WithMessage("الرجاء إدخال رقم هاتف ولي الأمر.")
                .Matches(@"^[0-9+\s]{8,20}$").WithMessage("الرجاء إدخال رقم هاتف صحيح لولي الأمر.");

            RuleFor(x => x.GuardianRelation)
                .NotEmpty().WithMessage("الرجاء اختيار صلة القرابة بولي الأمر.");

            RuleFor(x => x.AddressGov)
                .NotEmpty().WithMessage("الرجاء اختيار المحافظة.");

            RuleFor(x => x.AddressCenter)
                .NotEmpty().WithMessage("الرجاء إدخال المركز/القسم.");

            RuleFor(x => x.AddressStreet)
                .NotEmpty().WithMessage("الرجاء إدخال اسم الشارع.");

            RuleFor(x => x.AddressBuilding)
                .NotEmpty().WithMessage("الرجاء إدخال رقم المبنى.");

            RuleFor(x => x.Certification)
                .NotEmpty().WithMessage("الرجاء اختيار نوع الشهادة المعادلة.");

            RuleFor(x => x.Track)
                .NotEmpty().WithMessage("الرجاء اختيار المسار الأكاديمي.");

            RuleFor(x => x.Photo)
                .NotEmpty().WithMessage("الرجاء إضافة الصورة الشخصية للطالب قبل الإرسال.")
                .Must(StartWithBase64Header).WithMessage("تنسيق الصورة غير صالح. يجب أن تكون بصيغة JPG أو PNG أو WebP.");

            // Conditionals based on Certification Type
            When(x => IsSaudiCert(x.Certification), () =>
            {
                RuleFor(x => x.YearsCount)
                    .NotEmpty().WithMessage("الرجاء اختيار عدد سنوات الدراسة التراكمية.");

                RuleFor(x => x.SaudiGrades)
                    .NotEmpty().WithMessage("الرجاء إدخال درجات المواد.")
                    .Must(grades => grades != null && grades.Count > 0).WithMessage("جدول درجات المواد فارغ.");

                RuleForEach(x => x.SaudiGrades).ChildRules(grade =>
                {
                    grade.RuleFor(g => g.YearLabel).NotEmpty();
                    grade.RuleFor(g => g.SubjectName).NotEmpty().WithMessage("اسم المادة مطلوب.");
                    grade.RuleFor(g => g.Achieved).GreaterThan(0).WithMessage("الدرجة المتحصلة يجب أن تكون أكبر من الصفر.");
                    grade.RuleFor(g => g.Weighted).GreaterThan(0).WithMessage("الدرجة الموزونة يجب أن تكون أكبر من الصفر.");
                    grade.RuleFor(g => g)
                        .Must(HaveWholeNumberCoefficient)
                        .WithMessage(g => $"درجات مادة \"{g.SubjectName}\" غير صحيحة: الموزونة يجب أن تكون من مضاعفات المتحصلة (المعامل = الموزونة ÷ المتحصلة يجب أن يكون رقماً صحيحاً).");
                });

                RuleFor(x => x.AptitudeScore)
                    .NotNull().WithMessage("الرجاء إدخال درجة القدرات.");

                RuleFor(x => x.AptitudeScore!.Value)
                    .InclusiveBetween(0, 100).WithMessage("درجة القدرات يجب أن تكون بين 0 و 100.")
                    .When(x => x.AptitudeScore.HasValue);
            });

            When(x => IsIgCert(x.Certification), () =>
            {
                RuleFor(x => x.IgProgram)
                    .NotEmpty().WithMessage("الرجاء تحديد برنامج الـ IG.");

                RuleFor(x => x.IgGradeCounts)
                    .NotEmpty().WithMessage("الرجاء تحديد توزيع الدرجات الأكاديمية لحساب المجموع.")
                    .Must(counts => counts != null && counts.Count > 0).WithMessage("توزيع الدرجات فارغ.");

                RuleFor(x => x.Factor)
                    .NotNull().WithMessage("قيمة المعامل النسبي مطلوبة.")
                    .GreaterThan(0).WithMessage("قيمة المعامل النسبي يجب أن تكون أكبر من الصفر.");

                RuleFor(x => x.SportsBonus)
                    .NotNull().WithMessage("نسبة الحافز الرياضي مطلوبة.")
                    .InclusiveBetween(0, 30).WithMessage("نسبة الحافز الرياضي يجب أن تكون بين 0 و 30%.");

                RuleForEach(x => x.IgGradeCounts).ChildRules(count =>
                {
                    count.RuleFor(c => c.GradeType).NotEmpty();
                    count.RuleFor(c => c.Grade).NotEmpty();
                    count.RuleFor(c => c.Count).GreaterThanOrEqualTo(0);
                });
            });

            When(x => !IsSaudiCert(x.Certification) && !IsIgCert(x.Certification), () =>
            {
                RuleFor(x => x.YearOfStudy)
                    .NotEmpty().WithMessage("الرجاء اختيار السنة الدراسية.");

                RuleFor(x => x.StandardGrades)
                    .NotEmpty().WithMessage("الرجاء إدخال درجات المواد.")
                    .Must(grades => grades != null && grades.Count > 0).WithMessage("جدول درجات المواد فارغ.");

                RuleForEach(x => x.StandardGrades).ChildRules(grade =>
                {
                    grade.RuleFor(g => g.SubjectName).NotEmpty().WithMessage("اسم المادة مطلوب.");
                    grade.RuleFor(g => g.Grade).InclusiveBetween(0, 100).WithMessage("الدرجة يجب أن تكون بين 0 و 100.");
                    grade.RuleFor(g => g.WeightedPercentage).InclusiveBetween(0, 100).WithMessage("النسبة الموزونة يجب أن تكون بين 0 و 100.");
                });
            });
        }

        private bool StartWithBase64Header(string photo)
        {
            if (string.IsNullOrEmpty(photo)) return false;
            return photo.StartsWith("data:image/jpeg;base64,") ||
                   photo.StartsWith("data:image/jpg;base64,") ||
                   photo.StartsWith("data:image/png;base64,") ||
                   photo.StartsWith("data:image/webp;base64,");
        }

        private bool NotContainHtml(string text)
        {
            if (string.IsNullOrEmpty(text)) return true;
            return !text.Contains("<") && !text.Contains(">");
        }

        private bool IsSaudiCert(string cert)
        {
            if (string.IsNullOrEmpty(cert)) return false;
            return cert.Contains("سعودية") || cert.Equals("Saudi Certificate", StringComparison.OrdinalIgnoreCase);
        }

        private bool IsIgCert(string cert)
        {
            if (string.IsNullOrEmpty(cert)) return false;
            return cert.Contains("IG") || cert.Equals("ig", StringComparison.OrdinalIgnoreCase);
        }

        private bool HaveWholeNumberCoefficient(SaudiGradeCreateDto grade)
        {
            if (grade.Achieved <= 0) return false;
            var coefficient = grade.Weighted / grade.Achieved;
            return Math.Abs(coefficient - Math.Round(coefficient)) < 0.001m;
        }
    }
}
