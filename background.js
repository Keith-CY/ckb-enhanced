const isDebug = false
const ckb = new Core()

const storageKey = {
  receives: 'receives',
  changes: 'changes',
  xpub: 'xpub',
  walletBalances: 'wallet-balances',
  walletTotalBalance: 'wallet-total-balance',
}

const utils = {
  hexToBytes: ckb.utils.hexToBytes,
  bytesToHex: ckb.utils.bytesToHex,
  accountPath: `m/44'/309'/0`,
  genKeychain: _xpub => {
    const pk = utils.hexToBytes('0x' + _xpub.slice(0, 66))
    const chainCode = utils.hexToBytes('0x' + _xpub.slice(66))
    return HDKeychain.HDKeychain.fromPubKey(pk, chainCode, utils.accountPath)
  },
  pubKeyToAddr: pk => {
    return ckb.utils.pubkeyToAddress(pk, {
      prefix: !isDebug ? 'ckb' : 'ckt',
    })
  },
  formatCKB: value => {
    const int = (BigInt(value) / BigInt(10 ** 8))
      .toString()
      .split('')
      .reverse()
      .join('')
      .match(/\d{1,3}/g)
      .join(',')
      .split('')
      .reverse()
      .join('')
    const deci = value.slice(-8).replace(/0*$/, '')
    return `${int}${deci ? `.${deci}` : ''} CKB`
  },
  setXpubAndAddrs: (_xpub = '', receives = new Map(), changes = new Map()) => {
    return new Promise((resolve, reject) => {
      if (_xpub !== '' && _xpub.length !== 130) {
        reject("Invalid xpub")
      }
      let data = {
        [storageKey.xpub]: _xpub,
        [storageKey.changes]: [...changes.entries()],
        [storageKey.receives]: [...receives.entries()],
      }
      if (_xpub === '') {
        data = {
          [storageKey.xpub]: '',
          [storageKey.changes]: [],
          [storageKey.receives]: [],
          [storageKey.walletBalances]: []
        }
      }
      chrome.storage.local.set(data, () => {
        resolve('saved')
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
  deriveMoreAddrs: async () => {
    const _caches = await utils.loadXpubAndAddrs()
    if (!_caches[storageKey.xpub]) {
      throw new Error('No xpub found')
    }
    const _receiveAddrMap = _caches[storageKey.receives]
    const _changeAddrMap = _caches[storageKey.changes]
    const count = 10
    const index = _receiveAddrMap.size
    const keychain = utils.genKeychain(_caches[storageKey.xpub])
    const receiveKeychain = keychain.deriveChild(0, false)
    const changeKeychain = keychain.deriveChild(1, false)

    for (let i = index; i < count + index; i++) {
      const receiveAddrPubKey = utils.bytesToHex(receiveKeychain.deriveChild(i, false).pubKey)
      const changeAddrPubKey = utils.bytesToHex(changeKeychain.deriveChild(i, false).pubKey)
      const receiveAddr = utils.pubKeyToAddr(receiveAddrPubKey)
      const receivePath = `${utils.accountPath}/0/${i}`
      const changeAddr = utils.pubKeyToAddr(changeAddrPubKey)
      const changePath = `${utils.accountPath}/1/${i}`
      _receiveAddrMap.set(receivePath, receiveAddr)
      _changeAddrMap.set(changePath, changeAddr)
    }
    await utils.setXpubAndAddrs(_caches[storageKey.xpub], _receiveAddrMap, _changeAddrMap)
    console.info('xpub and addresses are saved')
  },
  clearXpub: async () => {
    await utils.setXpubAndAddrs()
    console.info('xpub is cleared')
  },
  getTotalBalance: (addresses, balances) => {
    return addresses
      .reduce((t, addr) => t + BigInt(balances.get(addr) || "0"), 0n)
      .toString();
  }
}
// business codes

/**
 * insert button
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo && changeInfo.status === 'complete' && tab.url.startsWith('https://explorer.nervos.org/address/')) {
    chrome.tabs.sendMessage(tabId, {
      type: 'AppendAddressBtn',
    })
  }
})

/**
 * handling messages
 */
chrome.runtime.onMessage.addListener(({
  action,
  payload
}, sender, sendResponse) => {
  switch (action) {
    case 'remove-xpub': {
      utils.setXpubAndAddrs('')
      break
    }
    case 'set-xpub': {
      utils.setXpubAndAddrs(payload || '').then(() => {
        utils.deriveMoreAddrs()
      })
      break
    }
    case 'derive-address': {
      utils.deriveMoreAddrs()
      break
    }
    defautl: {
      console.info('no response')
    }
  }
})

/**
 * 1. monitor addresses balances and send notification
 * 2. monitor wallet addresses and their balances, calculate total amount
 */
chrome.storage.onChanged.addListener(async _changes => {
  if (_changes.balances) {
    const _enabledNotification = await new Promise(resolve => {
      chrome.storage.local.get('notification', result => {
        return resolve(result && result.notification ? true : false)
      })
    })
    if (!_enabledNotification) return
    const {
      newValue,
      oldValue
    } = _changes.balances

    const _changedBalances = newValue
      .map(([addr, newBalance]) => {
        const oldData = oldValue.find(old => old[0] === addr)
        const oldBalance = oldData ? oldData[1] : ''
        return newBalance !== oldBalance ? [addr, oldBalance, newBalance] : undefined
      })
      .filter(data => !!data)

    if (!_changedBalances.length) return
    const iconUrl = chrome.runtime.getURL('images/ckb-enhanced.png')
    const message = _changedBalances
      .map(
        ([addr, oldBalance, newBalance]) =>
        `${addr.slice(0, 6)}...${addr.slice(-6)} changed from ${utils.formatCKB(
          oldBalance || '0',
        )} to ${utils.formatCKB(newBalance || '0')}`,
      )
      .join('\n')
    chrome.notifications.create(`${_changedBalances[0][0]}-${Date.now()}`, {
      type: 'basic',
      title: 'Balance changed',
      message,
      iconUrl,
      buttons: [],
      silent: true,
    })
  }
  if (_changes[storageKey.walletBalances] || _changes[storageKey.receives] || _changes[storageKey.changes]) {
    chrome.storage.local.get([storageKey.walletBalances, storageKey.receives, storageKey.changes], (_local) => {
      if (!_local || !_local[storageKey.walletBalances] || !_local[storageKey.receives] || !_local[storageKey.changes]) return
      const _addrList = [
        ..._local[storageKey.receives].map(([, _val]) => _val),
        ..._local[storageKey.changes].map(([, _val]) => _val),
      ]
      const _walletBalances = new Map(_local[storageKey.walletBalances])
      const total = utils.getTotalBalance(_addrList, _walletBalances)
      chrome.storage.local.set({
        [storageKey.walletTotalBalance]: total
      }, () => {
        console.info('Wallet total balance updated')
      })
    })
  }
})

/**
 * open explorer on click notification
 */
chrome.notifications.onClicked.addListener(id => {
  const addr = id.split('-')[0]
  if (addr) {
    chrome.tabs.create({
      url: `https://explorer.nervos.org/address/${addr}`,
    })
  }
})
