const { create_user, create_user_validator, wallet_balance } = require('./methods')

describe('Cross-Contract Calls', function () {
  const alice_address = `alice.${nearConfig.contractName}`
  const bob_address = `bob.${nearConfig.contractName}`
  const contract_address = nearConfig.contractName
  const validator_address = `baziliknear.pool.f863973.m0`

  jest.setTimeout(1200000);

  beforeAll(async function () {
    alice = await create_user_validator(alice_address, validator_address)
    bob = await create_user_validator(bob_address, validator_address)
    contract = await create_user(contract_address)
  });

  describe('Cross-Contract', function () {

    it("Returns 0 for users with no deposits", async function () {
      const alice_staked = await contract.query_user_funds(validator_address, alice_address)
      expect(alice_staked).toBe(0)
    })

    it("Returns the staked values", async function () {
      // Alice deposits 1 NEAR, Bob deposits 2 NEARs
      await alice.deposit_and_stake(1)
      await bob.deposit_and_stake(2)

      const alice_staked = await contract.query_user_funds(validator_address, alice_address)
      expect(alice_staked).toBe(1)

      const bob_staked = await contract.query_user_funds(validator_address, bob_address)
      expect(bob_staked).toBe(2)
    })
  });
});