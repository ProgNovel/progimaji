import { ServerResponse } from "http";
import { createReadStream } from "fs";
import fetch from "node-fetch";
import { completeTask, putTaskInQueue } from "./backend/throttling";
import { imageResize, supportedImageType, imageType } from "./backend/resizing";

export async function resize(req: any, res: ServerResponse) {
  const throttle = await putTaskInQueue(req);
  let { type, url, quality, width, height } = req.query;
  let imageQuality: number;

  const size: ImageSize = {};
  if (height) size.height = parseInt(height);
  if (width) size.width = parseInt(width);
  if (quality) imageQuality = parseInt(quality);
  if (!type) type = "auto";

  await new Promise((resolve) => setTimeout(resolve, 3000));

  try {
    if (!supportedImageType.includes(type)) {
      throw new Error(`Image type ${type} is not supported.`);
    }
    // const data = (await fetch(url)).body;
    const data = createReadStream("mock/mock.png");
    res.writeHead(200, {
      "Content-Type": "image/" + type,
      // later below header can be customized or disabled by choice
      "Interledger-Billing": "free",
    });
    const task = data.pipe(imageResize({ type, quality: imageQuality, size })).pipe(res);
    // res.end("Testing");
  } catch (err) {
    res.writeHead(500);
    res.end(`Error: ${err}`);
  }

  req.on("close", () => {
    completeTask(throttle.id);
    console.log("Close", throttle.id);
  });

  req.on("pipe", () => {
    console.log("Start piping", throttle.id);
  });
}
