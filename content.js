const baseUrl = 'https://api.explorer.nervos.org/';
const addrAPI = `${baseUrl}api/v1/addresses`
const headers = new Headers({
  'Content-Type': "application/vnd.api+json",
  "Accept": "application/vnd.api+json"
})

const storageKey = {
  addresses: 'addresses',
  balances: 'balances',
  lastUpdateTime: 'lastUpdateTime'
}

const updateBalnace = async () => {
  const addresses = await new Promise((resolve) => {
    chrome.storage.local.get(storageKey.addresses, s => {
      return Array.isArray(s.addresses) ? resolve(s.addresses) : resolve([])
    })
  })
  const balances = await Promise.all(addresses.map(addr => fetch(`${addrAPI}/${addr}`, {
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
  }).catch(() => '')))
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
