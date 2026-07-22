using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using StudentRegistry.API.Middleware;
using StudentRegistry.Application.Interfaces;
using StudentRegistry.Application.Mappings;
using StudentRegistry.Application.Services;
using StudentRegistry.Application.Validators;
using StudentRegistry.Data.DbContext;
using StudentRegistry.Domain.Interfaces;
using StudentRegistry.Infrastructure.Storage;
using StudentRegistry.Repository.Implementations;
using System.IO;

var builder = WebApplication.CreateBuilder(args);

// 1. Configure services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure SQL Server 2017 DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<StudentRegistryDbContext>(options =>
    options.UseSqlServer(connectionString, sqlOptions => 
        sqlOptions.MigrationsAssembly("StudentRegistry.Data")));

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularFrontend", policy =>
    {
        policy.WithOrigins(builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? new[] { "http://localhost:4200" })
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configure Dependency Injection Layers
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IStudentRepository, StudentRepository>();
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<IFileStorageService, FileStorageService>();

// Register AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile).Assembly);

// Register FluentValidation
builder.Services.AddValidatorsFromAssembly(typeof(StudentCreateDtoValidator).Assembly);

var app = builder.Build();

// 2. Configure HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Global Exception Handler Middleware
app.UseMiddleware<ExceptionMiddleware>();

// Enable serving uploads folder static files (e.g. localhost:5000/uploads/file.png)
app.UseStaticFiles();

app.UseRouting();

app.UseCors("AllowAngularFrontend");

app.UseAuthorization();

app.MapControllers();

// Ensure wwwroot/uploads directory exists on startup
var uploadsPath = Path.Combine(app.Environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

app.Run();
