import { u128 } from 'near-sdk-as'
import { set_storage_cost, set_string, get_storage_cost, get_string, STORAGE_COST } from '../index'

describe("Storage", () => {
  it("stores and retrieves data", () => {
    assert(get_storage_cost() == STORAGE_COST, "Error in storage 1")

    const value: u128 = u128.Zero;
    set_storage_cost(value);
    assert(get_storage_cost() == value, "Error in storage 2")

    assert(get_string() == "default value", "Error in storage 3")

    const str_value: string = "another string"
    set_string(str_value)

    assert(get_string() == str_value, "Error in storage4 ")
  })
})