import dotenv from "dotenv";

dotenv.config();

const config = {
    port: process.env.PORT || 3000,
    mongodb: {
        uri: process.env.MONGO_URI || 'mongodb://ijn:1234@localhost:27017/cohort82?authSource=admin',
        db: {
            dbName: process.env.DB_NAME || 'cohort82'
        }
    }
}

export default config;