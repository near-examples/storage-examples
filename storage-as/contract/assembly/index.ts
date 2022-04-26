// Storage key value
import { storage, u128 } from "near-sdk-as";

export const STORAGE_COST: u128 = u128.from("1000000000000000000000")

export function set_string(value: string): void {
  storage.set<string>("var-string", value)
}

export function get_string(): string {
  return storage.getPrimitive<string>("var-string", "default value")
}

export function set_storage_cost(value: u128): void {
  storage.set<u128>("storage-cost", value)
}

export function get_storage_cost(): u128 {
  if (storage.contains('storage-cost')) {
    return storage.getSome<u128>("storage-cost")
  }
  return STORAGE_COST
}

// Collections
import { PersistentMap, PersistentVector, PersistentSet, AVLTree } from "near-sdk-as";

export let vector = new PersistentVector<i32>("unique-id-vector1");
export let map = new PersistentMap<string, i32>("unique-id-map1");
export let set = new PersistentSet<i32>("unique-id-set1");
export let tree = new AVLTree<string, i32>("unique-id-tree1");