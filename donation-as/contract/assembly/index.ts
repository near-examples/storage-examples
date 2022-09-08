import { u128, context, logging, ContractPromiseBatch } from "near-sdk-as";
import { STORAGE_COST, Donation, add_donation, get_donation,
         set_beneficiary, get_beneficiary, total_donations } from "./model";

// Public - init function, define the beneficiary of donations
export function init(beneficiary: string): void {
  assert(context.predecessor == context.contractName, "Method new is private");
  set_beneficiary(beneficiary);
}

// Public - donate
export function donate(): i32 {
  // assert enough money was attached to at least cover the storage
  assert(context.attachedDeposit > STORAGE_COST, `Attach at least ${STORAGE_COST}`)

  // Get who is calling the method, and how much NEAR they attached
  const donor: string = context.predecessor;
  const amount: u128 = context.attachedDeposit;

  // Record the donation
  const donation_number: i32 = add_donation(donor, amount);
  logging.log(`Thank you ${donor}! donation number: ${donation_number}`);

  // Send the money to the beneficiary
  const beneficiary: string = get_beneficiary();
  ContractPromiseBatch.create(beneficiary).transfer(amount - STORAGE_COST);

  return donation_number;
}

// Public - get donation by number
export function get_donation_by_number(donation_number: i32): Donation {
  return get_donation(donation_number);
}

// Public - get total number of donations
export function total_number_of_donation(): i32 {
  return total_donations();
}

// Public - get a range of donations
export function get_donation_list(from: i32, until: i32): Array<Donation> {
  let result: Array<Donation> = new Array<Donation>();
  for (let i: i32 = from; i <= until; i++) {
    result.push(get_donation(i));
  }
  return result;
}

// Public - beneficiary getter
export function beneficiary(): string {
  return get_beneficiary();
}

// Public - beneficiary setter
export function change_beneficiary(beneficiary: string): void {
  assert(context.predecessor == context.contractName, "Method change_beneficiary is private")
  set_beneficiary(beneficiary);
}