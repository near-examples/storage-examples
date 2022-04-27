import { storage, u128 } from "near-sdk-as";

// Constants
export const ONE_NEAR: u128 = u128.from("1000000000000000000000000")

// Storage setters
export function setter_demo_str(value: string): void {
  storage.set<string>("var-string", value)
}

export function setter_demo_u128(value: u128): void {
  storage.set<u128>("var-u128", value)
}

// Storage getters
export function getter_demo_str(): string {
  return storage.getPrimitive<string>("var-string", "default value")
}

export function getter_demo_u128(): u128 {
  if (storage.contains('var-u128')) {
    return storage.getSome<u128>("var-u128")
  }
  return ONE_NEAR
}

// Collections
import { PersistentMap, PersistentVector, PersistentSet, AVLTree } from "near-sdk-as";

export let vector = new PersistentVector<i32>("unique-id-vector1");
export let map = new PersistentMap<string, i32>("unique-id-map1");
export let set = new PersistentSet<i32>("unique-id-set1");
export let tree = new AVLTree<string, i32>("unique-id-tree1");