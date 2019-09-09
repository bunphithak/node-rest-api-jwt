const mongoose = require('mongoose');
const config = require('../utilities/config')
module.exports = {
    connectDatabase: async () => {
        console.log(`environment : ${config.env}`)
        console.log("database connect...")
        mongoose.Promise = global.Promise
        try {
            const daOptions = {
                useNewUrlParser: true,
                useCreateIndex: true,
                useFindAndModify: false,
                keepAlive: true,
                reconnectTries: 30,
                reconnectInterval: 500,
                poolSize: 10,
                bufferMaxEntries: 0,
                connectTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                family: 4,
                useFindAndModify: false
            }
            global.db = await mongoose.connect(config.databasePath(), daOptions);
            console.log("database connected.");
        } catch (error) {
            setTimeout(() => {
                module.exports.connectDatabase()
            }, 5000);
        }

    }
}