import { RequestHandler } from "express";
import { Request } from "polka";

declare type RequestQuery = {
  [key: string]: any;
};

interface PolkaRequest extends Request, RequestHandler {
  search: string | undefined;
}

interface ProgImajiConfig {
  ACCESS_CONTROL_ALLOW_ORIGIN: string;
  REMOTE_URL_SOURCE_ALLOW_ORIGIN: string;
  THROTTLE_TASK: boolean;
  THROTTLE_TASK_DEFAULT: number;
  THROTTLE_TASK_MAX?: number;
  SERVER_PORT?: number;
}
