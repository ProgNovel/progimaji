import { PolkaRequest } from "../../typings/global";
export declare let tasksQueue: {};
/**
 * This should be called when an image transformation task completed or an HTTP
 * request readable stream is closed. It will delete the relevant throttle instance
 * in tasks queue and emit an event to signal for the next task in the queue to start if
 * there's any.
 *
 * @param id an unique random ID for HTTP request
 */
export declare function completeTask(id: string): void;
/**
 * Put a HTTP request on queue if server is currently a number of processing image
 * optimization tasks.
 *
 * @param details details passed to event emitter when HTTP stream closed.
 * @returns Promise TaskThrottleInstance
 */
export declare function putTaskInQueue(request: PolkaRequest): Promise<TaskThrottleInstance>;
