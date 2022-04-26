import { PersistentVector, PersistentMap, u128, math } from "near-sdk-as";

@nearBindgen
export class User{
  constructor(public unstaked_balance:u128,
              public staked_balance:u128,
              public available:bool){}
}

export const user_to_idx = new PersistentMap<string, u32>('a')
export let user_staked = new PersistentVector<u128>('b')
export let user_unstake = new PersistentVector<u128>('c')
export let user_epoch = new PersistentVector<u64>('d')