import mongoose, { Mongoose } from "mongoose";

const { MONGODB_URL } = process.env;

mongoose
    .connect(MONGODB_URL as string)
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });

const mongooseConnection = mongoose.connection;
export default mongooseConnection;
