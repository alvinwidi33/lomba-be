import express from "express";
import db from "./utils/database";
import routes from "./routes";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";

dotenv.config();
const app = express();
const PORT = 3001;
db();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "utils", "mail", "templates"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
