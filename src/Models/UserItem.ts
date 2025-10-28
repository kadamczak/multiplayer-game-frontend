import type { ItemResponse } from "./Item";

export type UserItemResponse = {
  id: string;
  item: ItemResponse;
  obtainedAt: string;
}