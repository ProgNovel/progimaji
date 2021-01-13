import { nanoid } from "nanoid";
import { THROTTLE_TASK, THROTTLE_TASK_MAX } from "../../prog-imaji.config";
import { TasksQueueEvent, taskId, TaskThrottleInstance } from "../../typings";
import { EventEmitter } from "events";
import { PolkaRequest } from "../../typings/global";

export let tasksQueue = {};
const tasks = new EventEmitter();

/**
 * This should be called when an image transformation task completed or an HTTP
 * request readable stream is closed. It will delete the relevant throttle instance
 * in tasks queue and emit an event to signal for the next task in the queue to start if
 * there's any.
 *
 * @param id an unique random ID for HTTP request
 */
export function completeTask(id: taskId) {
  // rather than using Array.filter(), look for
  // a more performance array member delete later
  delete tasksQueue[id];
  tasks.emit(TasksQueueEvent.OneTaskCompleted);
}

/**
 * Put a HTTP request on queue if server is currently a number of processing image
 * optimization tasks.
 *
 * @param details details passed to event emitter when HTTP stream closed.
 * @returns Promise TaskThrottleInstance
 */
export async function putTaskInQueue(request: PolkaRequest): Promise<TaskThrottleInstance> {
  const id: taskId = nanoid();
  tasksQueue[id] = {
    onhold: true,
  };
  let isWaitingQueue: Promise<never | any>;
  if (THROTTLE_TASK && Object.keys(tasksQueue).length > THROTTLE_TASK_MAX) {
    isWaitingQueue = new Promise(() => {});
  } else {
    isWaitingQueue = Promise.resolve();
  }

  tasksQueue[id].onhold = false;

  tasks.on(TasksQueueEvent.OneTaskCompleted, () => {
    // TODO pick only awaiting tasks in queue
    if (Object.keys(tasksQueue)[0] === id) isWaitingQueue = Promise.resolve();
  });

  await isWaitingQueue;
  return _startRequestedTask();

  function _startRequestedTask(): TaskThrottleInstance {
    return {
      id,
      width: 1,
      height: 2,
      quality: 70,
      url: "",
    };
  }
}
