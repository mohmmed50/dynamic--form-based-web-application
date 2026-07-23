using AutoMapper;
using StudentRegistry.Application.DTOs;
using StudentRegistry.Domain.Entities;
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
                .ForMember(dest => dest.StandardGrades, opt => opt.MapFrom(src => src.StandardGrades));

            CreateMap<SaudiStudentTotals, SaudiTotalsResponseDto>();
            CreateMap<SaudiStudentGrades, SaudiGradeResponseDto>();
            
            CreateMap<IgStudentGrades, IgGradesResponseDto>()
                .ForMember(dest => dest.GradeCounts, opt => opt.MapFrom(src => src.Student.IgGradeCounts));
                
            CreateMap<IgStudentGradeCounts, IgGradeCountResponseDto>();
            CreateMap<StandardStudentGrades, StandardGradeResponseDto>();

            // CreateDTO -> Entity mapping
            CreateMap<StudentCreateDto, Student>()
                .ForMember(dest => dest.PhotoPath, opt => opt.Ignore()) // Managed by storage service
                .ForMember(dest => dest.SaudiTotals, opt => opt.Ignore())
                .ForMember(dest => dest.SaudiGrades, opt => opt.Ignore())
                .ForMember(dest => dest.IgGrades, opt => opt.Ignore())
                .ForMember(dest => dest.IgGradeCounts, opt => opt.Ignore())
                .ForMember(dest => dest.StandardGrades, opt => opt.Ignore());

            // Coefficient is server-computed and validated (Weighted / Achieved) in StudentService,
            // not mapped directly from client input.
            CreateMap<SaudiGradeCreateDto, SaudiStudentGrades>()
                .ForMember(dest => dest.Coefficient, opt => opt.Ignore());

            CreateMap<IgGradeCountCreateDto, IgStudentGradeCounts>();
            
            CreateMap<StandardGradeCreateDto, StandardStudentGrades>()
                .ForMember(dest => dest.Achieved, opt => opt.MapFrom(src => (src.Grade * src.WeightedPercentage) / 100));
        }
    }
}
