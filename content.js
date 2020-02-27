// debug
const isDebug = false
const baseUrl = !isDebug ? 'https://api.explorer.nervos.org/' : 'https://api.explorer.nervos.org/testnet/'
const addrAPI = `${baseUrl}api/v1/addresses`
const headers = new Headers({
  'Content-Type': "application/vnd.api+json",
  "Accept": "application/vnd.api+json"
})

const storageKey = {
  receives: 'receives',
  changes: 'changes',
  xpub: 'xpub',
  addresses: 'addresses',
  balances: 'balances',
  lastUpdateTime: 'lastUpdateTime',
  walletBalances: 'wallet-balances'
}

const utils = {
  accountPath: `m/44'/309'/0`,
  loadWalletBalances: () => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([storageKey.walletBalances], _caches => {
        if (!_caches || !_caches[storageKey.walletBalances] || !Array.isArray(_caches[storageKey.walletBalances])) {
          resolve(new Map())
        } else {
          resolve(new Map(_caches[storageKey.walletBalances]))
        }
      })
    })
  },
  setWalletBalances: (_balances) => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({
        [storageKey.walletBalances]: [..._balances]
      }, () => {
        resolve(true)
      })
    })
  },
  loadXpubAndAddrs: () => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([storageKey.xpub, storageKey.receives, storageKey.changes], _caches => {
        if (_caches && _caches[storageKey.xpub] && Array.isArray(_caches[storageKey.receives]) && Array.isArray(_caches[storageKey.changes])) {
          resolve({
            [storageKey.xpub]: _caches[storageKey.xpub],
            [storageKey.receives]: new Map(_caches[storageKey.receives]),
            [storageKey.changes]: new Map(_caches[storageKey.changes])
          })
        } else {
          resolve({
            [storageKey.xpub]: '',
            [storageKey.receives]: new Map(),
            [storageKey.changes]: new Map()
          })
        }
      })
    })
  },
}

const fetchBalace = (addr) => fetch(`${addrAPI}/${addr}`, {
  mode: 'cors',
  headers
}).then(res => {
  if (res.status === 200) {
    return res.json()
  } else {
    throw new Error("nework error")
  }
}).then(res => {
  return res.data.attributes.balance !== undefined ? res.data.attributes.balance : ''
}).catch(() => '')

const updateBalnace = async () => {
  const addresses = await new Promise((resolve) => {
    chrome.storage.local.get(storageKey.addresses, s => {
      return Array.isArray(s.addresses) ? resolve(s.addresses) : resolve([])
    })
  })
  const balances = await Promise.all(addresses.map(addr => fetchBalace(addr)))
  const tuples = addresses.map((addr, idx) => [addr, balances[idx]])
  chrome.storage.local.set({
    [storageKey.balances]: tuples
  })

  chrome.storage.local.set({
    [storageKey.lastUpdateTime]: Date.now()
  })
}

// button
const appendSubBtnOnAddr = () => {
  let subscribed = false
  const subBtnId = 'ckb_enhanced_subscribe'
  const addr = window.location.href.split('/').pop()
  let btn = document.querySelector(`#${subBtnId}`)

  if (!btn) {
    btn = document.createElement('button')
    btn.id = subBtnId
    btn.className = 'btn'
  }

  chrome.storage.local.get(storageKey.addresses, (s) => {
    const addrs = Array.isArray(s.addresses) ? s.addresses : []
    subscribed = addrs.includes(addr)
    btn.innerText = subscribed ? 'Unsubscribe' : 'Subscribe'
    btn.addEventListener('click', () => {
      if (subscribed) {
        chrome.storage.local.set({
          [storageKey.addresses]: addrs.filter(a => a !== addr)
        }, () => {
          btn.innerText = 'Subscribe'
        })
      } else {
        chrome.storage.local.set({
          [storageKey.addresses]: [...new Set([...addrs, addr])]
        }, () => {
          btn.innerText = 'Unsubscribe'
          updateBalnace()
        })
      }
      subscribed = !subscribed
    })
  })

  const addrContainer = document.querySelector('#hash_content')
  if (addrContainer) {
    addrContainer.appendChild(btn)
  }
}

setInterval(() => {
  updateBalnace()
}, 10000)

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  switch (req.type) {
    case "AppendAddressBtn": {
      appendSubBtnOnAddr()
      break;
    }
  }
})


/**
 * tasks
 * sync wallet
 */

let addrIdx = 0
let startSyncWalletBalancesHandler
const stopSyncWalletBalances = () => {
  clearInterval(startSyncWalletBalancesHandler)
}
const startSyncWalletBalances = () => {
  stopSyncWalletBalances()
  startSyncWalletBalancesHandler = setInterval(async () => {
    const res = await utils.loadXpubAndAddrs()
    const _walletBalances = await utils.loadWalletBalances()
    if (!res.receives || !res.changes || !res.receives.size || !res.changes.size) return
    addrIdx = addrIdx % res.receives.size
    const _receiveAddr = res.receives.get(`${utils.accountPath}/0/${addrIdx}`)
    const _changeAddr = res.changes.get(`${utils.accountPath}/1/${addrIdx}`)
    addrIdx++
    const _balances = await Promise.all([_receiveAddr, _changeAddr].map(_addr => fetchBalace(_addr)))
    _walletBalances.set(_receiveAddr, _balances[0])
    _walletBalances.set(_changeAddr, _balances[1])
    await utils.setWalletBalances(_walletBalances)
  }, 2000)
}

startSyncWalletBalances()
