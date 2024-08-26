using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using SmartWarDrones.Model;
using System;
using System.Collections.Generic;
using System.Linq;
namespace SmartWarDrones.Repositories
{
    public class StatsRepository
    {
        private readonly IMongoCollection<Stats> collection;
        public StatsRepository(IConfiguration configuration)
        {
            var connString =
           configuration.GetConnectionString("MongoDBConnection");
            collection = new MongoClient(connString)
            .GetDatabase("swd_db")
           .GetCollection<Stats>("stats");
        }
        public Stats Insert(Stats state)
        {
            state.Id = Guid.NewGuid();
            collection.InsertOne(state);
            return state;
        }

        public Stats GetById(Guid id)
        {
            return collection
            .Find(x => x.Id == id)
            .FirstOrDefault();
        }
        public IReadOnlyCollection<Stats> GetByDroneId(Guid
       DroneId)
        {
            return collection
            .Find(x => x.DroneId == DroneId)
            .ToList();
        }
        public Stats GetByDroneIdAndStatsType(Guid droneId, string statsType)
        {
            return collection
                .Find(x => x.DroneId == droneId && x.StatsType == statsType)
                .FirstOrDefault();
        }
        public void Delete(Guid stateId)
        {
            collection.DeleteOne((x) => x.Id == stateId);
        }
        public async void CreateIndexes()
        {
            await collection.Indexes
            .CreateOneAsync(new
           CreateIndexModel<Stats>(Builders<Stats>.IndexKeys.Ascending(_ =>
           _.Id)))
            .ConfigureAwait(false);
            await collection.Indexes
            .CreateOneAsync(new
           CreateIndexModel<Stats>(Builders<Stats>.IndexKeys.Ascending(_ =>
           _.DroneId)))
            .ConfigureAwait(false);
        }
        public void Update(Stats state)
        {
            collection.ReplaceOne(x => x.Id == state.Id, state);
        }
    }
}
