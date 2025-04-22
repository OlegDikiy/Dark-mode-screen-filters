document.addEventListener('DOMContentLoaded', () => {
	// DOM элементы
	// Welcome page link in background.js
	// Uninstal link not supported in manifest v3
	const urlStorePage = 'https://google.com';
	const urlFeedback = 'https://ya.ru';

	const shadeFilterColor = '#141418';
	const blueLightFilterColor = '#FF9E2D';

	const intensityRangeInput = document.getElementById('screenFilterIntensity');
	const intensityRangeCounter = document.querySelector('.intensity-range-counter');
	
	const contrastRangeInput = document.getElementById('darkModeContrastRange');
	const contrastRangeCounter = document.querySelector('.contrast-range-counter');
	
	const brightnessRangeInput = document.getElementById('darkModeBrightnessRange');
	const brightnessRangeCounter = document.querySelector('.brightness-range-counter');
	
	const grayscaleRangeInput = document.getElementById('darkModeGrayScaleRange');
	const grayscaleRangeCounter = document.querySelector('.grayscale-range-counter');
	
	const colorButtonList = document.querySelectorAll('.color-filter-button');
	const allRangeInputs = document.querySelectorAll('.screenFilterRange');
	const allModeTabs = document.querySelectorAll('.filter-mode-button');
	const allScreenFilterTabs = document.querySelectorAll('.screen-filter-type-button');
  	const allStarsButton = document.querySelectorAll('.rating-form-star');
	
	const screenFilterColorButton = document.querySelector('#screenFilterColorButton');
	const screenFilterShadeButton = document.querySelector('#screenFilterShadeButton');
	const screenFilterBlueLightButton = document.querySelector('#screenFilterBlueLightButton');
	
	const screenFilterButton = document.querySelector('#screenFiltersButton');
	const darkModeButton = document.querySelector('#darkModeButton');
  	const shutdownButton = document.querySelector('.shutdown-button');
	
	let shadeSeparateInput = 0;
	let blueLightSeparateInput = 0;
	let colorSeparateInput = 0;

	// Первый запуск 
  	intensityRangeInput.addEventListener('mousedown', () => {
    	const noActiveFilter = (
      		!screenFilterBlueLightButton?.checked &&
      		!screenFilterShadeButton?.checked &&
      		!screenFilterColorButton?.checked
    	);

    	if (intensityRangeInput.value == '0' && noActiveFilter) {
    		console.log('paw');
    		screenFilterShadeButton.checked = true;
    	}
  	});

  allScreenFilterTabs.forEach(element => {
    element.addEventListener('click', function() {
      	const settingsMap = {
        	'screenFilterShadeButton': { key: 'shade', defaultValue: 50, varName: 'shadeSeparateInput' },
        	'screenFilterBlueLightButton': { key: 'blueLight', defaultValue: 50, varName: 'blueLightSeparateInput' },
        	'screenFilterColorButton': { key: 'colorIntensity', defaultValue: 50, varName: 'colorIntensity' }
    	};

      const config = settingsMap[element.id];
      if (!config) return;

      chrome.storage.local.get(config.key, (settings) => {
        if (!(config.key in settings)) {
          // Устанавливаем значение по умолчанию
          window[config.varName] = config.defaultValue;
          intensityRangeInput.value = config.defaultValue;
          updateIntensityRangeStyle();
          console.log(window[config.varName]);
        }
        writeSettings();
      });
    });
  });

	// Вспомогательные функции
	function isSystemPage(url) {
		const systemPrefixes = [
		  'chrome://',    // Страницы Chrome (настройки, история)
		  'about:',       // about:blank, about:newtab
		  'edge://',      // Для Microsoft Edge
		  'opera://',     // Для Opera
		  'chrome-extension://',  // Другие расширения
		  'moz-extension://'      // Firefox
		];
		return systemPrefixes.some(prefix => url.startsWith(prefix));
	  }

  	function sendMessage (color) {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			const tab = tabs[0];
			if (tab?.url && !isSystemPage(tab.url)) {
				const tabId = tabs[0].id;
				chrome.tabs.sendMessage(tabId, {
					type: "COLOR_FILTER",
					color: color
				});
			}
		})
		console.log('send', color);
	};

	function determineCheckedButtonId( list ) {
		for (const button of list) {
			if (button.checked) {
				return button.id;
			}
		}
	};

	function rgbToHex(rgb) {
		const [r, g, b] = rgb.match(/\d+/g).map(Number);
		return '#' + [r, g, b].map(x => 
		  x.toString(16).padStart(2, '0')
		).join('').toLowerCase();
	  };

	function hexToRgb(hex) {
		const r = parseInt(hex.substring(1, 3), 16);
		const g = parseInt(hex.substring(3, 5), 16);
		const b = parseInt(hex.substring(5, 7), 16);
		return `rgb(${r}, ${g}, ${b})`;
	};

	function rgbToRgba ( color, alpha ) {
		return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
	};

	// Разделение range input для фильтров
	allScreenFilterTabs.forEach(element => {
		element.addEventListener('click', function() {
			// 1. Обновляем состояние кнопки
			this.checked = true;
			separateInput();
			sendMessage ( getColorSettings () );
		});
	});

	// Отправка сообщения при клике на кнопки цветов
	colorButtonList.forEach(element => {
		element.addEventListener('click', function() {
			sendMessage ( getColorSettings () );
		});
	});

	function separateInput() {
		const valueMap = {
			'screenFilterShadeButton': shadeSeparateInput,
			'screenFilterBlueLightButton': blueLightSeparateInput,
			'screenFilterColorButton': colorSeparateInput
		};

		const buttonId = determineCheckedButtonId( allScreenFilterTabs );

		intensityRangeInput.value = valueMap[buttonId] || intensityRangeInput.value;

		updateIntensityRangeStyle();
	};

	// Переключение вкладок
	function switchTabs(button) {
		switch(button) {
			case screenFilterButton:
				document.querySelector('.dark-mode-settings').style.display = 'none';
				document.querySelector('.screen-filters-settings').style.display = 'block';
				activeTab = screenFilterButton;
				break;
			case darkModeButton:
				document.querySelector('.screen-filters-settings').style.display = 'none';
				document.querySelector('.dark-mode-settings').style.display = 'block';
				activeTab = darkModeButton;
				break;
		}
	}

	// Сохранение настроек
	function writeSettings() {
		const settings = {
			color: '#FF6A6A',
		};

		settings.contrast = contrastRangeInput.value;
		settings.brightness = brightnessRangeInput.value;
		settings.grayscale = grayscaleRangeInput.value;

		const activeColorButtonId = determineCheckedButtonId( colorButtonList );
		const colorButtonElement = document.getElementById( activeColorButtonId );
		const computedBgColor = window.getComputedStyle( colorButtonElement ).backgroundColor;
		settings.color = rgbToHex( computedBgColor );

		let currentTab = determineCheckedButtonId( allScreenFilterTabs );
		let currentMode = determineCheckedButtonId( allModeTabs );

		settings.currentMode = currentMode === 'screenFiltersButton' ? 'filters' : 'darkMode';

		if (currentTab) {
			const tabHandlers = {
				'screenFilterShadeButton': () => {
					shadeSeparateInput = intensityRangeInput.value;
					settings.shade = shadeSeparateInput;
					settings.currentTab = 'shade';
				},
				'screenFilterBlueLightButton': () => {
					blueLightSeparateInput = intensityRangeInput.value;
					settings.blueLight = blueLightSeparateInput;
					settings.currentTab = 'blueLight';
				},
				'screenFilterColorButton': () => {
					colorSeparateInput = intensityRangeInput.value;
					settings.colorIntensity = colorSeparateInput;
					settings.currentTab = 'color';
				}
			};
		
			const handler = tabHandlers[currentTab];
			if (handler) handler();
		};

		chrome.storage.local.set( settings );
	}

	// Обработчики изменений настроек
	[...allRangeInputs, ...colorButtonList, ...allScreenFilterTabs, ...allModeTabs].forEach(element => {
		element.addEventListener(element === 'range' ? 'input' : 'click', writeSettings);
	});



	// Загрузка настроек
	function loadSettings() {
		chrome.storage.local.get(
			['blueLight', 'colorIntensity', 'shade', 'brightness', 'contrast', 'grayscale', 'color', 'currentTab', 'currentMode', 'rollup', 'ratingStar'], 
			function(data) {
				// Установка значений для раздельных фильтров
				blueLightSeparateInput = data.blueLight || 0;
				colorSeparateInput = data.colorIntensity || 0;
				shadeSeparateInput = data.shade || 0;

				// Установка активного режима
				if (data.currentMode == 'darkMode') {
					darkModeButton.checked = true;
					switchTabs(darkModeButton);
				} else {
					screenFilterButton.checked = true;
				}

				// Установка активной вкладки
				switch (data.currentTab) {
					case 'shade':
						screenFilterShadeButton.checked = true;
						intensityRangeInput.value = shadeSeparateInput;
						break;
					case 'blueLight':
						screenFilterBlueLightButton.checked = true;
						intensityRangeInput.value = blueLightSeparateInput;
						break;
					case 'color':
						screenFilterColorButton.checked = true;
						intensityRangeInput.value = colorSeparateInput;
						showColorSetting();
						break;
				}
				
				// Установка значений для range inputs
				if (data.brightness) brightnessRangeInput.value = data.brightness;
				if (data.contrast) contrastRangeInput.value = data.contrast;
				if (data.grayscale) grayscaleRangeInput.value = data.grayscale;
				
				// Восстановление цветных radio-кнопок
				if ( data.color ) {
					const setColorFilter = [...document.querySelectorAll('.color-filter-button')]
					.find(button => {
    					const buttonColor = rgbToHex( window.getComputedStyle(button).backgroundColor );
    					return buttonColor === data.color.toLowerCase();
  					});

					if (setColorFilter) {
  						setColorFilter.checked = true;
					};
				};

				chrome.storage.local.get(['ratingStar'], function(data) {
					if (data.ratingStar) {
						const stars = Array.from(allStarsButton);
						const activeStar = document.getElementById(data.ratingStar);
						const activeIndex = stars.indexOf(activeStar);
						
						if (activeIndex !== -1) {
							updateStarsVisualState(stars, activeIndex);
						}
					}
				});

				// Обновление стилей range inputs
				updateIntensityRangeStyle();
				updateContrastRange();
				updateBrightnessRange();
				updateGrayscaleRange();
			
        if (data.rollup === true) {  
          console.log('загруженное состояние, свернуто');
          shutdownButton.checked = true;  
          shutdown();
      };
      }
		);
	}

	// Обработчики переключения вкладок
	screenFilterButton.addEventListener('click', () => {
		switchTabs(screenFilterButton);
	});

	darkModeButton.addEventListener('click', () => {
		switchTabs(darkModeButton);
	});

	// Видимость настроек цвета
	function showColorSetting() {
		if (screenFilterColorButton.checked) {
			document.querySelector('.color-filter-setting').style.display = 'flex';
		} else {
			document.querySelector('.color-filter-setting').style.display = 'none';
		}
	}

	screenFilterColorButton.addEventListener('click', showColorSetting);
	screenFilterShadeButton.addEventListener('click', showColorSetting);
	screenFilterBlueLightButton.addEventListener('click', showColorSetting);

	// Функции стилизации range inputs
	const updateIntensityRangeStyle = () => {
		const value = intensityRangeInput.value;
		const max = intensityRangeInput.max;
		const percent = (value / max) * 100;

		intensityRangeInput.style.background = `
			linear-gradient(
				to right,
				var(--checked-mode-button-bg-color) ${percent}%,
				var(--range-slider-inactive-color) ${percent}%
			)
		`;

		intensityRangeCounter.textContent = `${value}%`;
	};

	const updateCenteredRangeStyle = (input, counter) => {
		const value = parseFloat(input.value);
		const min = parseFloat(input.min);
		const max = parseFloat(input.max);

		let percent;
		if (value >= 0) {
			percent = (value / max) * 50;
			input.style.background = `
				linear-gradient(
					to right,
					var(--range-slider-inactive-color) 50%,
					var(--checked-mode-button-bg-color) 50%,
					var(--checked-mode-button-bg-color) ${50 + percent}%,
					var(--range-slider-inactive-color) ${50 + percent}%
				)
			`;
		} else {
			percent = (Math.abs(value) / Math.abs(min)) * 50;
			input.style.background = `
				linear-gradient(
					to right,
					var(--range-slider-inactive-color) ${50 - percent}%,
					var(--checked-mode-button-bg-color) ${50 - percent}%,
					var(--checked-mode-button-bg-color) 50%,
					var(--range-slider-inactive-color) 50%
				)
			`;
		}

		counter.textContent = `${value > 0 ? '+' : ''}${value}`;
	};

	// Инициализация range inputs
	intensityRangeInput.addEventListener('input', updateIntensityRangeStyle);
	updateIntensityRangeStyle();

	const updateContrastRange = () => updateCenteredRangeStyle(contrastRangeInput, contrastRangeCounter);
	contrastRangeInput.addEventListener('input', updateContrastRange);
	updateContrastRange();

	const updateBrightnessRange = () => updateCenteredRangeStyle(brightnessRangeInput, brightnessRangeCounter);
	brightnessRangeInput.addEventListener('input', updateBrightnessRange);
	updateBrightnessRange();

	const updateGrayscaleRange = () => updateCenteredRangeStyle(grayscaleRangeInput, grayscaleRangeCounter);
	grayscaleRangeInput.addEventListener('input', updateGrayscaleRange);
	updateGrayscaleRange();

	// Рейтинг звёздами
	function updateStarsVisualState(stars, activeIndex) {
		stars.forEach((star, index) => {
			star.classList.toggle('active', index >= activeIndex);
		});
	};			

	allStarsButton.forEach((star, index, stars) => {
		star.addEventListener('click', () => {
			updateStarsVisualState(stars, index);
		});
	});

  // Сохранение звёзд
  allStarsButton.forEach(element => {
    element.addEventListener('click', function() {
      let checkedStar = determineCheckedButtonId( allStarsButton );
	  chrome.storage.local.set( {ratingStar: checkedStar} );
	  if ( checkedStar === 'star5' || checkedStar === 'star4' ) {
		chrome.tabs.create({ url: urlStorePage });
	  } else {
		chrome.tabs.create({ url: urlFeedback });
	  }
    });
  });

  // Кнннопка выключения
  shutdownButton.addEventListener('click', ()=> {
    shutdown();
    if (shutdownButton.checked) {
      chrome.storage.local.set( { rollup: true } );
      chrome.storage.local.get(null, function(data) {
        console.log("Все данные из хранилища:", data);
      });
    } else {
      chrome.storage.local.set({ rollup: false });
      chrome.storage.local.get(null, function(data) {
        console.log("Все данные из хранилища:", data);
      });
    }
  })

  function shutdown () {
    if (shutdownButton.checked) {
          [...allScreenFilterTabs, ...allModeTabs].forEach(tab => {
            tab.checked = false;
          });
        };

    const main = document.querySelector('main');
        
    Array.from(main.children).forEach(child => {
      if (child.tagName === 'DIV' && 
        !child.classList.contains('filter-mode-bar') && 
        !child.classList.contains('rate-us')) {
              
          if (shutdownButton.checked) {
            child.classList.add('hidden');
          } else {
            child.classList.remove('hidden');
            chrome.storage.local.get(
              ['currentTab', 'currentMode'], 
              function(data) {
                // Установка активного режима
				if (data.currentMode == 'darkMode') {
				    darkModeButton.checked = true;
				    switchTabs(darkModeButton);
				} else {
				    screenFilterButton.checked = true;
				}

				// Установка активной вкладки
				switch (data.currentTab) {
				    case 'shade':
				        screenFilterShadeButton.checked = true;
				        intensityRangeInput.value = shadeSeparateInput;
				      break;
				  case 'blueLight':
				        screenFilterBlueLightButton.checked = true;
				        intensityRangeInput.value = blueLightSeparateInput;
				    break;
				  case 'color':
				      screenFilterColorButton.checked = true;
				      intensityRangeInput.value = colorSeparateInput;
				      showColorSetting();
				    break;
				}
              });
          }
        }
    });
  };

  allModeTabs.forEach(element => {
    element.addEventListener('click', function() {
        if (shutdownButton.checked) {
          console.log('hi');
          shutdownButton.checked = false;
          shutdown();
          chrome.storage.local.set({ rollup: false });
        }; 
    });
  });

	// Локализация
	const elements = document.querySelectorAll('[data-i18n]');
	
	elements.forEach(element => {
		const messageName = element.getAttribute('data-i18n');
		element.textContent = chrome.i18n.getMessage(messageName);
		
		if (element.hasAttribute('data-i18n-attr')) {
			const attrName = element.getAttribute('data-i18n-attr');
			element.setAttribute(attrName, chrome.i18n.getMessage(messageName));
		}
	});

	// Локализация псевдоэлементов
	document.querySelectorAll('[data-i18n-after]').forEach(element => {
		const messageName = element.getAttribute('data-i18n-after');
		const translatedText = chrome.i18n.getMessage(messageName);
		
		const style = document.createElement('style');
		style.textContent = `
			#${element.id}::after {
				content: "${translatedText}" !important;
			}
		`;
		document.head.appendChild(style);
	});

	//Отправка цветов и интенсивности для фильтров
	intensityRangeInput.addEventListener('mouseup', ()=> {
		sendMessage ( getColorSettings () );
	});

	function getColorSettings() {
		const buttonId = determineCheckedButtonId(allScreenFilterTabs);
		const intensity = intensityRangeInput.value;
		let filterColor;
	
		switch (buttonId) {
			case 'screenFilterShadeButton':
				filterColor = hexToRgb(shadeFilterColor);
				break;
			case 'screenFilterBlueLightButton':
				filterColor = hexToRgb(blueLightFilterColor);
				break;
			case 'screenFilterColorButton':
				const colorButton = determineCheckedButtonId(colorButtonList);
				filterColor = window.getComputedStyle(document.getElementById(colorButton)).backgroundColor;
				break;
			default:
				// Fallback на случай, если ни одна кнопка не выбрана
				filterColor = 'rgb(255, 200, 150)';
		}
	
		const sendingColor = rgbToRgba(filterColor, intensity / 100);
		console.log('getColor', sendingColor);
		return sendingColor;
	}

	// Инициализация
	loadSettings();
	sendMessage ( getColorSettings () );
});