import { u128 } from 'near-sdk-as'
import { setter_demo_u128, setter_demo_str, getter_demo_u128, getter_demo_str, ONE_NEAR } from '../index'

describe("Storage", () => {
  it("stores and retrieves data", () => {
    assert(getter_demo_u128() == ONE_NEAR, "Error in getting const")

    const value: u128 = u128.Zero;
    setter_demo_u128(value);
    assert(getter_demo_u128() == value, "Error in getting u128")

    assert(getter_demo_str() == "default value", "Error in default value")

    const str_value: string = "another string"
    setter_demo_str(str_value)

    assert(getter_demo_str() == str_value, "Error in setting str")
  })
})