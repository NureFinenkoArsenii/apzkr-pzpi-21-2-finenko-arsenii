using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using SmartWarDrones.Model;
using System;
using System.Collections.Generic;
using System.Linq;
namespace SmartWarDrones.Repositories
{
    public class DroneRepository
    {
        private readonly IMongoCollection<Drone> collection;
        public DroneRepository()
        {
            collection = new MongoClient("mongodb://localhost:27017")
            .GetDatabase("swd_db")
            .GetCollection<Drone>("drones");
        }
        public Drone Insert(Drone drone)
        {
            var existingUser = GetByDroneName(drone.DroneName);
            if (existingUser != null)
                throw new Exception("Drone with same name already exists");
            drone.DroneId = Guid.NewGuid();
            collection.InsertOne(drone);
            return drone;
        }
        public IReadOnlyCollection<Drone> GetAll()
        {
            return collection
            .Find(x => true)
           .ToList();
        }

        public IReadOnlyCollection<Drone> GetAllByDroneType(string dronetype)
        {
            return collection.Find(x => x.DroneType == dronetype).ToList();
        }
        public Drone GetById(Guid droneid)
        {
            return collection
            .Find(x => x.DroneId == droneid)
            .FirstOrDefault();
        }
        public Drone GetByDroneName(string dronename)
        {
            return collection
            .Find(x => x.DroneName == dronename)
           .FirstOrDefault();
        }
        public Drone GetByDroneNameAndSafetyCode(string dronename,
       string safetycode)
        {
            return collection
            .Find(x => x.DroneName == dronename &&
            x.SafetyCode == safetycode)
            .FirstOrDefault();
        }

        public Drone GetByDroneNameAndDroneType(string dronename,
string dronetype)
        {
            return collection
            .Find(x => x.DroneName == dronename &&
            x.DroneType == dronetype)
            .FirstOrDefault();
        }
        public async void CreateIndexes()
        {
            await collection.Indexes
            .CreateOneAsync(new
           CreateIndexModel<Drone>(Builders<Drone>.IndexKeys.Ascending(_ =>
           _.DroneId)))
            .ConfigureAwait(false);
            await collection.Indexes
            .CreateOneAsync(new
           CreateIndexModel<Drone>(Builders<Drone>.IndexKeys.Ascending(_ =>
           _.DroneName)))
            .ConfigureAwait(false);
        }
        public void Update(Drone drone)
        {
            collection.ReplaceOne(x => x.DroneId == drone.DroneId, drone);
        }
        public void DeleteByName(string droneName)
        {
            collection.DeleteOne(x => x.DroneName == droneName);
        }
    }
}