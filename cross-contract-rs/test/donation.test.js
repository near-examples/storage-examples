const { create_user } = require('./methods')
const { wallet_balance, deploy_contract } = require('./near_wrapper')

describe('Donation Contract', function () {
  const alice_address = `alice.${nearConfig.contractName}`
  const bob_address = `bob.${nearConfig.contractName}`
  const cloud_address = `cloud.${nearConfig.contractName}`
  const pool_address = `pool.${nearConfig.contractName}`

  jest.setTimeout(1200000);

  beforeAll(async function () {
    // Deploy mock staking pool contract
    deploy_contract(pool_address, `${__dirname}/aux_contracts/mock_staking_pool.wasm`)

    contract = await create_user(nearConfig.contractName)
    alice = await create_user(alice_address)
    bob = await create_user(bob_address)
    cloud = await create_user(cloud_address)
  });

  describe('Donate', function () {

    it("Can only be initialized by the owner", async function () {
      // Alice tries and fails
      await expect(alice.init(alice_address, pool_address)).rejects.toThrow()

      // Contract can initialize itself
      await contract.init(cloud_address, pool_address)
    })

    it("Sends donations to the beneficiary", async function () {
      // Alice donates 1 NEAR, Bob donates 2 NEARs
      await alice.donate(1)
      await bob.donate(2)
    })

    it("Records the donations", async function () {
      let donation_idx = await alice.donate(1.2345)
      expect(donation_idx).toBe(3, "error recording donations")

      let donation = await alice.get_donation_by_number(donation_idx)
      expect(donation.donor).toBe(alice_address, "error recording sender")
      expect(donation.amount).toBe(1.2345, "error recording amount")
    })

    it("Has money staked", async function () {
      // Since we are using a mock staking pool, it adds 0.1N on each stake
      // But we sent 0.001 less on each stake
      let staked = await cloud.total_staked()
      expect(staked).toBeCloseTo(4.2345 + 0.1*3 - 0.001*3, 2)
    })
  });
});