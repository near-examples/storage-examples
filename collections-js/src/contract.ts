// Find all our documentation at https://docs.near.org
import { NearBindgen, call, view, near, LookupSet, UnorderedSet, UnorderedMap, Vector, initialize, LookupMap } from "near-sdk-js";

@NearBindgen({})
class Storage {
  static schema = {
    vector: Vector,
    lookup_set: LookupSet,
    unordered_set: UnorderedSet,
    lookup_map: LookupMap,
    unordered_map: UnorderedMap,
    outerMap: { class: UnorderedMap, value: UnorderedMap }
  };
  
  vector: Vector<number> = new Vector<number>('unique-id-vector1');
  lookup_set: LookupSet<number> = new LookupSet<number>('unique-id-set1');
  unordered_set: UnorderedSet<number> = new UnorderedSet<number>('unique-id-set2');
  lookup_map: LookupMap<number> = new LookupMap<number>('unique-id-map1');
  unordered_map: UnorderedMap<number> = new UnorderedMap<number>('unique-id-map2');
  outerMap: UnorderedMap<UnorderedMap<string>> = new UnorderedMap<UnorderedMap<string>>('unique-id-nested1');

  // Vector
  @call({})
  push_vector({ value }: { value:number }) {
    this.vector.push(value);
  }

  @view({})
  get_vector({ index }: { index: number }): number {
    return this.vector.get(index);
  }

  @call({})
  replace_vector({ index, value }: { index: number, value:number }) {
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
  iter_unordered_set({ from_index, limit }: { from_index: number, limit:number }) {
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
  iter_unordered_map({ from_index, limit }: { from_index: number, limit:number }) {
    return this.unordered_map.toArray().slice(from_index, limit);
  }
}