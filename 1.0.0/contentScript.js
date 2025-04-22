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
    
    let overlay = document.querySelector('.ColorFilterOverlay2204');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.classList.add('ColorFilterOverlay2204');
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            zIndex: '2147483647',
            pointerEvents: 'none',
            mixBlendMode: 'multiply',
            backgroundColor: request.color,
            opacity: '0',
            transition: 'opacity 0.5s ease'
        });
        
        document.body.appendChild(overlay);
        
        // Двойной таймаут для гарантии
        requestAnimationFrame(() => {
            setTimeout(() => {
                overlay.style.opacity = request.opacity || '0.5';
            }, 10);
        });
    } else {
        overlay.style.transition = 'background-color 0.5s ease, opacity 0.5s ease';
        overlay.style.backgroundColor = request.color;
        overlay.style.opacity = request.opacity || '0.5';
    }
});


