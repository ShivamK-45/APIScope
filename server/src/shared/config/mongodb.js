import mongoose from 'mongoose';
import config from './index';
import logger from './logger';


/**
 * MongoConnection class to manage MongoDB connection using Mongoose
 */
class MongoConnection {
    constructor() {
        this.connection = null;
    }

    /**
     * connect to MongoDB database using Mongoose
     * @returns {Promise<mongoose.Connection>}
     */
    async connect(){
        try{
            if(this.connection){
                logger.info("Mongodb already connected");
                return this.connection;
            }

            await mongoose.connect(config.mongo.uri, {
                dbName: config.mongo.dbName
            })

            this.connection = mongoose.connection;

            logger.info(`Mongodb connected: ${config.mongo.uri}`);

            this.connection.on("error", err =>{
                logger.error("MongoDB connection error",err);
            })

            this.connection.on("disconnected", () => {
                logger.error("MongoDB disconnected");
            })

            return this.connection;

        }catch(error){
            logger.error('Failed to connect to MongoDb:', error);
            throw error;
        }
    }

    /**
     * Disconnect from MongoDB database
     */
    async disconnect(){
        try{
            if(this.connection){
                await this.connection.close();
                this.connection = null;
                logger.info("MongoDB connection closed");
            }
        } catch (error) {
            logger.error("Error occurred while closing MongoDB connection", error);
            throw error;
        }
    }


    /**
     * Get the active connection
     * @returns {mongoose.Connection}
     */
    getConnection(){
        return this.connection;
    }
}

export default new MongoConnection();