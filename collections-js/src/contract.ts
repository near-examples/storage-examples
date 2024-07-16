// Find all our documentation at https://docs.near.org
import { NearBindgen, call, view, near, LookupSet, UnorderedSet, UnorderedMap, Vector, initialize, LookupMap } from "near-sdk-js";
import { assert } from "near-sdk-js";

@NearBindgen({})
class Storage {
  vector: Vector<number> = new Vector<number>('unique-id-vector1');
  lookup_set: LookupSet<number> = new LookupSet<number>('unique-id-set1');
  unordered_set: UnorderedSet<number> = new UnorderedSet<number>('unique-id-set2');
  lookup_map: LookupMap<number> = new LookupMap<number>('unique-id-map1');
  unordered_map: UnorderedMap<number> = new UnorderedMap<number>('unique-id-map2');
  demo_string: String = "";

  @initialize({})
  init({demo_string}: {demo_string: string}) {
    this.demo_string = demo_string;
  }

  // Vector
  @call({})
  vector_push({value}:{value:number}) {
    this.vector.push(value);
  }

  @view({})
  vector_get(index: number): number {
    return this.vector.get(index);
  }

  @call({})
  vector_replace({index, value}:{index: number, value:number}) {
    this.vector.replace(index, value);
  }

  @view({})
  vector_len(index: number): number {
    return this.vector.length;
  }

  // @view({})
  // vector_iter({from_index, limit}:{from_index: number, limit:number}) {
  //   this.avector.
  // }

  // LookupSet
  @call({})
  insert_set({value}:{value:number}) {
    this.lookup_set.set(value);
  }

  @call({})
  remove_set({value}:{value:number}) {
    this.lookup_set.remove(value);
  }

  @view({})
  contains_set(value: number): boolean {
    return this.lookup_set.contains(value);
  }

  // UnorderedSet
  @call({})
  insert_unordered_set({value}:{value:number}) {
    this.unordered_set.set(value);
  }

  @call({})
  remove_unordered_set({value}:{value:number}) {
    this.unordered_set.remove(value);
  }

  @view({})
  contains_unordered_set(value: number): boolean {
    return this.unordered_set.contains(value);
  }

  // @view({})
  // iter_unordered_set({from_index, limit}:{from_index: number, limit:number}) {
  //   this.unordered_set.
  // }

  // LookupMap
  @call({})
  insert_map({key, value}:{key: string, value:number}) {
    this.lookup_map.set(key, value);
  }

  @call({})
  remove_map({key}:{key: string}) {
    this.lookup_map.remove(key);
  }

  @view({})
  get_map(key: string): number {
    return this.lookup_map.get(key);
  }

  @view({})
  contains_key_map(key: string): boolean {
    return this.lookup_map.containsKey(key);
  }

  // UnorderedMap
  @call({})
  insert_unordered_map({key, value}:{key: string, value:number}) {
    this.unordered_map.set(key, value);
  }

  @call({})
  remove_unordered_map({key}:{key: string}) {
    this.unordered_map.remove(key);
  }

  @view({})
  get_unordered_map(key: string): number {
    return this.unordered_map.get(key);
  }

  @view({})
  contains_key_unordered_map(key: string): boolean {
    return this.unordered_map.(key);
  }

  @view({}) // This method is read-only and can be called for free
  get_greeting(): String {
    return this.demo_string;
  }

  @call({}) // This method changes the state, for which it cost gas
  set_greeting({ greeting }: { greeting: string }): void {
    near.log(`Saving greeting ${greeting}`);
    this.demo_string = greeting;
  }
}