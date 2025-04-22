// Color filter
function findElementsByClass(className) {
  // Получаем все элементы на странице
  const allElements = document.querySelectorAll('*');
  const foundElements = [];

  // Проверяем каждый элемент
  allElements.forEach(element => {
    if (element.classList.contains(className)) {
      foundElements.push(element);
    }
  });

  return foundElements;
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.type !== "COLOR_FILTER") return;
  
  // Получаем или создаем оверлей
  let overlay = document.querySelector('.ColorFilterOverlay2204');
  
  if (!overlay) {
      overlay = document.createElement('div');
      overlay.classList.add('ColorFilterOverlay2204');
      
      // Устанавливаем базовые стили
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.zIndex = '2147483647';
      overlay.style.pointerEvents = 'none';
      overlay.style.mixBlendMode = 'multiply';
      overlay.style.transition = 'opacity 0.5s ease, background-color 0.5s ease';
      
      document.body.appendChild(overlay);
      console.log(overlay);
  }
  
  // Применяем текущие параметры
  overlay.style.backgroundColor = request.color;
  overlay.style.opacity = request.opacity || '0.5';
});

