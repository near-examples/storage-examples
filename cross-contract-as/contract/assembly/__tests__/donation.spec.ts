import { Context, u128, VMContext } from "near-sdk-as";

import { init, get_donation_by_number } from '..';
import { add_donation, get_beneficiary, get_pool, total_donations, } from '../model';

const NEAR: u128 = u128.from("1000000000000000000000000")

describe("Initializing", () => {
  it("initializes correctly", () => {
    set_context(Context.contractName, u128.Zero)
    expect(() => { init("beneficiary", "pool") }).not.toThrow()
    expect(get_beneficiary()).toBe("beneficiary")
    expect(get_pool()).toBe("pool")
  })

  it("cannot be initialized twice", () => {
    set_context(Context.contractName, u128.Zero)
    expect(() => { init("beneficiary", "pool") }).not.toThrow()
    expect(get_beneficiary()).toBe("beneficiary")
    expect(get_pool()).toBe("pool")
    expect(() => { init("another_beneficiary", "another_pool") }).toThrow()
  })
})

describe("Donations", () => {
  // Since donations happen in a cross-contract call, we
  // cannot test them using unit tests
  it("stores and retrieves donations", ()=>{
    set_context(Context.contractName, u128.Zero)
    expect(() => { init("beneficiary", "pool") }).not.toThrow()

    // Store a donation
    const first_donation_idx = add_donation("donor_a", u128.One * NEAR)
    const first_donation = get_donation_by_number(first_donation_idx)

    // Check the donation was recorded correctly
    expect(first_donation_idx).toBe(1)
    expect(first_donation.donor).toBe("donor_a")
    expect(first_donation.amount).toBe(u128.One * NEAR)

    // Store another donation
    const second_donation_idx = add_donation("donor_b", u128.from(2) * NEAR)
    const second_donation = get_donation_by_number(second_donation_idx)

    // Check the donation was recorded correctly
    expect(second_donation_idx).toBe(2)
    expect(second_donation.donor).toBe("donor_b")
    expect(second_donation.amount).toBe(u128.from(2) * NEAR)

    expect(total_donations()).toBe(2)
  })
})

// Auxiliar fn: create a mock context
function set_context(predecessor: string, near_units: u128): void {
  VMContext.setPredecessor_account_id(predecessor)
  VMContext.setAttached_deposit(near_units * NEAR)
}
