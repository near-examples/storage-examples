import { Context, u128, VMContext } from "near-sdk-as";

import { init, donate, get_donation_by_number, total_number_of_donation } from '..';
import { get_beneficiary, } from '../model';

const NEAR: u128 = u128.from("1000000000000000000000000")

describe("Initializing", () => {
  it("initializes correctly", () => {
    set_context(Context.contractName, u128.Zero)
    expect(() => { init("beneficiary") }).not.toThrow()
    expect(get_beneficiary()).toBe("beneficiary")
  })

  it("cannot be initialized twice", () => {
    set_context(Context.contractName, u128.Zero)
    expect(() => { init("beneficiary") }).not.toThrow()
    expect(get_beneficiary()).toBe("beneficiary")
    expect(() => { init("another_beneficiary") }).toThrow()
  })
})

describe("Donations", () => {
  it("stores and retrieves donations", ()=>{
    set_context(Context.contractName, u128.Zero)
    expect(() => { init("beneficiary") }).not.toThrow()

    // Make a donation
    set_context("donor_a", u128.One)
    const first_donation_idx = donate()
    const first_donation = get_donation_by_number(first_donation_idx)

    // Check the donation was recorded correctly
    expect(first_donation_idx).toBe(1)
    expect(first_donation.donor).toBe("donor_a")
    expect(first_donation.amount).toBe(u128.One * NEAR)

    // Make another donation
    set_context("donor_b", u128.from(2))
    const second_donation_idx = donate()
    const second_donation = get_donation_by_number(second_donation_idx)

    // Check the donation was recorded correctly
    expect(second_donation_idx).toBe(2)
    expect(second_donation.donor).toBe("donor_b")
    expect(second_donation.amount).toBe(u128.from(2) * NEAR)

    expect(total_number_of_donation()).toBe(2)
  })
})

// Auxiliar fn: create a mock context
function set_context(predecessor: string, near_units: u128): void {
  VMContext.setPredecessor_account_id(predecessor)
  VMContext.setAttached_deposit(near_units * NEAR)
}
