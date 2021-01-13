export type taskId = string;

export interface ImageSize {
  width?: number;
  height?: number;
}

export interface TaskThrottleInstance {
  id: taskId;
}

export enum TasksQueueEvent {
  OneTaskCompleted = "taskcompleted",
}
