// Color filter
function createColorFilter(color = 'rgba(255, 200, 150, 0.8)') {
    const overlay = document.createElement('div');
    overlay.className = 'color-filter-overlay';
    overlay.style.backgroundColor = color;
    document.body.appendChild(overlay);
    return overlay;
  };	
  
  //createColorFilter();

  chrome.runtime.onMessage.addListener((request) => {
    if (request.type === "COLOR_FILTER") {
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';  // или 'absolute'
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.zIndex = '2147483647';  // Максимальный z-index
      overlay.style.backgroundColor = request.color;
      overlay.style.pointerEvents = 'none';  // Чтобы клики проходили сквозь
      document.body.appendChild(overlay);
    }
  });


