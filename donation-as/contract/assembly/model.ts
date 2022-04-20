import { storage, u128, PersistentVector, context } from "near-sdk-as";

// Class and vector holding donations
@nearBindgen
export class Donation{
  constructor(
    public donor: string,
    public amount: u128
  ) { }
}

// Aprox. cost (u128 + string = 16b + 64b = 80b = 800000000000000000000yN)
export const STORAGE_COST: u128 = u128.from("1000000000000000000000")

const donations = new PersistentVector<Donation>("unique-id-1")

// Beneficiary
export function set_beneficiary(beneficiary: string): void{
  assert(!storage.contains("beneficiary"), "A beneficiary already exists")
  storage.set<string>("beneficiary", beneficiary)
}

export function get_beneficiary(): string{
  assert(storage.contains("beneficiary"), "Please init the contract")
  return storage.getSome<string>("beneficiary")
}

// Donations
export function add_donation(donor: string, amount: u128): i32 {
  const new_donation: Donation = new Donation(donor, amount)
  donations.push(new_donation)
  return donations.length
}

export function get_donation(donation_number: i32): Donation {
  assert(donation_number > 0 &&  donation_number <= donations.length,
         "Error: Invalid donation number")
  return donations[donation_number - 1]
}

export function get_number_of_donation() : i32{
  return donations.length
}