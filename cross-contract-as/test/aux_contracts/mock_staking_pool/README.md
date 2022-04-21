Mock Staking Contract
=====================

Emulates a Staking Contract by implementing the methods:

- `get_account`: Returns how much staked and unstaked NEARs an account has
- `deposit_and_stake`: If called with a deposit, it simulates staking NEARS. Automatically gives 0.1N of reward, to simulate staking rewards
- `unstake`: Unstakes NEARs for the predecessor
- `withdraw_all`: Returns unstaked NEARs to the predecessor