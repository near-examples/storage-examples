import { u128, context, logging, ContractPromise, ContractPromiseBatch } from "near-sdk-as";
import { get_callback_result, XCC_SUCCESS, TGAS, NO_DEPOSIT,
         CbArgs, User, ValidatorArgs } from "./external"
import { STORAGE_COST, Donation, add_donation, get_donation, set_beneficiary,
         get_beneficiary, set_pool, get_pool, total_donations } from "./model";

// Public - init function, define the beneficiary of donations
export function init(beneficiary: string, stake_pool: string): void {
  assert(context.predecessor == context.contractName, "Method new is private");
  set_beneficiary(beneficiary);
  set_pool(stake_pool)
}

// Public - donate
export function donate(): void {
  // Make sure there is enough GAS to execute the callback
  assert(context.prepaidGas >= 45*TGAS, "Please attach at least 45 Tgas")

  // Get who is calling the method, and how much NEAR they attached
  const donor: string = context.predecessor;
  const amount: u128 = context.attachedDeposit;

  // Stake donation in a pool, needs 30 Tgas
  const stake_pool: string = get_pool();
  const DEPOSIT: u128 = amount - STORAGE_COST;

  const promise: ContractPromise = ContractPromise.create(
    stake_pool, "deposit_and_stake", "{}", 30*TGAS, DEPOSIT
  )

  // Create a callback, needs 10 Tgas
  const callback_args: CbArgs = new CbArgs(donor, amount)
  const callbackPromise = promise.then(
    context.contractName, "donate_callback", callback_args.encode(), 10*TGAS
  )

  callbackPromise.returnAsResult();
}

// Public callback - Only callable by context.contractName
export function donate_callback(donor: string, amount:u128): i32 {
  // make callback private and get result
  const response = get_callback_result()

  if (response.status == XCC_SUCCESS) {
    // `deposit_and_stake` succeeded - Record the donation
    const donation_number: i32 = add_donation(donor, amount);
    logging.log(`Thank you ${donor}! donation number: ${donation_number}`);
    return donation_number
  } else {
    // it failed - The deposit came back to us and we must return it
    logging.log(`There was an error, returning ${amount} to @${donor}`)
    ContractPromiseBatch.create(donor).transfer(amount)
    return 0
  }
}

// Public - total_staked
export function total_staked(): void {
  // Make sure there is enough GAS to execute the callback
  assert(context.prepaidGas >= 15*TGAS, "Please attach at least 15 Tgas")

  const stake_pool: string = get_pool()
  const this_contract: string = context.contractName

  // Create arguments for cross-contract call
  const args: ValidatorArgs = new ValidatorArgs(this_contract)

  // Query the external validator, needs 5 Tgas
  const promise: ContractPromise = ContractPromise.create(
    stake_pool, "get_account", args.encode(), 5*TGAS, NO_DEPOSIT
  )

  // Create a callback, needs 5 Tgas
  const callbackPromise = promise.then(
    context.contractName, "total_staked_callback", "{}", 5*TGAS
  )

  callbackPromise.returnAsResult();
}

// Public callback - Only callable by context.contractName
export function total_staked_callback(): u128 {
  // make callback private and get result
  const response = get_callback_result()

  if (response.status == 1) {
    // `get_account` succeeded
    const user_info: User = decode<User>(response.buffer)
    logging.log(`This contract has ${user_info.staked_balance} NEARs staked`)
    return user_info.staked_balance
  } else {
    // `get_account` failed
    logging.log("There was an error in `get_account`")
    return u128.Zero
  }
}

export function unstake(amount: u128): void{
  assert(context.predecessor == get_beneficiary(), "Error: Private Method")
  throw new Error("Not Implemented")
}

export function withdraw(amount: u128): void{
  assert(context.predecessor == get_beneficiary(), "Error: Private Method")
  throw new Error("Not Implemented")
}

// Public - get donation by number
export function get_donation_by_number(donation_number: i32): Donation {
  return get_donation(donation_number);
}

// Public - get total number of donations
export function total_number_of_donation(): i32 {
  return total_donations();
}