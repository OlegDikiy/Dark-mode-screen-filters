const urlWelcomePage = 'https://www.google.com/';

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      chrome.tabs.create( { url: urlWelcomePage } );
    }
});