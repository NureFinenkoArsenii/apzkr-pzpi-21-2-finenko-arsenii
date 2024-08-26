using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using SmartWarDrones.Model;
using System;
using System.Threading.Tasks;

namespace SmartWarDrones.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SensorController : ControllerBase
    {
        private readonly StatsController _stateController;

        public SensorController(StatsController statsController)
        {
            _stateController = statsController;
        }

        [HttpPost]
        [Route("receiveSensorData")]
        public async Task<IActionResult> ReceiveSensorData([FromBody] SensorDataModel sensorData)
        {
            try
            {
                // Оновлюємо статистику для відповідного дрона
                var result = await _stateController.UpdateSensorData(sensorData);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = "Failed to process sensor data: " + ex.Message });
            }
        }
    }
}