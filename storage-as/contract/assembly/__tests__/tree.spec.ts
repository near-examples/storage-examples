import { tree } from '../index'

describe("Tree", () => {
  it("stores and retrieves data", () => {
    const key: string = "key"
    const value: i32 = 1

    tree.set(key, value)
    assert(tree.has(key), "Error setting key-value")

    let read_value: i32 = tree.getSome(key)
    assert(read_value == value, "Wrong value obtained")

    // tree.delete(key)
    // assert(!tree.has(key), "Error deleting")
  })
})