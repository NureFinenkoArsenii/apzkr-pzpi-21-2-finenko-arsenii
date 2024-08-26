namespace SmartWarDrones.Model
{
    public class SensorDataModel
    {
        public Guid DroneId { get; set; }
        public double Temperature { get; set; }
        public double Humidity { get; set; }
        public double WindSpeed { get; set; }
        public string WindDirection { get; set; }
        public double BatteryLevel { get; set; }
        public bool REBPresence { get; set; }
    }
}