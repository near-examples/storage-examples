import { NearBindgen, call, near, LookupSet, UnorderedMap, Vector, initialize } from "near-sdk-js";

// Constants
const ONE_NEAR = BigInt("1000000000000000000000000");

@NearBindgen({})
class CollectionsContract {
  vector: Vector<number> = new Vector<number>('id-01');
  map: UnorderedMap<number> = new UnorderedMap<number>('id-02');
  set: LookupSet<number> = new LookupSet<number>('id-03');

  @call({})
  vector_ops({value}:{value:number}) {
    this.vector.push(value);
    assert(this.vector.length == 1, "Incorrect length")
    const _value = this.vector.pop()
    assert(_value == value, "Error popping value")
  }

  @call({})
  map_ops({key, value}:{key:string, value:number}) {
    this.map.set(key, value);
    assert(this.map.get(key) == value, "Error saving value")
  
    this.map.remove(key)
    assert(this.map.get(key) === null, "Error removing value")
  }

  @call({})
  set_ops({value}:{value:number}) {
    this.set.set(value);
    assert(this.set.contains(value), "Error saving value")
  
    this.set.remove(value)
    assert(!this.set.contains(value), "Error removing value")
  }
}

function assert(condition, message) { if(!condition) throw Error(message); }