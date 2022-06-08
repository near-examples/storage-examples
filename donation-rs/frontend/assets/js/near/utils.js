import { connect, Contract, WalletConnection, utils, providers } from 'near-api-js'

import getConfig from './config'

const nearConfig = getConfig(process.env.NODE_ENV || 'development')

// Initialize contract & set global variables
export async function initContract() {
  // Set a connection to the NEAR network
  window.near = await connect(nearConfig)

  // Initialize a Wallet Object
  window.walletConnection = new WalletConnection(window.near)

  // Initialize a Contract Object (to interact with the contract)
  window.contract = await new Contract(
    window.walletConnection.account(), // user's account
    nearConfig.contractName, // contract's account
    {
      viewMethods: ['beneficiary', 'get_donation_list', 'total_donations'],
      changeMethods: ['donate'],
    }
  )
}

export function logout() {
  window.walletConnection.signOut()
  // reload page
  window.location.replace(window.location.origin + window.location.pathname)
}

export function login() {
  // Allows to make calls to the contract on the user's behalf.
  // Works by creating a new access key for the user's account
  // and storing the private key in localStorage.
  window.walletConnection.requestSignIn(nearConfig.contractName)
}

export async function getTransactionResult(txhash) {
  const transaction = await window.near.connection.provider.txStatus(txhash, window.walletConnection.getAccountId())
  return providers.getTransactionLastResult(transaction)
}

export async function getBeneficiary() {
  return await window.contract.beneficiary()
}

export async function latestDonations() {
  const total_donations = await window.contract.total_donations()

  const min = total_donations > 10 ? total_donations - 9 : 1

  let donations = await window.contract.get_donation_list({ from: min, until: total_donations })

  for (let i = 0; i < donations.length; i++) {
    donations[i].amount = formatAmount(donations[i].amount)
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

// Aux method
function formatAmount(amount) {
  let formatted = amount.toLocaleString('fullwide', { useGrouping: false })
  formatted = utils.format.formatNearAmount(formatted)
  return Math.floor(formatted * 100) / 100
}