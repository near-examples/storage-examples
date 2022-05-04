const { Near, Account, Contract } = nearAPI;
const { deploy_contract } = require('./near_wrapper')

describe('Cross-contract Greetings', function () {
  let contract
  const hello_address = `hello.${nearConfig.contractName}`

  jest.setTimeout(1200000);

  beforeAll(async function () {
    // Deploy hello-near contract
    await deploy_contract(hello_address, `${__dirname}/aux_contracts/hello-near.wasm`)

    // Connect to our contract
    const near = await new Near(nearConfig);
    const user = await new Account(near.connection, nearConfig.contractName);
    contract = await new Contract(
      user,
      nearConfig.contractName,
      { viewMethods: [], changeMethods: ["new", "query_greeting", "change_greeting"] });
  });

  describe('Cross-contract Greetings', function () {
    it("Initializes", async () => {
      await contract.new({args: {hello_account: hello_address}})
    })
    it("returns the default greeting", async () => {
      const message = await contract.query_greeting({args:{}});
      expect(message).toBe("Hello");
    });
    it("should change the greeting", async () => {
      await contract.change_greeting({ args: { new_greeting: "Howdy" } });
      const message = await contract.query_greeting({args:{}});
      expect(message).toBe("Howdy");
    });
  });
});