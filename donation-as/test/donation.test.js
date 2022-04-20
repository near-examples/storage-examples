const { utils: { format: { formatNearAmount, parseNearAmount } }, } = nearAPI

const { create_user, wallet_balance } = require('./methods')

describe('Donation Contract', function () {
  const alice_address = `alice.${nearConfig.contractName}`
  const bob_address = `bob.${nearConfig.contractName}`
  const cloud_address = `cloud.${nearConfig.contractName}`

  jest.setTimeout(1200000);

  beforeAll(async function () {
    contract = await create_user(nearConfig.contractName)
    alice = await create_user(alice_address)
    bob = await create_user(bob_address)
    cloud = await create_user(cloud_address)
  });

  describe('Donate', function () {

    it("Can only be initialized by the owner", async function () {
      // Alice tries and fails
      await expect(alice.init(alice_address)).rejects.toThrow()

      // Contract can initialize itself
      await contract.init(cloud_address)
    })

    it("Sends donations to the beneficiary", async function () {
      const cloud_balance = await wallet_balance(cloud_address)

      // Alice donates 1 NEAR, Bob donates 2 NEARs
      await alice.donate(1)
      await bob.donate(2)

      // Because of storage cost, cloud should have received 3 - 0.001*3
      const new_balance = await wallet_balance(cloud_address)
      expect(new_balance.available).toBeCloseTo(cloud_balance.available + 2.997, 2)
    })

    it("Records the donations", async function () {
      let donation_idx = await alice.donate(1.2345)
      expect(donation_idx).toBe(3, "error recording donations")

      let donation = await alice.get_donation_by_number(donation_idx)
      expect(donation.donor).toBe(alice_address, "error recording sender")
      expect(donation.amount).toBe(1.2345, "error recording amount")
    })
  });
});