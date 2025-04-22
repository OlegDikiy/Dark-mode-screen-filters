let overlay = document.querySelector('.ColorFilterOverlay2204') || createOverlay();
let currentColor = null;
let currentOpacity = null;

// Обработчик сообщений
chrome.runtime.onMessage.addListener((request) => {
  if (request.type !== "COLOR_FILTER") return;
  
  if (!overlay || !document.contains(overlay)) {
    overlay = createOverlay();
  }
  
  // Если параметры не изменились - ничего не делаем
  if (currentColor === request.color && currentOpacity === (request.opacity || '0.5')) {
    return;
  }
  
  // Запоминаем текущие параметры
  currentColor = request.color;
  currentOpacity = request.opacity || '0.5';
  
  // Если это инициализация или системное изменение - без анимации
  if (request.isInitial || !request.isUserAction) {
    overlay.style.transition = 'none';
    overlay.style.backgroundColor = currentColor;
    overlay.style.opacity = currentOpacity;
    
    // Восстанавливаем анимацию для будущих изменений
    setTimeout(() => {
      overlay.style.transition = 'opacity 0.5s ease, background-color 0.5s ease';
    }, 10);
  } else {
    // Пользовательское изменение - с анимацией
    overlay.style.backgroundColor = currentColor;
    overlay.style.opacity = currentOpacity;
  }
});

// Проверка storage при загрузке
chrome.storage.local.get(['colorFilterRgba'], (result) => {
  if (result.colorFilterRgba) {
    currentColor = result.colorFilterRgba;
    currentOpacity = '0.5';
    overlay.style.transition = 'none';
    overlay.style.backgroundColor = currentColor;
    overlay.style.opacity = currentOpacity;
    
    setTimeout(() => {
      overlay.style.transition = 'opacity 0.5s ease, background-color 0.5s ease';
    }, 10);
  }
});