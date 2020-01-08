const notification = document.querySelector('#notification')

const storageKeys = {
  notification: 'notification'
}

chrome.storage.local.get(storageKeys.notification, (result) => {
  notification.checked = result && result[storageKeys.notification] === true
  notification.addEventListener('change', (e) => {
    chrome.storage.local.set({
      [storageKeys.notification]: e.target.checked
    })
  })
})
