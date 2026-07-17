import pg from 'pg';
import config from "./index.js";
import logger from "./logger.js";

const{Pool} = pg;

class PostgresConnnection{
    constructor(){
        this.pool = null;
    }

    getPool(){
        if(!this.pool){
            this.pool = new Pool({
                host: config.postgres.host,
                port: config.postgres.port,
                database: config.postgres.database,
                user: config.postgres.user,
                password: config.postgres.password,
                max: 20, // maximum number of clients in the pool
                idleTimeoutMillis: 30000, // close idle clients after 30 seconds
                connectionTimeoutMillis: 2000, // return an error after 2 seconds if connection could not be established
            })

            this.pool.on("error", err => {
                logger.error("Unexpected error on idle client", err);
            })
        }
        logger.info("PostgreSQL pool created");
        return this.pool;
    }

    async testConnection(){
        try{
            const pool = this.getPool();
            const client = await pool.connect();
            const result = await client.query("SELECT NOW()");
            client.release();

            logger.info(`PostgreSQL connected: ${result.rows[0].now}`);
        }catch(error){
            logger.error("Failed to connect to PostgreSQL:", error);
            throw error;
        }
    }

    async query(text, params){
        const pool = this.getPool();
        const start = Date.now();

        try{
            const result = await pool.query(text, params);
            const duration = Date.now() - start;
            logger.info('Executed query', { text, duration, rows: result.rowCount});
            return result;
        }catch(error){
            logger.error("Failed to execute query:", error);
            throw error;
        }
    }

    async close(){
        if(this.pool){
            await this.pool.end();
            this.pool = null;
            logger.info("PostgreSQL pool closed");
        }
    }
}
export default new PostgresConnnection();