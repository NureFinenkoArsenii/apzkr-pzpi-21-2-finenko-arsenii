using MongoDB.Bson.Serialization.Attributes;

namespace SmartWarDrones.Model
{
    public class Stats
    {
        [BsonId]
        public Guid Id { get; set; }
        [BsonElement("statsType")]
        public string StatsType { get; set; }
        [BsonElement("statsInformation")]
        public string StatsInformation { get; set; }
        [BsonElement("DroneId")]
        public Guid DroneId { get; set; }
        [BsonElement("lastUpd")]
        public DateTime? LastUpdate { get; set; }
    }
}
