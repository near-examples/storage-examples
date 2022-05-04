import { storage, context, logging, ContractPromise } from "near-sdk-as";
import { get_callback_result, XCC_SUCCESS, TGAS, NO_DEPOSIT, GreetingArgs }  from "./external";

// Public - init function, save the "Hello NEAR" contract account
export function init(hello_account: string): void {
  assert(context.predecessor == context.contractName, "Method new is private");
  storage.set<string>("hello-near", hello_account);
}

// Public - query external greeting
export function query_greeting(): void {
  // Make sure there is enough GAS to execute the callback
  assert(context.prepaidGas >= 20 * TGAS, "Please attach at least 20 Tgas");

  // Create a promise to call  HelloNEAR.get_greeting()
  const hello_address: string = storage.getPrimitive<string>("hello-near", "");

  const promise: ContractPromise = ContractPromise.create(
    hello_address, "get_greeting", "{}", 5*TGAS, NO_DEPOSIT
  );

  // Create a promise to callback, needs 5 Tgas
  const callbackPromise = promise.then(
    context.contractName, "query_greeting_callback", "{}", 5*TGAS, NO_DEPOSIT
  );

  callbackPromise.returnAsResult();
}

// Public callback
export function query_greeting_callback(): string {
  // make callback private and get result
  const response = get_callback_result();

  if (response.status == XCC_SUCCESS) {
    // `get_greeting` succeeded
    const greeting: string = decode<string>(response.buffer);
    logging.log(`The greeting is "${greeting}"`);
    return greeting;
  } else {
    // it failed
    logging.log(`There was an error contacting Hello NEAR`);
    return "";
  }
}

// Public - change external greeting
export function change_greeting(new_greeting: string): void {
  assert(context.prepaidGas >= 20 * TGAS, "Please attach at least 20 Tgas");

  // Create a promise to call HelloNEAR.set_greeting(message:string)
  const args: GreetingArgs = new GreetingArgs(new_greeting);
  const hello_address: string = storage.getPrimitive<string>("hello-near", "");

  const promise: ContractPromise = ContractPromise.create(
    hello_address, "set_greeting", args.encode(), 5*TGAS, NO_DEPOSIT
  );

  // Create a promise to callback, needs 5 Tgas
  const callbackPromise = promise.then(
    context.contractName, "change_greeting_callback", "{}", 5*TGAS, NO_DEPOSIT
  );

  callbackPromise.returnAsResult();
}

// Public callback
export function change_greeting_callback(): bool {
  // make callback private and get result
  const response = get_callback_result();

  if (response.status == XCC_SUCCESS) {
    // `set_greeting` succeeded
    return true;
  } else {
    // it failed
    return false;
  }
}
