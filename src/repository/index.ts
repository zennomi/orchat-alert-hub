import mongoose, { Mongoose } from "mongoose";

const { MONGODB_URL } = process.env;

const mongooseConnection = mongoose.createConnection(MONGODB_URL as string);
export default mongooseConnection;
