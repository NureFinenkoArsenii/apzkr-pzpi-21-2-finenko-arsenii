using MongoDB.Bson.Serialization.Attributes;

namespace SmartWarDrones.Model
{
    public class ChangeDroneTypeModel
    {
        [BsonElement("DroneId")]
        public Guid DroneId { get; set; }
        public string NewDroneType { get; set; }
    }
}