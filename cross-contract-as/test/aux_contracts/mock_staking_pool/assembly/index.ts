import { storage, context, env, u128, ContractPromiseBatch, logging } from "near-sdk-as";
import { user_to_idx, user_staked, user_unstake, User, user_epoch } from "./model"

const POINT_ONE_NEAR: u128 = u128.from("100000000000000000000000")

export function get_account(account_id: string): User {
  logging.log("Mock Staking Pool: get_account")
  if (!user_to_idx.contains(account_id)) {
    return new User(u128.Zero, u128.Zero, true)
  }

  const idx: i32 = user_to_idx.getSome(account_id)
  const staked: u128 = user_staked[idx]
  const unstaking: u128 = user_unstake[idx]
  const available: bool = user_epoch[idx] >= context.epochHeight

  return new User(unstaking, staked, true)
}

export function deposit_and_stake(): void {
  logging.log("Mock Staking Pool: deposit_and_stake - added 0.1N as reward")

  const deposited: u128 = context.attachedDeposit + POINT_ONE_NEAR
  const user: string = context.predecessor

  if (user_to_idx.contains(user)) {
    let idx: i32 = user_to_idx.getSome(user)
    user_staked[idx] = user_staked[idx] + deposited
  } else {
    const N: i32 = storage.getPrimitive<i32>('total_users', 0)
    storage.set<i32>('total_users', N + 1)

    user_to_idx.set(user, N)
    user_staked.push(deposited)
    user_unstake.push(u128.Zero)
    user_epoch.push(0)
  }
}

export function withdraw_all(): void {
  logging.log("Mock Staking Pool: withdraw_all")
  const user: string = context.predecessor

  assert(user_to_idx.contains(user), "Invalid user")

  let idx: i32 = user_to_idx.getSome(user)

  assert(user_unstake[idx] > u128.Zero, "No unstaked balance")
  assert(user_epoch[idx] >= context.epochHeight, "Not enough time passed")

  user_unstake[idx] = u128.Zero
  ContractPromiseBatch.create(user).transfer(user_unstake[idx])
}

export function unstake(amount: u128): void {
  logging.log("Mock Staking Pool: unstake")
  const user: string = context.predecessor

  assert(user_to_idx.contains(user), "Invalid user")

  let idx: i32 = user_to_idx.getSome(user)

  let staked: u128 = user_staked[idx]

  assert(amount <= staked, "Not enough money to unstake")

  // update User
  user_staked[idx] = user_staked[idx] - amount
  user_unstake[idx] = user_unstake[idx] + amount
  user_epoch[idx] = context.epochHeight + 4
}
