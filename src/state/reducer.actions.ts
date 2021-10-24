import type { SplitDirection } from 'index';

export enum ActionType {
  SetIsReadyToCompute,
  CreatePairs,
  CalculateSizes,
  StartDragging,
  StopDragging,
}

export interface SetIsReadyToCompute {
  type: ActionType.SetIsReadyToCompute;
  payload: {
    isReady: boolean,
  };
}

export interface CreatePairs {
  type: ActionType.CreatePairs;
  payload: {
    direction: SplitDirection,
    children: HTMLElement[],
    gutters: HTMLElement[],
  };
}

export interface CalculateSizes {
  type: ActionType.CalculateSizes;
  payload: {
    direction: SplitDirection,
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

export type Action = SetIsReadyToCompute
  | CreatePairs
  | CalculateSizes
  | StartDragging
  | StopDragging;


