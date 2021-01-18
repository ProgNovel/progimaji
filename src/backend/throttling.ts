import { nanoid } from "nanoid";
import { THROTTLE_TASK, THROTTLE_TASK_MAX } from "../../progimaji.config";
import { EventEmitter } from "events";
import { PolkaRequest } from "../../typings/global";
// import type { taskId } from "../../typings";
import { TasksQueueEvent } from "./_vars";

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
export function completeTask(id: string) {
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
  const id: string = nanoid();
  tasksQueue[id] = {
    onhold: true,
    resolved: new Promise(() => {}),
  };
  if (THROTTLE_TASK && Object.keys(tasksQueue).length <= THROTTLE_TASK_MAX) {
    _done(id);
  }

  tasksQueue[id].onhold = false;

  tasks.on(TasksQueueEvent.OneTaskCompleted, () => {
    const firstKey = Object.keys(tasksQueue)[0];
    // TODO pick only awaiting tasks in queue
    if (firstKey === id) {
      console.log("Pick a task", id);
      _done(id);
    }
  });

  await tasksQueue[id].resolved;
  return _startRequestedTask();

  function _startRequestedTask(): TaskThrottleInstance {
    return {
      id,
      // width: 1,
      // height: 2,
      // quality: 70,
      // url: "",
    };
  }

  function _done(id) {
    tasksQueue[id].onhold = false;
    tasksQueue[id].resolved = Promise.resolve();
  }
}
