function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object.keys(descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object.defineProperty(target, property, desc);
    desc = null;
  }

  return desc;
}

function call(target, key, descriptor) {}
function NearBindgen(target) {
  return class extends target {
    static _init() {
      // @ts-ignore
      let args = target.deserializeArgs();
      let ret = new target(args); // @ts-ignore

      ret.serialize();
      return ret;
    }

    static _get() {
      let ret = Object.create(target.prototype);
      return ret;
    }

  };
}

const U64_MAX = 2n ** 64n - 1n;
const EVICTED_REGISTER = U64_MAX - 1n;
function log(...params) {
  env.log(`${params.map(x => x === undefined ? 'undefined' : x) // Stringify undefined
  .map(x => typeof x === 'object' ? JSON.stringify(x) : x) // Convert Objects to strings
  .join(' ')}` // Convert to string
  );
}
function predecessorAccountId() {
  env.predecessor_account_id(0);
  return env.read_register(0);
}
function panic(msg) {
  if (msg !== undefined) {
    env.panic(msg);
  } else {
    env.panic();
  }
}
function storageRead(key) {
  let ret = env.storage_read(key, 0);

  if (ret === 1n) {
    return env.read_register(0);
  } else {
    return null;
  }
}

function currentAccountId() {
  env.current_account_id(0);
  return env.read_register(0);
}
function input() {
  env.input(0);
  return env.read_register(0);
}
function promiseThen(promiseIndex, accountId, methodName, args, amount, gas) {
  return env.promise_then(promiseIndex, accountId, methodName, args, amount, gas);
}
function promiseBatchCreate(accountId) {
  return env.promise_batch_create(accountId);
}
function promiseBatchActionFunctionCall(promiseIndex, methodName, args, amount, gas) {
  env.promise_batch_action_function_call(promiseIndex, methodName, args, amount, gas);
}
function promiseResultsCount() {
  return env.promise_results_count();
}
var PromiseResult;

(function (PromiseResult) {
  PromiseResult[PromiseResult["NotReady"] = 0] = "NotReady";
  PromiseResult[PromiseResult["Successful"] = 1] = "Successful";
  PromiseResult[PromiseResult["Failed"] = 2] = "Failed";
})(PromiseResult || (PromiseResult = {}));

function promiseResult(resultIdx) {
  let status = env.promise_result(resultIdx, 0);

  if (status == PromiseResult.Successful) {
    return env.read_register(0);
  } else if (status == PromiseResult.Failed || status == PromiseResult.NotReady) {
    return status;
  } else {
    panic(`Unexpected return code: ${status}`);
  }
}
function promiseReturn(promiseIdx) {
  env.promise_return(promiseIdx);
}
function storageWrite(key, value) {
  let exist = env.storage_write(key, value, EVICTED_REGISTER);

  if (exist === 1n) {
    return true;
  }

  return false;
}

class NearContract {
  deserialize() {
    let state = storageRead("STATE");

    if (state) {
      Object.assign(this, JSON.parse(state));
    } else {
      throw new Error("Contract state is empty");
    }
  }

  serialize() {
    storageWrite("STATE", JSON.stringify(this));
  }

  static deserializeArgs() {
    let args = input();
    return JSON.parse(args || "{}");
  }

  static serializeReturn(ret) {
    return JSON.stringify(ret);
  }

}

function u8ArrayToBytes(array) {
  let ret = "";

  for (let e of array) {
    ret += String.fromCharCode(e);
  }

  return ret;
} // TODO this function is a bit broken and the type can't be string
function bytes(strOrU8Array) {
  if (typeof strOrU8Array == "string") {
    return checkStringIsBytes(strOrU8Array);
  } else if (strOrU8Array instanceof Uint8Array) {
    return u8ArrayToBytes(strOrU8Array);
  }

  throw new Error("bytes: expected string or Uint8Array");
}

function checkStringIsBytes(str) {
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 255) {
      throw new Error(`string ${str} at index ${i}: ${str[i]} is not a valid byte`);
    }
  }

  return str;
}

var _class, _class2;
const TGAS = 10000000000000;

let CrossContractCall = NearBindgen(_class = (_class2 = class CrossContractCall extends NearContract {
  constructor({
    hello_account = "hello-nearverse.testnet"
  }) {
    super();
    assert(currentAccountId() === predecessorAccountId(), "Method new is private");
    this.hello_account = hello_account;
  }

  query_greeting() {
    const call = promiseBatchCreate(this.hello_account);
    promiseBatchActionFunctionCall(call, "get_greeting", bytes(JSON.stringify({})), 0, 5 * TGAS);
    const then = promiseThen(call, currentAccountId(), "query_greeting_callback", bytes(JSON.stringify({})), 0, 5 * TGAS);
    return promiseReturn(then);
  }

  query_greeting_callback() {
    assert(currentAccountId() === predecessorAccountId(), "This is a private method");
    const greeting = promiseResult();
    return greeting;
  }

  change_greeting({
    new_greeting
  }) {
    const call = promiseBatchCreate(this.hello_account);
    promiseBatchActionFunctionCall(call, "set_greeting", bytes(JSON.stringify({
      message: new_greeting
    })), 0, 5 * TGAS);
    const then = promiseThen(call, currentAccountId(), "change_greeting_callback", bytes(JSON.stringify({})), 0, 5 * TGAS);
    return promiseReturn(then);
  }

  change_greeting_callback() {
    assert(currentAccountId() === predecessorAccountId(), "This is a private method");

    if (promiseResultsCount() == 1) {
      log("Promise was successful!");
      return true;
    } else {
      log("Promise failed...");
      return false;
    }
  }

}, (_applyDecoratedDescriptor(_class2.prototype, "query_greeting", [call], Object.getOwnPropertyDescriptor(_class2.prototype, "query_greeting"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "query_greeting_callback", [call], Object.getOwnPropertyDescriptor(_class2.prototype, "query_greeting_callback"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "change_greeting", [call], Object.getOwnPropertyDescriptor(_class2.prototype, "change_greeting"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "change_greeting_callback", [call], Object.getOwnPropertyDescriptor(_class2.prototype, "change_greeting_callback"), _class2.prototype)), _class2)) || _class;

function init() {
  CrossContractCall._init();
}
function change_greeting_callback() {
  let _contract = CrossContractCall._get();

  _contract.deserialize();

  let args = _contract.constructor.deserializeArgs();

  let ret = _contract.change_greeting_callback(args);

  _contract.serialize();

  if (ret !== undefined) env.value_return(_contract.constructor.serializeReturn(ret));
}
function change_greeting() {
  let _contract = CrossContractCall._get();

  _contract.deserialize();

  let args = _contract.constructor.deserializeArgs();

  let ret = _contract.change_greeting(args);

  _contract.serialize();

  if (ret !== undefined) env.value_return(_contract.constructor.serializeReturn(ret));
}
function query_greeting_callback() {
  let _contract = CrossContractCall._get();

  _contract.deserialize();

  let args = _contract.constructor.deserializeArgs();

  let ret = _contract.query_greeting_callback(args);

  _contract.serialize();

  if (ret !== undefined) env.value_return(_contract.constructor.serializeReturn(ret));
}
function query_greeting() {
  let _contract = CrossContractCall._get();

  _contract.deserialize();

  let args = _contract.constructor.deserializeArgs();

  let ret = _contract.query_greeting(args);

  _contract.serialize();

  if (ret !== undefined) env.value_return(_contract.constructor.serializeReturn(ret));
}

function assert(condition, message) {
  if (!condition) panic(message);
}

export { change_greeting, change_greeting_callback, init, query_greeting, query_greeting_callback };
//# sourceMappingURL=xcc.js.map
