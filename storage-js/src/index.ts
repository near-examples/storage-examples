import { NearContract, NearBindgen, call, near, LookupSet, UnorderedMap, Vector } from "near-sdk-js";

// Constants
const ONE_NEAR = BigInt("1000000000000000000000000");

@NearBindgen
class CollectionsContract extends NearContract {
  vector: Vector;
  map: UnorderedMap;
  set: LookupSet;
  demo_string: String;

  constructor({demo_string}: {demo_string: string}) {
    super()
    this.vector = new Vector('unique-id-vector1');
    this.map = new UnorderedMap('unique-id-map1');
    this.set = new LookupSet('unique-id-set1');
    this.demo_string = demo_string.toString();
  }

  default(){ return new CollectionsContract({demo_string: "Hello!"})}

  @call
  vector_ops({value}) {
    this.vector.push(value);
    assert(this.vector.len() == 1, "Incorrect length")
    const _value = this.vector.pop()
    assert(_value == value, "Error popping value")
  }

  @call
  map_ops({key, value}) {
    this.map.set(key, value);
    assert(this.map.get(key) == value, "Error saving value")
  
    this.map.remove(key)
    assert(this.map.get(key) === null, "Error removing value")
  }

  @call
  set_ops({value}) {
    this.set.set(value);
    assert(this.set.contains(value), "Error saving value")
  
    this.set.remove(value)
    assert(!this.set.contains(value), "Error removing value")
  }
}

function assert(condition, message) { if(!condition) near.panic(message); }