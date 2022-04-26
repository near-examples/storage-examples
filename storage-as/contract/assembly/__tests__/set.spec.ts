import { set } from '../index'

describe("Set", () => {
  it("stores and retrieves data", () => {
    const value: i32 = 1

    set.add(value)
    assert(set.has(value), "Error setting value")

    set.delete(value)
    assert(!set.has(value), "Error removing value")
  })
})