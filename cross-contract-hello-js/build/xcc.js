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
function view(target, key, descriptor) {}
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
var PromiseResult;

(function (PromiseResult) {
  PromiseResult[PromiseResult["NotReady"] = 0] = "NotReady";
  PromiseResult[PromiseResult["Successful"] = 1] = "Successful";
  PromiseResult[PromiseResult["Failed"] = 2] = "Failed";
})(PromiseResult || (PromiseResult = {}));
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

function assert(condition, message) {
  if (!condition) {
    panic(message);
  }
}

function get_callback_result() {
  assert(currentAccountId() === predecessorAccountId(), "Only the contract itself can call this method");
  return promiseReturn();
}

const TGAS = 10000000000000;

var _class, _class2;

let OnCall = NearBindgen(_class = (_class2 = class OnCall extends NearContract {
  constructor({
    account
  }) {
    assert(currentAccountId() === predecessorAccountId(), "Method new is private");
    super();
    this.hello_account = account;
  }

  query_greeting() {
    const promise = promiseBatchCreate("hello-near.test.near");
    promiseBatchActionFunctionCall(promise, "get_greeting", bytes(JSON.stringify({})), 0, 5 * TGAS);
    promiseThen(promise, currentAccountId(), "_query_greeting_callback", bytes(JSON.stringify({})), 0, 5 * TGAS);
    return promiseReturn();
  }

  _query_greeting_callback() {
    const response = get_callback_result();
    return response;
  }

  change_greeting({
    new_greeting
  }) {
    const promise = promiseBatchCreate("hello-near.test.near");
    promiseBatchActionFunctionCall(promise, "set_greeting", bytes(JSON.stringify({
      message: new_greeting
    })), 0, 5 * TGAS);
    promiseThen(promise, currentAccountId(), "change_greeting_callback", bytes(JSON.stringify({})), 0, 5 * TGAS);
    return promiseReturn();
  }

  change_greeting_callback() {
    get_callback_result();
    return true;
  }

}, (_applyDecoratedDescriptor(_class2.prototype, "query_greeting", [view], Object.getOwnPropertyDescriptor(_class2.prototype, "query_greeting"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "_query_greeting_callback", [call], Object.getOwnPropertyDescriptor(_class2.prototype, "_query_greeting_callback"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "change_greeting", [call], Object.getOwnPropertyDescriptor(_class2.prototype, "change_greeting"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "change_greeting_callback", [call], Object.getOwnPropertyDescriptor(_class2.prototype, "change_greeting_callback"), _class2.prototype)), _class2)) || _class;

function init() {
  OnCall._init();
}
function change_greeting_callback() {
  let _contract = OnCall._get();

  _contract.deserialize();

  let args = _contract.constructor.deserializeArgs();

  let ret = _contract.change_greeting_callback(args);

  _contract.serialize();

  if (ret !== undefined) env.value_return(_contract.constructor.serializeReturn(ret));
}
function change_greeting() {
  let _contract = OnCall._get();

  _contract.deserialize();

  let args = _contract.constructor.deserializeArgs();

  let ret = _contract.change_greeting(args);

  _contract.serialize();

  if (ret !== undefined) env.value_return(_contract.constructor.serializeReturn(ret));
}
function _query_greeting_callback() {
  let _contract = OnCall._get();

  _contract.deserialize();

  let args = _contract.constructor.deserializeArgs();

  let ret = _contract._query_greeting_callback(args);

  _contract.serialize();

  if (ret !== undefined) env.value_return(_contract.constructor.serializeReturn(ret));
}
function query_greeting() {
  let _contract = OnCall._get();

  _contract.deserialize();

  let args = _contract.constructor.deserializeArgs();

  let ret = _contract.query_greeting(args);
  if (ret !== undefined) env.value_return(_contract.constructor.serializeReturn(ret));
}

export { _query_greeting_callback, change_greeting, change_greeting_callback, init, query_greeting };
//# sourceMappingURL=xcc.js.map
