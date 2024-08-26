using MongoDB.Bson.Serialization.Attributes;

namespace SmartWarDrones.Model
{
    public class ChangeDroneNameModel
    {
        [BsonElement("DroneId")]
        public Guid DroneId { get; set; }
        public string NewDroneName { get; set; }
    }
}