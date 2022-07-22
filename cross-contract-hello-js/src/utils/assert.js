import { near } from "near-sdk-js";

// Assertion helper function

export function assert(condition, message) {
  if (!condition) {
    near.panic(message);
  }
}
