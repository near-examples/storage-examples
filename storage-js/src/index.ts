import { NearContract, NearBindgen, call, near, LookupSet, UnorderedMap, Vector } from "near-sdk-js";

// Constants
const ONE_NEAR = BigInt("1000000000000000000000000");

@NearBindgen
class CollectionsContract extends NearContract {
  vector: Vector<bigint>;
  map: UnorderedMap<String, BigInt>;
  set: LookupSet<BigInt>;
  demo_string: String;

  constructor({demo_string} = {demo_string: String}) {
    super()
    this.vector = new Vector<bigint>('unique-id-vector1');
    this.map = new UnorderedMap<String, BigInt>('unique-id-map1');
    this.set = new LookupSet<BigInt>('unique-id-set1');
    this.demo_string = demo_string.toString();
  }

  // Override the deserializer to load vector from chain
  deserialize() {
    super.deserialize()
    this.vector = new Vector<bigint>('unique-id-vector1');
    this.map = new UnorderedMap<String, BigInt>('unique-id-map1');
    this.set = new LookupSet<BigInt>('unique-id-set1');
  }

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