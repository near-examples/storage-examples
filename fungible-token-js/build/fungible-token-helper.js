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
function storageRead(key) {
  let ret = env.storage_read(key, 0);

  if (ret === 1n) {
    return env.read_register(0);
  } else {
    return null;
  }
}
function input() {
  env.input(0);
  return env.read_register(0);
}
var PromiseResult;

(function (PromiseResult) {
  PromiseResult[PromiseResult["NotReady"] = 0] = "NotReady";
  PromiseResult[PromiseResult["Successful"] = 1] = "Successful";
  PromiseResult[PromiseResult["Failed"] = 2] = "Failed";
})(PromiseResult || (PromiseResult = {}));
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

var _class, _class2;

let FungibleTokenHelper = NearBindgen(_class = (_class2 = class FungibleTokenHelper extends NearContract {
  constructor() {
    super();
    this.data = "";
  }

  ftOnTransfer({
    senderId,
    amount,
    msg,
    receiverId
  }) {
    const concatString = `[${amount} from ${senderId} to ${receiverId}] ${msg} `;
    this.data = this.data.concat("", concatString);
  }

  getContractData() {
    return this.data;
  }

}, (_applyDecoratedDescriptor(_class2.prototype, "ftOnTransfer", [call], Object.getOwnPropertyDescriptor(_class2.prototype, "ftOnTransfer"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getContractData", [view], Object.getOwnPropertyDescriptor(_class2.prototype, "getContractData"), _class2.prototype)), _class2)) || _class;

function init() {
  FungibleTokenHelper._init();
}
function getContractData() {
  let _contract = FungibleTokenHelper._get();

  _contract.deserialize();

  let args = _contract.constructor.deserializeArgs();

  let ret = _contract.getContractData(args);
  if (ret !== undefined) env.value_return(_contract.constructor.serializeReturn(ret));
}
function ftOnTransfer() {
  let _contract = FungibleTokenHelper._get();

  _contract.deserialize();

  let args = _contract.constructor.deserializeArgs();

  let ret = _contract.ftOnTransfer(args);

  _contract.serialize();

  if (ret !== undefined) env.value_return(_contract.constructor.serializeReturn(ret));
}

export { ftOnTransfer, getContractData, init };
//# sourceMappingURL=fungible-token-helper.js.map
