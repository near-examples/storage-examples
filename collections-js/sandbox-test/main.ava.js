import path from 'path';
import anyTest from 'ava';
import { Worker } from 'near-workspaces';
import { setDefaultResultOrder } from 'dns'; setDefaultResultOrder('ipv4first'); // temp fix for node >v17

/**
 *  @typedef {import('near-workspaces').NearAccount} NearAccount
 *  @type {import('ava').TestFn<{worker: Worker, accounts: Record<string, NearAccount>}>}
 */
const test = anyTest;

test.beforeEach(async t => {
  // Create sandbox
  const worker = t.context.worker = await Worker.init();

  // Deploy contract
  const root = worker.rootAccount;
  const contract = await root.createSubAccount('test-account');

  // Get wasm file path from package.json test script in folder above
  await contract.deploy(
    path.join('./build/collections.wasm')
  );

  // Save state for test runs, it is unique for each test
  t.context.accounts = { root, contract };
});

test.afterEach.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log('Failed to stop the Sandbox:', error);
  });
});

test('testing bigint methods', async (t) => {
  const { root, contract } = t.context.accounts;

  let currentValue = await contract.view('get_big_plus_one', {});
  t.assert(currentValue === '1', "Incorrect big int");

  await root.call(contract, 'set_big', { value: '3' });

  currentValue = await contract.view('get_big_plus_one', {});
  t.assert(currentValue === '4', "Incorrect big int");
});

test('testing string methods', async (t) => {
  const { root, contract } = t.context.accounts;
  const newGreeting = 'Hi';

  let currentGreeting = await contract.view('get_greeting', {});
  t.assert(currentGreeting === 'Hello', "Incorrect greeting");

  await root.call(contract, 'set_greeting', { greeting: newGreeting });

  currentGreeting = await contract.view('get_greeting', {});
  t.assert(currentGreeting === newGreeting, "Incorrect greeting");
});

test('testing Vector methods', async (t) => {
  const { root, contract } = t.context.accounts;

  let val1 = 0;
  let val2 = 1;

  await root.call(contract, 'push_vector', { value: val1 });

  let vectorLength = await contract.view('len_vector', {});
  t.assert(vectorLength === 1, "Incorrect length");
  
  await root.call(contract, 'replace_vector', { index: 0, value: val2 });

  let storedValue = await contract.view('get_vector', { index: 0 });
  t.assert(storedValue === val2, `Incorrect value`);

  await root.call(contract, 'push_vector', { value: val1 });

  const items = await contract.view('iter_vector', { from_index: 0, limit: 2 });
  t.assert(items.length === 2, "Incorrect length");
  t.assert(items[0] === val2, "Incorrect value");
  t.assert(items[1] === val1, "Incorrect value");
});

test('testing LookupSet methods', async (t) => {
  const { root, contract } = t.context.accounts;

  let value = 0;

  await root.call(contract, 'insert_lookup_set', { value });

  let containsValueResult1 = await contract.view('contains_lookup_set', { value });
  t.assert(containsValueResult1, "LookupSet must contain the value");
  
  await root.call(contract, 'remove_lookup_set', { value });

  let containsValueResult2 = await contract.view('contains_lookup_set', { value });
  t.assert(!containsValueResult2, "LookupSet mustn't contain the value");
});

test('testing UnorderedSet methods', async (t) => {
  const { root, contract } = t.context.accounts;

  let val1 = 0;
  let val2 = 1;

  await root.call(contract, 'insert_unordered_set', { value: val1 });

  let containsValueResult1 = await contract.view('contains_unordered_set', { value: val1 });
  t.assert(containsValueResult1, "UnorderedSet must contain the value");
  
  await root.call(contract, 'remove_unordered_set', { value: val1 });

  let containsValueResult2 = await contract.view('contains_unordered_set', { value: val1 });
  t.assert(!containsValueResult2, "UnorderedSet mustn't contain the value");

  await root.call(contract, 'insert_unordered_set', { value: val1 });
  await root.call(contract, 'insert_unordered_set', { value: val2 });

  const items = await contract.view('iter_unordered_set', { from_index: 0, limit: 2 });
  t.assert(items.length === 2, "Incorrect length");
  t.assert(items[0] === val1, "Incorrect value");
  t.assert(items[1] === val2, "Incorrect value");
});

test('testing LookupMap methods', async (t) => {
  const { root, contract } = t.context.accounts;

  let key = 'account.near';
  let value = 0;

  await root.call(contract, 'insert_lookup_map', { key, value });

  let containsValueResult1 = await contract.view('contains_key_lookup_map', { key });
  t.assert(containsValueResult1, "LookupMap must contain the value by the key");

  let storedResult1 = await contract.view('get_lookup_map', { key });
  t.assert(storedResult1 === value, `Incorrect value for the key`);
  
  await root.call(contract, 'remove_lookup_map', { key });

  let containsValueResult2 = await contract.view('contains_key_lookup_map', { key });
  t.assert(!containsValueResult2, "LookupMap mustn't contain the the key");
});

test('testing UnorderedMap methods', async (t) => {
  const { root, contract } = t.context.accounts;

  let key1 = 'account.near';
  let val1 = 0;

  let key2 = 'account1.near';
  let val2 = 1;

  await root.call(contract, 'insert_unordered_map', { key: key1, value: val1 });

  let storedResult1 = await contract.view('get_unordered_map', { key: key1 });
  t.assert(storedResult1 === val1, `Incorrect value for the key`);
  
  await root.call(contract, 'remove_unordered_map', { key: key1 });
  
  let storedResult2 = await contract.view('get_unordered_map', { key: key1 });
  t.assert(storedResult2 === null, `Incorrect value for the key`);

  await root.call(contract, 'insert_unordered_map', { key: key1, value: val1 });
  await root.call(contract, 'insert_unordered_map', { key: key2, value: val2 });

  const items = await contract.view('iter_unordered_map', { from_index: 0, limit: 2 });
  t.assert(items.length === 2, "Incorrect length");
  t.assert(items[0][0] === key1, "Incorrect value");
  t.assert(items[0][1] === val1, "Incorrect value");
  t.assert(items[1][0] === key2, "Incorrect value");
  t.assert(items[1][1] === val2, "Incorrect value");
});

test('testing nested methods', async (t) => {
  const { root, contract } = t.context.accounts;

  let key1 = 'account.near';
  let val1 = 0;

  let key2 = 'account1.near';
  let val2 = 1;

  await root.call(contract, 'insert_nested', { key: key1, value: val1 });

  let storedResult1 = await contract.view('get_nested', { accountId: root.accountId, key: key1 });
  t.assert(storedResult1 === val1, `Incorrect value for the key`);
  
  await root.call(contract, 'remove_nested', { key: key1 });
  
  let storedResult2 = await contract.view('get_nested', { accountId: root.accountId, key: key1 });
  t.assert(storedResult2 === null, `Incorrect value for the key`);

  await root.call(contract, 'insert_nested', { key: key1, value: val1 });
  await root.call(contract, 'insert_nested', { key: key2, value: val2 });

  const items = await contract.view('iter_nested', { accountId: root.accountId, from_index: 0, limit: 2 });
  t.assert(items[0][0] === key1, "Incorrect value");
  t.assert(items[0][1] === val1, "Incorrect value");
  t.assert(items[1][0] === key2, "Incorrect value");
  t.assert(items[1][1] === val2, "Incorrect value");
});