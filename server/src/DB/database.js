import mongoose from "mongoose";
import { DBNAME } from "../constant.js";
export const dbConnection = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.DATABASE_URL}/${DBNAME}`,
    );
    console.log(
      `The Database Is Connected With ${connectionInstance.connection.host}`,
    );
  } catch (error) {
    console.log(`there is issue while connecting to db issue is ${error}`);
  }
};
