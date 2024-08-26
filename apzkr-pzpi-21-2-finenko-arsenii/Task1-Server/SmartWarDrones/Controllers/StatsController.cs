using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SmartWarDrones.Model;
using SmartWarDrones.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SmartWarDrones.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatsController : ControllerBase
    {
        private readonly StatsRepository _stateRepository;
        private readonly DroneRepository _droneRepository;
        private readonly IHubContext<StatsHub> _hubContext;

        public StatsController(StatsRepository stateRepository, DroneRepository droneRepository, IHubContext<StatsHub> hubContext)
        {
            _stateRepository = stateRepository;
            _droneRepository = droneRepository;
            _hubContext = hubContext; // Правильная инициализация _hubContext
        }

        [HttpGet]
        [Route("get/{id}")]
        public IActionResult GetStatsById(Guid id)
        {
            var stats = _stateRepository.GetById(id);
            if (stats == null)
                return NotFound(new { Error = "Stats not found" });

            var response = new StatsResponseModel
            {
                StatsType = stats.StatsType,
                StatsInformation = stats.StatsInformation
            };

            return Ok(response);
        }

        [HttpGet]
        [Route("getByDroneId/{droneId}")]
        public IActionResult GetStatsByDroneId(Guid droneId)
        {
            var stats = _stateRepository.GetByDroneId(droneId);
            if (stats == null || stats.Count == 0)
                return NotFound(new { Error = "No stats found for this drone" });

            var response = stats.Select(s => new StatsResponseModel
            {
                StatsType = s.StatsType,
                StatsInformation = s.StatsInformation
            });

            return Ok(response);
        }

        [HttpGet]
        [Route("getByDroneName/{droneName}")]
        public IActionResult GetStatsByDroneName(string droneName)
        {
            var drone = _droneRepository.GetByDroneName(droneName);
            if (drone == null)
                return NotFound(new { Error = "Drone not found" });

            var stats = _stateRepository.GetByDroneId(drone.DroneId);
            if (stats == null || stats.Count == 0)
                return NotFound(new { Error = "No stats found for this drone" });

            var response = stats.Select(s => new StatsResponseModel
            {
                StatsType = s.StatsType,
                StatsInformation = s.StatsInformation
            });

            return Ok(response);
        }

        [HttpPut]
        [Route("updateByDroneIdAndStatsType/{droneId}")]
        public async Task<IActionResult> UpdateStatsByDroneIdAndStatsType(Guid droneId, [FromBody] UpdateStatsModel model)
        {
            var stats = _stateRepository.GetByDroneIdAndStatsType(droneId, model.StatsType);
            if (stats == null)
                return NotFound(new { Error = "Stats not found for the given DroneId and StatsType" });

            stats.StatsInformation = model.StatsInformation;
            stats.LastUpdate = DateTime.UtcNow;

            _stateRepository.Update(stats);

            // Відправляємо оновлення клієнтам через SignalR
            await _hubContext.Clients.All.SendAsync("ReceiveStatsUpdate", new
            {
                droneId = droneId,
                statsType = model.StatsType,
                statsInformation = model.StatsInformation
            });

            return Ok(stats);
        }

        [HttpPost]
        [Route("updateSensorData")]
        public async Task<IActionResult> UpdateSensorData([FromBody] SensorDataModel sensorData)
        {
            var drone = _droneRepository.GetById(sensorData.DroneId);
            if (drone == null)
                return NotFound(new { Error = "Drone not found" });

            var statsTypes = new[]
            {
                new { Type = "Temperature", Value = sensorData.Temperature.ToString() },
                new { Type = "Humidity", Value = sensorData.Humidity.ToString() },
                new { Type = "WindSpeed", Value = sensorData.WindSpeed.ToString() },
                new { Type = "WindDirection", Value = sensorData.WindDirection },
                new { Type = "BatteryLevel", Value = sensorData.BatteryLevel.ToString() },
                new { Type = "REBPresence", Value = sensorData.REBPresence.ToString() }
            };

            foreach (var statsType in statsTypes)
            {
                var stats = _stateRepository.GetByDroneIdAndStatsType(sensorData.DroneId, statsType.Type);
                if (stats != null)
                {
                    stats.StatsInformation = statsType.Value;
                    stats.LastUpdate = DateTime.UtcNow;
                    _stateRepository.Update(stats);
                }
                else
                {
                    var newStats = new Stats
                    {
                        Id = Guid.NewGuid(),
                        DroneId = sensorData.DroneId,
                        StatsType = statsType.Type,
                        StatsInformation = statsType.Value,
                        LastUpdate = DateTime.UtcNow
                    };
                    _stateRepository.Insert(newStats);
                }
            }

            return Ok(new { Message = "Sensor data updated successfully" });
        }
    }
}