using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SmartWarDrones.Model
{
    public class Drone
    {
        [BsonId]
        public Guid DroneId { get; set; }
        [BsonElement("droneName")]
        public string DroneName { get; set; }
        [BsonElement("droneType")]
        public string DroneType { get; set; }
        [BsonElement("safetyCode")]
        public string SafetyCode { get; set; }
    }
}