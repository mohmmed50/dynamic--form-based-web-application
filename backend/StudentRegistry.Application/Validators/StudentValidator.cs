using FluentValidation;
using StudentRegistry.Application.Constants;
using StudentRegistry.Application.DTOs;
using System;
using System.Linq;

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
                    grade.RuleFor(g => g.Coefficient).GreaterThan(0).WithMessage("المعامل يجب أن يكون أكبر من الصفر.");
                    grade.RuleFor(g => g.Achieved).InclusiveBetween(0, 100).WithMessage("الدرجة المحرزة يجب أن تكون بين 0 و 100.");
                });
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

            When(x => !IsSaudiCert(x.Certification) && !IsIgCert(x.Certification) && !IsKuwaitiCert(x.Certification), () =>
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

            When(x => IsKuwaitiCert(x.Certification), () =>
            {
                RuleFor(x => x.KuwaitiData)
                    .NotNull().WithMessage("بيانات الشهادة الكويتية مطلوبة.");

                When(x => x.KuwaitiData != null, () =>
                {
                    RuleFor(x => x.KuwaitiData!.YearsCount)
                        .Must(y => y == KuwaitiConstants.OneYear || y == KuwaitiConstants.TwoYears || y == KuwaitiConstants.ThreeYears)
                        .WithMessage("الرجاء اختيار عدد سنوات الدراسة (سنة واحدة أو سنتان أو ثلاث سنوات).");

                    bool IsOneYear(StudentCreateDto x) => x.KuwaitiData!.YearsCount == KuwaitiConstants.OneYear;
                    bool IsThreeYears(StudentCreateDto x) => x.KuwaitiData!.YearsCount == KuwaitiConstants.ThreeYears;

                    // Grade 10 is only required/considered when the student studied three years.
                    When(IsThreeYears, () =>
                    {
                        RuleFor(x => x.KuwaitiData!.Grade10Weight)
                            .NotNull().WithMessage("الرجاء إدخال نسبة الصف العاشر من المعدل التراكمي كما هي مدونة بالشهادة.")
                            .GreaterThan(0).WithMessage("نسبة الصف العاشر يجب أن تكون أكبر من الصفر.")
                            .LessThanOrEqualTo(100).WithMessage("نسبة الصف العاشر يجب ألا تتجاوز 100.");

                        RuleFor(x => x.KuwaitiData!.Grade10Subjects)
                            .Must(subjects => MatchesExactKuwaitiSubjectSet(subjects, KuwaitiConstants.Grade10MaxMarks.Keys))
                            .WithMessage("قائمة مواد الصف العاشر يجب أن تطابق تماماً المواد المعتمدة لهذا الصف، بدون نقص أو زيادة.");

                        RuleForEach(x => x.KuwaitiData!.Grade10Subjects)
                            .ChildRules(subject => ValidateKuwaitiSubjectRow(subject, KuwaitiConstants.Grade10MaxMarks));
                    });

                    // Grade 11 is not applicable at all for the "One Year" (grade 12 only) case.
                    When(x => !IsOneYear(x), () =>
                    {
                        RuleFor(x => x.KuwaitiData!.Grade11Weight)
                            .NotNull().WithMessage("الرجاء إدخال نسبة الصف الحادي عشر من المعدل التراكمي كما هي مدونة بالشهادة.")
                            .GreaterThan(0).WithMessage("نسبة الصف الحادي عشر يجب أن تكون أكبر من الصفر.")
                            .LessThanOrEqualTo(100).WithMessage("نسبة الصف الحادي عشر يجب ألا تتجاوز 100.");

                        RuleFor(x => x.KuwaitiData!.Grade12Weight)
                            .NotNull().WithMessage("الرجاء إدخال نسبة الصف الثاني عشر من المعدل التراكمي كما هي مدونة بالشهادة.")
                            .GreaterThan(0).WithMessage("نسبة الصف الثاني عشر يجب أن تكون أكبر من الصفر.")
                            .LessThanOrEqualTo(100).WithMessage("نسبة الصف الثاني عشر يجب ألا تتجاوز 100.");

                        RuleFor(x => x.KuwaitiData)
                            .Must(WeightsSumToOneHundred)
                            .WithMessage("مجموع نسب السنوات المدخلة (كما هي مدونة بالشهادة) يجب أن يساوي 100%.");

                        RuleFor(x => x.KuwaitiData!.Grade11Subjects)
                            .Must(subjects => MatchesExactKuwaitiSubjectSet(subjects, KuwaitiConstants.Grade11MaxMarks.Keys))
                            .WithMessage("قائمة مواد الصف الحادي عشر يجب أن تطابق تماماً المواد المعتمدة لهذا الصف، بدون نقص أو زيادة.");

                        RuleForEach(x => x.KuwaitiData!.Grade11Subjects)
                            .ChildRules(subject => ValidateKuwaitiSubjectRow(subject, KuwaitiConstants.Grade11MaxMarks));
                    });

                    // Grade 12 is always required, regardless of years count.
                    RuleFor(x => x.KuwaitiData!.Grade12Subjects)
                        .Must(subjects => MatchesExactKuwaitiSubjectSet(subjects, KuwaitiConstants.Grade12MaxMarks.Keys))
                        .WithMessage("قائمة مواد الصف الثاني عشر يجب أن تطابق تماماً المواد المعتمدة لهذا الصف، بدون نقص أو زيادة.");

                    RuleForEach(x => x.KuwaitiData!.Grade12Subjects)
                        .ChildRules(subject => ValidateKuwaitiSubjectRow(subject, KuwaitiConstants.Grade12MaxMarks));
                });
            });
        }

        private bool WeightsSumToOneHundred(KuwaitiDataCreateDto? data)
        {
            if (data == null) return false;
            if (data.YearsCount == KuwaitiConstants.OneYear) return true; // grade 12 alone carries 100%
            decimal sum = data.Grade11Weight ?? 0;
            sum += data.Grade12Weight ?? 0;
            if (data.YearsCount == KuwaitiConstants.ThreeYears)
                sum += data.Grade10Weight ?? 0;
            return Math.Abs(sum - 100m) <= 0.01m;
        }

        private void ValidateKuwaitiSubjectRow(
            InlineValidator<KuwaitiSubjectGradeCreateDto> subject,
            System.Collections.Generic.Dictionary<string, decimal> maxMarks)
        {
            subject.RuleFor(g => g.SubjectName)
                .NotEmpty().WithMessage("اسم المادة مطلوب.")
                .Must(NotBeExcludedKuwaitiSubject).WithMessage("هذه المادة غير محتسبة في معادلة الشهادة الكويتية.");

            subject.RuleFor(g => g.Obtained)
                .GreaterThanOrEqualTo(0).WithMessage("الدرجة المتحصلة يجب أن تكون أكبر من أو تساوي الصفر.");

            subject.RuleFor(g => g)
                .Must(g => maxMarks.TryGetValue(g.SubjectName ?? string.Empty, out var max) && g.Obtained <= max)
                .WithMessage("الدرجة المتحصلة يجب ألا تتجاوز الدرجة العظمى الرسمية لهذه المادة.");
        }

        private bool MatchesExactKuwaitiSubjectSet(
            System.Collections.Generic.List<KuwaitiSubjectGradeCreateDto>? subjects,
            System.Collections.Generic.ICollection<string> required)
        {
            if (subjects == null) return false;
            var names = subjects.Select(s => s.SubjectName).ToList();
            if (names.Count != required.Count) return false;
            return required.All(r => names.Contains(r)) && names.All(n => required.Contains(n));
        }

        private bool NotBeExcludedKuwaitiSubject(string subjectName)
        {
            if (string.IsNullOrEmpty(subjectName)) return true;
            return !KuwaitiConstants.ExcludedSubjects.Contains(subjectName);
        }

        private bool IsKuwaitiCert(string cert)
        {
            if (string.IsNullOrEmpty(cert)) return false;
            return cert.Contains("كويتية") || cert.Equals("kuwaiti", StringComparison.OrdinalIgnoreCase);
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
    }
}
