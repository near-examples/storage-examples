import { connect, Contract, WalletConnection, utils, providers } from 'near-api-js'
import { formatError } from 'near-api-js/lib/utils/rpc_errors'

import getConfig from './config'

const nearConfig = getConfig(process.env.NODE_ENV || 'development')

// Initialize contract & set global variables
export async function initContract() {
  // Initialize connection to the NEAR testnet
  window.near = await connect(nearConfig)

  // Initializing Wallet based Account. It can work with NEAR testnet wallet that
  // is hosted at https://wallet.testnet.near.org
  window.walletConnection = new WalletConnection(window.near)

  // Initializing our contract APIs by contract name and configuration
  window.contract = await new Contract(window.walletConnection.account(), nearConfig.contractName, {
    // View methods are read only. They don't modify the state, but usually return some value.
    viewMethods: ['beneficiary', 'get_donation_list', 'total_number_of_donation'],
    // Change methods can modify the state. But you don't receive the returned value when called.
    changeMethods: ['donate'],
  })
}

export function logout() {
  window.walletConnection.signOut()
  // reload page
  window.location.replace(window.location.origin + window.location.pathname)
}

export function login() {
  // Allow the current app to make calls to the specified contract on the
  // user's behalf.
  // This works by creating a new access key for the user's account and storing
  // the private key in localStorage.
  window.walletConnection.requestSignIn(nearConfig.contractName)
}

export async function getTransactionResult(txhash){
  const transaction = await window.near.connection.provider.txStatus(txhash, window.walletConnection.getAccountId())
  return providers.getTransactionLastResult(transaction)
}

export async function getBeneficiary() {
  return await window.contract.beneficiary()
}

export async function latestDonations() {
  const total_donations = await window.contract.total_number_of_donation()

  const min = total_donations > 10 ? total_donations - 9 : 1;
  let donations = await window.contract.get_donation_list({ from: min, until: total_donations })

  for (let i = 0; i < donations.length; i++) {
    const amount = utils.format.formatNearAmount(donations[i].amount)
    const rounded_two_decimals = Math.floor(amount * 100) / 100
    donations[i].amount = rounded_two_decimals
    donations[i].number = min + i
  }

  return donations
}

export async function donate(amount) {
  amount = utils.format.parseNearAmount(amount.toString())
  let response = await window.contract.donate({
    args: {}, amount: amount
  })
  return response
}