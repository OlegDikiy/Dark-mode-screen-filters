const urlWelcomePage = 'https://www.google.com/';

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      chrome.tabs.create( { url: urlWelcomePage } );
    }
});

// chrome.runtime.onMessage.addListener(
//   (request, sender, sendResponse) => {
//       console.log("Получено сообщение:", request);
      
//       // Фильтрация по типу сообщения
//       if (request.type === "SAY_HELLO") {
//           // Действия с данными
//           console.log("Цвет фильтра:", request.color);
//       }
//   }
// );