using AutoMapper;
using StudentRegistry.Application.Constants;
using StudentRegistry.Application.DTOs;
using StudentRegistry.Domain.Entities;
using System;
using System.Linq;

namespace StudentRegistry.Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Entity -> DTO mapping
            CreateMap<Student, StudentResponseDto>()
                .ForMember(dest => dest.IgGrades, opt => opt.MapFrom(src => src.IgGrades))
                .ForMember(dest => dest.SaudiGrades, opt => opt.MapFrom(src => src.SaudiGrades))
                .ForMember(dest => dest.StandardGrades, opt => opt.MapFrom(src => src.StandardGrades.Where(g => g.GradeLevel == null)))
                .ForMember(dest => dest.KuwaitiGrades, opt => opt.MapFrom(src => src.KuwaitiTotals != null ? src.StandardGrades.Where(g => g.GradeLevel != null) : Enumerable.Empty<StandardStudentGrades>()))
                .ForMember(dest => dest.QatariGrades, opt => opt.MapFrom(src => src.QatariTotals != null ? src.StandardGrades.Where(g => g.GradeLevel != null) : Enumerable.Empty<StandardStudentGrades>()))
                .ForMember(dest => dest.OmaniGrades, opt => opt.MapFrom(src => src.OmaniTotals != null ? src.StandardGrades.Where(g => g.GradeLevel != null) : Enumerable.Empty<StandardStudentGrades>()))
                .ForMember(dest => dest.YemeniGrades, opt => opt.MapFrom(src => src.YemeniTotals != null ? src.StandardGrades.Where(g => g.GradeLevel != null) : Enumerable.Empty<StandardStudentGrades>()))
                .ForMember(dest => dest.KuwaitiTotals, opt => opt.MapFrom(src => src.KuwaitiTotals))
                .ForMember(dest => dest.QatariTotals, opt => opt.MapFrom(src => src.QatariTotals))
                .ForMember(dest => dest.OmaniTotals, opt => opt.MapFrom(src => src.OmaniTotals))
                .ForMember(dest => dest.YemeniTotals, opt => opt.MapFrom(src => src.YemeniTotals));

            CreateMap<SaudiStudentTotals, SaudiTotalsResponseDto>();
            CreateMap<SaudiStudentGrades, SaudiGradeResponseDto>();

            CreateMap<IgStudentGrades, IgGradesResponseDto>()
                .ForMember(dest => dest.GradeCounts, opt => opt.MapFrom(src => src.Student.IgGradeCounts));

            CreateMap<IgStudentGradeCounts, IgGradeCountResponseDto>();
            CreateMap<StandardStudentGrades, StandardGradeResponseDto>();

            CreateMap<KuwaitiStudentTotals, KuwaitiTotalsResponseDto>()
                .ForMember(dest => dest.Disclaimer, opt => opt.MapFrom(_ => KuwaitiConstants.Disclaimer))
                .ForMember(dest => dest.SecondAttemptWarning,
                    opt => opt.MapFrom(src => src.HasSecondAttempt ? KuwaitiConstants.SecondAttemptWarning : null));

            CreateMap<StandardStudentGrades, KuwaitiGradeResponseDto>()
                .ForMember(dest => dest.GradeLevel, opt => opt.MapFrom(src => src.GradeLevel!.Value))
                .ForMember(dest => dest.Obtained, opt => opt.MapFrom(src => src.Grade))
                .ForMember(dest => dest.MaxMark, opt => opt.MapFrom(src => src.MaxMark!.Value));

            CreateMap<QatariStudentTotals, QatariTotalsResponseDto>()
                .ForMember(dest => dest.Disclaimer, opt => opt.MapFrom(_ => KuwaitiConstants.Disclaimer));

            CreateMap<OmaniStudentTotals, OmaniTotalsResponseDto>()
                .ForMember(dest => dest.Disclaimer, opt => opt.MapFrom(_ => KuwaitiConstants.Disclaimer));

            CreateMap<YemeniStudentTotals, YemeniTotalsResponseDto>()
                .ForMember(dest => dest.Disclaimer, opt => opt.MapFrom(_ => KuwaitiConstants.Disclaimer));

            CreateMap<StandardStudentGrades, SingleYearSubjectMarkResponseDto>()
                .ForMember(dest => dest.Mark, opt => opt.MapFrom(src => src.Grade));

            // CreateDTO -> Entity mapping
            CreateMap<StudentCreateDto, Student>()
                .ForMember(dest => dest.PhotoPath, opt => opt.Ignore()) // Managed by storage service
                .ForMember(dest => dest.SaudiTotals, opt => opt.Ignore())
                .ForMember(dest => dest.SaudiGrades, opt => opt.Ignore())
                .ForMember(dest => dest.IgGrades, opt => opt.Ignore())
                .ForMember(dest => dest.IgGradeCounts, opt => opt.Ignore())
                .ForMember(dest => dest.StandardGrades, opt => opt.Ignore())
                .ForMember(dest => dest.KuwaitiTotals, opt => opt.Ignore())
                .ForMember(dest => dest.QatariTotals, opt => opt.Ignore())
                .ForMember(dest => dest.OmaniTotals, opt => opt.Ignore())
                .ForMember(dest => dest.YemeniTotals, opt => opt.Ignore());

            CreateMap<SaudiGradeCreateDto, SaudiStudentGrades>()
                .ForMember(dest => dest.Weighted, opt => opt.MapFrom(src => src.Achieved * src.Coefficient));

            CreateMap<IgGradeCountCreateDto, IgStudentGradeCounts>();
            
            CreateMap<StandardGradeCreateDto, StandardStudentGrades>()
                .ForMember(dest => dest.Achieved, opt => opt.MapFrom(src => (src.Grade * src.WeightedPercentage) / 100));
        }
    }
}
