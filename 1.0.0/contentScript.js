// Color filter
function createColorFilter(color = 'rgba(255, 200, 150, 0.8)') {
    const overlay = document.createElement('div');
    overlay.className = 'color-filter-overlay';
    overlay.style.backgroundColor = color;
    document.body.appendChild(overlay);
    return overlay;
  };	
  
  createColorFilter();