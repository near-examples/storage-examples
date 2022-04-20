import {TGAS, NO_DEPOSIT, ValidatorArgs, User, get_callback_result} from './aux'
import {context, ContractPromise, u128, logging} from 'near-sdk-as'

export function query_user_funds(validator_id: string, user_id: string): void {
  // Make sure there is enough GAS to execute the callback
  assert(context.prepaidGas >= 11*TGAS, "Please attach at least 11 Tgas")

  // Create arguments for cross-contract call
  const args: ValidatorArgs = new ValidatorArgs(user_id)

  // Query the external validator, needs 5 Tgas
  const promise: ContractPromise = ContractPromise.create(
    validator_id, "get_user_info", args.encode(), 5*TGAS, NO_DEPOSIT
  )

  // Create a callback, needs 5 Tgas
  const callbackPromise = promise.then(
    context.contractName, "query_user_funds_callback", args.encode(), 5*TGAS
  )

  callbackPromise.returnAsResult();
}

export function query_user_funds_callback(account_id: string): u128 {
  const response = get_callback_result()

  if (response.status == 1) {
    // `get_user_info` succeded
    const user_info: User = decode<User>(response.buffer)
    logging.log(`@${account_id} has ${user_info.staked_balance} NEARs staked`)
    return user_info.staked_balance
  } else {
    // `get_user_info` failed
    logging.log("There was an error in `get_user_info`")
    return u128.Zero
  }
}