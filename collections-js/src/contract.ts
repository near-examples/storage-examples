// Find all our documentation at https://docs.near.org
import { NearBindgen, call, view, near, LookupSet, UnorderedSet, UnorderedMap, Vector, LookupMap } from "near-sdk-js";

@NearBindgen({})
class Storage {
  static schema = {
    vector: { class: Vector, value: "number" },
    lookup_set: { class: LookupSet, value: "number" },
    unordered_set: { class: UnorderedSet, value: "number" },
    lookup_map: { class: LookupMap, value: "number" },
    unordered_map: { class: UnorderedMap, value: "number" },
    nested: { class: UnorderedMap, value: { class: UnorderedMap, value: "number" } }
  };

  greeting: string = 'Hello';
  big_int: BigInt = BigInt(0);
  vector: Vector<number> = new Vector<number>('uid-1');
  lookup_set: LookupSet<number> = new LookupSet<number>('uid-2');
  unordered_set: UnorderedSet<number> = new UnorderedSet<number>('uid-3');
  lookup_map: LookupMap<number> = new LookupMap<number>('uid-4');
  unordered_map: UnorderedMap<number> = new UnorderedMap<number>('uid-5');
  nested: UnorderedMap<UnorderedMap<number>> = new UnorderedMap<UnorderedMap<number>>('uid-6');

  @view({}) // This method is read-only and can be called for free
  get_greeting(): string {
    return this.greeting;
  }

  @call({}) // This method changes the state, for which it cost gas
  set_greeting({ greeting }: { greeting: string }): void {
    near.log(`Saving greeting ${greeting}`);
    this.greeting = greeting;
  }

  @view({}) // This method is read-only and can be called for free
  get_big_int(): string {
    return this.big_int as unknown as string; // Because of serializing process it actually returns BigInt as string for view methods
  }

  @call({}) // This method changes the state, for which it cost gas
  set_big_int({ value }: { value: string }): void {
    near.log(`Saving big int value: ${value}`);
    this.big_int = BigInt(value);
  }

  // Vector
  @call({})
  push_vector({ value }: { value: number }) {
    this.vector.push(value);
  }

  @view({})
  get_vector({ index }: { index: number }): number {
    return this.vector.get(index);
  }

  @call({})
  replace_vector({ index, value }: { index: number, value: number }) {
    this.vector.replace(index, value);
  }

  @view({})
  len_vector(): number {
    return this.vector.length;
  }

  @view({})
  iter_vector({ from_index, limit }: { from_index: number, limit: number }) {
    return this.vector.toArray().slice(from_index, limit);
  }

  // LookupSet
  @call({})
  insert_lookup_set({ value }: { value: number }) {
    this.lookup_set.set(value);
  }

  @call({})
  remove_lookup_set({ value }: { value: number }) {
    this.lookup_set.remove(value);
  }

  @view({})
  contains_lookup_set({ value }: { value: number }): boolean {
    return this.lookup_set.contains(value);
  }

  // UnorderedSet
  @call({})
  insert_unordered_set({ value }: { value: number }) {
    this.unordered_set.set(value);
  }

  @call({})
  remove_unordered_set({ value }: { value: number }) {
    this.unordered_set.remove(value);
  }

  @view({})
  contains_unordered_set({ value }: { value: number }): boolean {
    return this.unordered_set.contains(value);
  }

  @view({})
  iter_unordered_set({ from_index, limit }: { from_index: number, limit: number }) {
    return this.unordered_set.toArray().slice(from_index, limit);
  }

  // LookupMap
  @call({})
  insert_lookup_map({ key, value }: { key: string, value: number }) {
    this.lookup_map.set(key, value);
  }

  @call({})
  remove_lookup_map({ key }: { key: string }) {
    this.lookup_map.remove(key);
  }

  @view({})
  get_lookup_map({ key }: { key: string }): number {
    return this.lookup_map.get(key);
  }

  @view({})
  contains_key_lookup_map({ key }: { key: string }): boolean {
    return this.lookup_map.containsKey(key);
  }

  // UnorderedMap
  @call({})
  insert_unordered_map({ key, value }: { key: string, value: number }) {
    this.unordered_map.set(key, value);
  }

  @call({})
  remove_unordered_map({ key }: { key: string }) {
    this.unordered_map.remove(key);
  }

  @view({})
  get_unordered_map({ key }: { key: string }): number {
    return this.unordered_map.get(key);
  }

  @view({})
  iter_unordered_map({ from_index, limit }: { from_index: number, limit: number }) {
    return this.unordered_map.toArray().slice(from_index, limit);
  }

  // Nested
  @call({})
  insert_nested({ key, value }: { key: string, value: number }) {
    const accountId = near.signerAccountId();

    let innerMap = this.nested.get(accountId);

    if (innerMap === null) {
      innerMap = new UnorderedMap<number>(accountId);
    }

    innerMap.set(key, value);
    this.nested.set(accountId, innerMap);
  }

  @call({})
  remove_nested({ key }: { key: string }) {
    const accountId = near.signerAccountId();
    const innerMap = this.nested.get(accountId);

    innerMap.remove(key);
    this.nested.set(accountId, innerMap);
  }

  @view({})
  get_nested({ accountId, key }: { accountId: string, key: string }): number {
    const innerMap = this.nested.get(accountId);

    if (innerMap === null) {
      return null;
    }
    return innerMap.get(key);
  }

  @view({})
  iter_nested({ accountId, from_index, limit }: { accountId: string, from_index: number, limit: number }) {
    const innerMap = this.nested.get(accountId);

    if (innerMap === null) {
      return null;
    }

    return innerMap.toArray().slice(from_index, limit);
  }
}