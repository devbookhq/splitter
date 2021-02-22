export enum ActionType {
  CreatePairs,
  CalculateSizes,
  StartDragging,
  StopDragging,
}

export interface CreatePairs {
  type: ActionType.CreatePairs;
  payload: {
    children: HTMLElement[],
    gutters: HTMLElement[],
  };
}

export interface CalculateSizes {
  type: ActionType.CalculateSizes;
  payload: {
    gutterIdx: number;
  };
}

export interface StartDragging {
  type: ActionType.StartDragging;
  payload: {
    gutterIdx: number;
  };
}

interface StopDragging {
  type: ActionType.StopDragging;
}

export type Action = CreatePairs
  | CalculateSizes
  | StartDragging
  | StopDragging;


