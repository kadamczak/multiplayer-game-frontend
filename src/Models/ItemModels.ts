export const ItemType = {
  Consumable: "Consumable",
  EquippableOnHead: "EquippableOnHead",
  EquippableOnBody: "EquippableOnBody"
} as const;

export type ItemType = typeof ItemType[keyof typeof ItemType];

export const ItemTypeDisplay: Record<ItemType, string> = {
  [ItemType.Consumable]: "Consumable",
  [ItemType.EquippableOnHead]: "Equippable on Head",
  [ItemType.EquippableOnBody]: "Equippable on Body"
};

export type ItemResponse = {
  id: number;
  name: string;
  description: string;
  type: ItemType;
  thumbnailUrl: string;
}

export type UserItemSimplifiedResponse = {
  id: string;
  item: ItemResponse;
  offerId: string | null;
}