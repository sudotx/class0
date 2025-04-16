import { connect } from "mongoose";
import logger from "./logger.js";

const connectDB = async () => {
  try {
    const conn = await connect(process.env.MONGO_URI);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

export default connectDB;
