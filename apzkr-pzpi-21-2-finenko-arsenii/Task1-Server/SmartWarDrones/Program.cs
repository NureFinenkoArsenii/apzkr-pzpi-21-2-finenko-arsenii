using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.SignalR;
using Microsoft.IdentityModel.Tokens;
using SmartWarDrones.Auth;
using SmartWarDrones.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddScoped<DroneRepository>();
builder.Services.AddScoped<StatsRepository>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR(); // Додаємо SignalR

// Налаштування CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder => builder
            .WithOrigins("http://localhost:3000") // Домен фронтенду
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()); // Дозволяє запити з обліковими даними
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
             .AddJwtBearer(options =>
             {
                 options.RequireHttpsMetadata = false;
                 options.TokenValidationParameters = new
     TokenValidationParameters
                 {
                     ValidateIssuer = true,
                     ValidIssuer = AuthOptions.Issuer,
                     ValidateAudience = true,
                     ValidAudience =
    AuthOptions.Audience,
                     ValidateLifetime = true,
                     IssuerSigningKey =
    AuthOptions.GetSymmetricSecurityKey(),
                     ValidateIssuerSigningKey = true
                 };
             });

builder.Services.BuildServiceProvider()
            .GetRequiredService<DroneRepository>()
            .CreateIndexes();
builder.Services.BuildServiceProvider()
.GetRequiredService<StatsRepository>()
.CreateIndexes();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Використовуємо політику CORS перед аутентифікацією та авторизацією
app.UseCors("AllowSpecificOrigin");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<StatsHub>("/statshub"); // Додаємо мапінг для SignalR хаба

app.Urls.Add("http://*:5000");

app.Run();