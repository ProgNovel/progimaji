import { SERVER_PORT } from "../progimaji.config";
import { tasksQueue } from "./backend/throttling";
import polka, { Request } from "polka";
import { resize } from "./routes";
// import package from "../package.json";

const PORT = SERVER_PORT || 5000;

polka()
  .get("/", versionAndHealthCheck)
  .get("/resize", resize)
  .listen(PORT, (err: Error) => {
    if (err) throw err;
    console.log("Started on port", PORT);
  });

function versionAndHealthCheck(req, res) {
  res.end(`Current concurrent image optimization: ${Object.keys(tasksQueue).length}.`);
}
