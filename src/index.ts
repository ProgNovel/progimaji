import { SERVER_PORT } from "../prog-imaji.config";
import polka, { Request } from "polka";
import { resize } from "./routes";

const PORT = SERVER_PORT || 5000;

polka()
  .get("/", (req, res) => {})
  .get("/resize", resize)
  .listen(PORT, (err: Error) => {
    if (err) throw err;
    console.log("Started on port", PORT);
  });
