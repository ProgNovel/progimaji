import { RequestHandler } from "express";
import { Request } from "polka";

export type RequestQuery = {
  [key: string]: any;
};

export interface PolkaRequest extends Request, RequestHandler {
  search: string | undefined;
}

export interface ProgImajiConfig {
  ACCESS_CONTROL_ALLOW_ORIGIN: string;
  REMOTE_URL_SOURCE_ALLOW_ORIGIN: string;
  THROTTLE_TASK: boolean;
  THROTTLE_TASK_DEFAULT: number;
  THROTTLE_TASK_MAX?: number;
  SERVER_PORT?: number;
}
