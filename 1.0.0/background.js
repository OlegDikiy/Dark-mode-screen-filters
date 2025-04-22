const urlWelcomePage = 'https://www.google.com/';

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      chrome.tabs.create( { url: urlWelcomePage } );
      chrome.storage.local.set({ isEnabled: true });
      initializeOnAllTabs();
    }
});

function isSystemPage(url) {
  if (!url) return true; // Без URL - считаем системной
  
  const systemPatterns = [
    /^chrome:\/\//i,
    /^edge:\/\//i,
    /^about:/i,
    /^opera:\/\//i,
    /^chrome-extension:\/\//i,
    /^moz-extension:\/\//i,
    /^file:\/\//i,
    /^view-source:/i
  ];
  
  return systemPatterns.some(pattern => pattern.test(url));
}

// Слушаем смену активной вкладки
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.storage.local.get(['isEnabled'], (result) => {
    if (result.isEnabled) {
      updateTab(activeInfo.tabId);
    }
  });
});

// Слушаем обновление вкладки (перезагрузка страницы)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    const { isEnabled } = await chrome.storage.local.get(['isEnabled']);
    if (isEnabled) {
      const tab = await chrome.tabs.get(tabId);
      if (!isSystemPage(tab.url)) {
        await updateTab(tabId);
      }
    }
  }
});

// Инициализация на всех открытых вкладках
function initializeOnAllTabs() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.id) updateTab(tab.id);
    });
  });
}

// Обновление конкретной вкладки
async function updateTab(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (isSystemPage(tab.url)) return;
    
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['contentScript.js']
    });
    
    const result = await chrome.storage.local.get(['colorFilterRgba']);
    if (result.colorFilterRgba) {
      await chrome.tabs.sendMessage(tabId, {
        type: "COLOR_FILTER",
        color: result.colorFilterRgba,
        opacity: '0.5',
        isInitial: true // Помечаем как инициализацию
      });
    }
  } catch (error) {
    console.error('Error in updateTab:', error);
  }
}


function sendMessage(tabId, color) {
  chrome.tabs.get(tabId, (tab) => {
    if (tab?.url && !isSystemPage(tab.url)) {
      chrome.tabs.sendMessage(tabId, {
        type: "COLOR_FILTER",
        color: color
      }).then(() => {
        console.log('Message sent to tab', tabId, 'Color:', color);
      }).catch((error) => {
        console.error('Failed to send message:', error);
      });
    }
  });
}