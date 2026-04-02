import dotenv from "dotenv";
import { dbConnection } from "./DB/database.js";
import { httpServer } from "./app.js";

dotenv.config({
  path: "./.env",
  override: true,
});

dbConnection()
  .then(() => {
    const port = Number(process.env.PORT) || 8000;
    httpServer.listen(port, () => {
      console.log(`Server running on ${port}`);
    });
    // app.listen(process.env.PORT, () => {
    //   console.log("Server running on 8000 port");
    // });
  })
  .catch((err) => {
    console.log("DATABASE CONNECTION FAILED", err);
  });
