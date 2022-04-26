import { map } from '../index'

describe("Map", () => {
  it("stores and retrieves data", () => {
    const key: string = "key"
    const value: i32 = 1

    map.set(key, value)
    assert(map.contains(key), "Error setting key-value")

    let read_value: i32 = map.getSome(key)
    assert(read_value == value, "Wrong value obtained")

    map.delete(key)
    assert(!map.contains(key), "Error deleting")
  })
})