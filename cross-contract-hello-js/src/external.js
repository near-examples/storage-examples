import { near } from "near-sdk-js";
import { assert } from "./utils/assert";

export function get_callback_result() {
    assert(near.currentAccountId() === near.predecessorAccountId(), "Only the contract itself can call this method");
    return near.promiseReturn();
}
