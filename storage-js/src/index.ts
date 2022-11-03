import { NearBindgen, call, near, LookupSet, UnorderedMap, Vector, initialize } from "near-sdk-js";

// Constants
const ONE_NEAR = BigInt("1000000000000000000000000");

@NearBindgen({})
class CollectionsContract {
  avector: Vector<number> = new Vector<number>('unique-id-vector1');
  amap: UnorderedMap<number> = new UnorderedMap<number>('unique-id-map1');
  aset: LookupSet<number> = new LookupSet<number>('unique-id-set1');
  demo_string: String = "";

  @initialize({})
  init({demo_string}: {demo_string: string}) {
    this.demo_string = demo_string;
  }






  @call({})
  vector_ops({value}:{value:number}) {
    this.avector.push(value);
    assert(this.avector.length == 1, "Incorrect length")
    const _value = this.avector.pop()
    assert(_value == value, "Error popping value")
  }

  @call({})
  map_ops({key, value}:{key:string, value:number}) {
    this.amap.set(key, value);
    assert(this.amap.get(key) == value, "Error saving value")
  
    this.amap.remove(key)
    assert(this.amap.get(key) === null, "Error removing value")
  }

  @call({})
  set_ops({value}:{value:number}) {
    this.aset.set(value);
    assert(this.aset.contains(value), "Error saving value")
  
    this.aset.remove(value)
    assert(!this.aset.contains(value), "Error removing value")
  }
}

function assert(condition, message) { if(!condition) throw Error(message); }