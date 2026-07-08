using System.Text;
using KrediApp.Api;
using KrediApp.Business.Interfaces;
using KrediApp.Business.Kuyruk;
using KrediApp.Business.Services;
using KrediApp.Data;
using KrediApp.ML;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.ML;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles);
builder.Services.AddDbContext<KrediAppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("KrediAppDb")));

// Business katmanı servisleri
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IKullaniciService, KullaniciService>();
builder.Services.AddScoped<IKrediUrunuService, KrediUrunuService>();
builder.Services.AddScoped<IKrediBasvuruService, KrediBasvuruService>();
builder.Services.AddScoped<IKrediHesaplamaService, KrediHesaplamaService>();
builder.Services.AddScoped<IRiskDegerlendirmeService, RiskDegerlendirmeService>();

builder.Services.AddSingleton<BasvuruKuyrugu>();
builder.Services.AddHostedService<RiskDegerlendirmeWorker>();
builder.Services.AddPredictionEnginePool<CreditData, CreditPrediction>()
    .FromFile(filePath: "RiskModel.zip", watchForChanges: true);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"]!))
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularClient", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AngularClient");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
