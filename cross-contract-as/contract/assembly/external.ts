import { context, ContractPromise, ContractPromiseResult, u128 } from "near-sdk-as";

// Constants
export const TGAS: u64 = 1000000000000;
export const NO_DEPOSIT: u128 = u128.Zero;
export const XCC_SUCCESS = 1

// Auxiliary Method: Make the callback private and return its result
export function get_callback_result(): ContractPromiseResult {
  assert(
    context.predecessor == context.contractName,
    "Only the contract itself can call this method"
  );

  // Return the result from the external pool
  const results = ContractPromise.getResults();
  assert(results.length == 1, "This is a callback method");
  return results[0];
}

// Auxiliary classes for cross-contract calls
@nearBindgen
export class User {
  constructor(
    public staked_balance: u128,
    public unstaked_balance: u128,
    public available_when: u64 = 0,
    public available: bool = false
  ) { }
}

@nearBindgen
export class CbArgs {
  constructor(
    public donor: string,
    public amount: u128
  ) { }
}

@nearBindgen
export class ValidatorArgs {
  constructor(public account_id: string) {}
}