import { Context, storage, VMContext } from "near-sdk-as";

import { init } from '..';

describe("Initializing", () => {
  it("initializes correctly", () => {
    VMContext.setPredecessor_account_id(Context.contractName)
    init("test-account")
    const stored_account = storage.getSome<string>('hello-near-address')
    expect(stored_account).toBe("test-account", "Error during init")
  })
})