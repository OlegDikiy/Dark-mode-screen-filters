console.log('contentScript.js загружен и готов к работе');

// Глобальная переменная для хранения overlay
let colorOverlay = null;

// Обработчик сообщений
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'APPLY_COLOR_OVERLAY') {
    applyColorOverlay();
    sendResponse({ status: 'success' });
    return true; // Для асинхронного ответа
  }
});

// Создаём или обновляем цветной оверлей
function applyColorOverlay() {
  if (colorOverlay && document.body.contains(colorOverlay)) {
    updateOverlay();
    console.log('Оверлей обновлён');
    return;
  }
  
  // Создаём новый div
  colorOverlay = document.createElement('div');
  colorOverlay.className = 'color-filter-overlay';
  
  // Применяем стили
  updateOverlay();
  
  // Добавляем на страницу
  document.body.appendChild(colorOverlay);
  console.log('Создан новый оверлей');
}

// Обновление стилей overlay
function updateOverlay() {
  chrome.storage.local.get(['currentTab', 'colorFilterRgba'], function(data) {
    const color = data.colorFilterRgba || 'rgba(20, 20, 24, 0.5)';

    // Если overlay уже существует - обновляем его
    try {
      Object.assign(colorOverlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: color,
        pointerEvents: 'none',
        mixBlendMode: 'multiply',
        zIndex: '2147483647',
        transition: 'background-color 0.3s ease' // Добавляем плавный переход
    });
    } catch (error) {
      console.error('Ошибка при обновлении overlay:', error);
    }
    
  });
}

// Удаление overlay (если нужно)
function removeColorOverlay() {
  if (colorOverlay && document.body.contains(colorOverlay)) {
    colorOverlay.remove();
    colorOverlay = null;
  }
}


// // let overlay = document.querySelector('.ColorFilterOverlay2204') || createOverlay();
// let currentColor = null;
// let currentOpacity = null;

// // Обработчик сообщений
// chrome.runtime.onMessage.addListener((request) => {
//   if (request.type !== "COLOR_FILTER") return;
  
//   if (!overlay || !document.contains(overlay)) {
//     overlay = createOverlay();
//   }
  
//   // Если параметры не изменились - ничего не делаем
//   if (currentColor === request.color && currentOpacity === (request.opacity || '0.5')) {
//     return;
//   }
  
//   // Запоминаем текущие параметры
//   currentColor = request.color;
//   currentOpacity = request.opacity || '0.5';
  
//   // Если это инициализация или системное изменение - без анимации
//   if (request.isInitial || !request.isUserAction) {
//     overlay.style.transition = 'none';
//     overlay.style.backgroundColor = currentColor;
//     overlay.style.opacity = currentOpacity;
    
//     // Восстанавливаем анимацию для будущих изменений
//     setTimeout(() => {
//       overlay.style.transition = 'opacity 0.5s ease, background-color 0.5s ease';
//     }, 10);
//   } else {
//     // Пользовательское изменение - с анимацией
//     overlay.style.backgroundColor = currentColor;
//     overlay.style.opacity = currentOpacity;
//   }
// });

// // Проверка storage при загрузке
// chrome.storage.local.get(['colorFilterRgba'], (result) => {
//   if (result.colorFilterRgba) {
//     currentColor = result.colorFilterRgba;
//     currentOpacity = '0.5';
//     overlay.style.transition = 'none';
//     overlay.style.backgroundColor = currentColor;
//     overlay.style.opacity = currentOpacity;
    
//     setTimeout(() => {
//       overlay.style.transition = 'opacity 0.5s ease, background-color 0.5s ease';
//     }, 10);
//   }
// });