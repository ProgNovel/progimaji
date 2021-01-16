import { ServerResponse } from "http";
import fetch from "node-fetch";
import { RequestQuery } from "../typings/global";
import { completeTask, putTaskInQueue } from "./backend/throttling";
//@ts-expect-error
import type { ImageSize } from "typings/index";
import { imageResize, supportedImageType, imageType } from "./backend/resizing";

export async function resize(req: any, res: ServerResponse) {
  const throttle = await putTaskInQueue(req);
  let { type, url, quality, width, height } = req.query as RequestQuery;
  let imageQuality: number;

  const size: ImageSize = {};
  if (height) size.height = parseInt(height);
  if (width) size.width = parseInt(width);
  if (quality) imageQuality = parseInt(quality);
  if (!type) type = "auto";

  try {
    if (!supportedImageType.includes(type)) {
      throw new Error(`Image type ${type} is not supported.`);
    }
    const data = await fetch(url);
    res.writeHead(200, {
      "Content-Type": "image/" + type,
      // later below header can be customized or disabled by choice
      "Interledger-Billing": "free",
    });
    const task = data.body.pipe(imageResize({ type, quality: imageQuality, size })).pipe(res);
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
