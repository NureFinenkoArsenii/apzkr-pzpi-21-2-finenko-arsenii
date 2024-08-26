using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using SmartWarDrones.Auth;
using SmartWarDrones.Model;
using SmartWarDrones.Repositories;
namespace SmartWarDrones.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DroneController : ControllerBase
    {
        private readonly DroneRepository droneRepository; 
        private readonly StatsRepository _stateRepository;
        public DroneController(DroneRepository droneRepository, StatsRepository _stateRepository)
        {
            this.droneRepository = droneRepository;
            this._stateRepository = _stateRepository;
        }
        [HttpPost]
        [Route("register")]
        public IActionResult Register(DroneApiModel model)
        {
            var existing = droneRepository.GetByDroneName(model.DroneName);
            if (existing != null)
                return BadRequest(new
                {
                    Error = "Drone already exists"
                });

            var dbDrone = droneRepository.Insert(new Drone()
            {
                DroneName = model.DroneName,
                DroneType = model.DroneType,
                SafetyCode = model.SafetyCode
            });

            // Create initial stats for the drone
            var statsTypes = new List<string>
            {
                "Humidity",
                "Temperature",
                "WindDirection",
                "WindSpeed",
                "REBPresence",
                "BatteryLevel"
            };

            foreach (var statsType in statsTypes)
            {
                var stats = new Stats
                {
                    StatsType = statsType,
                    StatsInformation = "Initial value",
                    DroneId = dbDrone.DroneId,
                    LastUpdate = DateTime.UtcNow
                };
                _stateRepository.Insert(stats);
            }

            return Ok(new DroneResponseModel
            {
                Id = dbDrone.DroneId,
                DroneName = dbDrone.DroneName,
                DroneType = dbDrone.DroneType
            });
        }
        [HttpPost]
        [Route("login")]
        public IActionResult Login([FromBody] DroneApiModel
       model)
        {
            var drone =
droneRepository.GetByDroneNameAndSafetyCode(model.DroneName,
model.SafetyCode);
            if (drone == null)
                return BadRequest(new
                {
                    Error = "Drone not exists"
                });
            var identity = GetIdentity(drone.DroneName, "Drone");
            var token = JWTTokenizer.GetEncodedJWT(identity, AuthOptions.Lifetime);
            return new JsonResult(new
            {
                JWT = token
            });
        }
        [HttpGet]
        [Route("getAll")]
        public IActionResult GetAll()
        {
            var drones = droneRepository.GetAll()
            .Select(x => new DroneResponseModel
            {
                Id = x.DroneId,
                DroneName = x.DroneName,
                DroneType = x.DroneType
            });
            return Ok(drones);
        }
        [HttpGet]
        [Route("getAllByType/{droneType}")]
        public IActionResult GetAllByType(string droneType)
        {
            var drones = droneRepository.GetAllByDroneType(droneType);
            if (drones == null || drones.Count == 0)
            {
                return NotFound(new { Error = "No drones found with the specified type" });
            }

            var result = drones.Select(x => new DroneResponseModel
            {
                Id = x.DroneId,
                DroneName = x.DroneName,
                DroneType = x.DroneType
            });

            return Ok(result);
        }
        [HttpPut("changeDroneName")]
        public ActionResult ChangeDroneName([FromBody] ChangeDroneNameModel changeDroneNameModel)
        {
            var drone = droneRepository.GetById(changeDroneNameModel.DroneId);
            if (drone == null)
            {
                return NotFound("Drone not found.");
            }

            drone.DroneName = changeDroneNameModel.NewDroneName;
            droneRepository.Update(drone);

            return NoContent();
        }
        [HttpPut("changeDroneType")]
        public ActionResult ChangeDroneType([FromBody] ChangeDroneTypeModel changeDroneTypeModel)
        {
            var drone = droneRepository.GetById(changeDroneTypeModel.DroneId);
            if (drone == null)
            {
                return NotFound("Drone not found.");
            }

            drone.DroneType = changeDroneTypeModel.NewDroneType;
            droneRepository.Update(drone);

            return NoContent();
        }
        [HttpDelete]
        [Route("deleteByDroneName/{droneName}")]
        public IActionResult DeleteByDroneName(string droneName)
        {
            var drone = droneRepository.GetByDroneName(droneName);
            if (drone == null)
            {
                return NotFound(new { Error = "Drone not found" });
            }

            droneRepository.DeleteByName(droneName);
            return NoContent();
        }
        private ClaimsIdentity GetIdentity(string name, string
       type)
        {
            var claims = new List<Claim>
 {
 new
Claim(ClaimsIdentity.DefaultNameClaimType, name),
 new
Claim(ClaimsIdentity.DefaultRoleClaimType, type)
 };
            ClaimsIdentity claimsIdentity = new
           ClaimsIdentity(claims, "Token",
            ClaimsIdentity.DefaultNameClaimType,
           ClaimsIdentity.DefaultRoleClaimType);
            return claimsIdentity;
        }
    }
}