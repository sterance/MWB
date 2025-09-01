document.addEventListener('DOMContentLoaded', () => {
    const mainGrid = document.getElementById('main-grid');
    const addPanelBtn = document.getElementById('add-panel-btn');
    let panels = [];

    const createPanel = () => {
        const panelId = `panel-${Date.now()}`;
        const wrapper = document.createElement('div');
        wrapper.className = 'webview-wrapper relative bg-gray-800 rounded-lg overflow-hidden border border-gray-700';
        wrapper.dataset.panelId = panelId;

        const urlBarContainer = document.createElement('div');
        urlBarContainer.className = 'url-bar absolute top-0 left-0 right-0 p-2 bg-black bg-opacity-70 backdrop-blur-sm flex items-center gap-2 z-10';

        const urlInput = document.createElement('input');
        urlInput.type = 'text';
        urlInput.placeholder = 'Enter a URL and press Enter';
        urlInput.className = 'flex-grow bg-gray-700 text-white rounded-md px-3 py-1 text-sm border-gray-600 focus:ring-indigo-500 focus:border-indigo-500';

        const closeButton = document.createElement('button');
        closeButton.className = 'text-gray-400 hover:text-white hover:bg-red-600 rounded-full p-1';
        closeButton.title = 'Close panel';
        closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>`;

        const webview = document.createElement('webview');
        webview.className = 'w-full h-full border-0';
        webview.src = 'about:blank';
        webview.allowpopups = true;

        urlBarContainer.appendChild(urlInput);
        urlBarContainer.appendChild(closeButton);
        wrapper.appendChild(urlBarContainer);
        wrapper.appendChild(webview);
        mainGrid.appendChild(wrapper);

        const newPanel = { id: panelId, element: wrapper, webview: webview };
        panels.push(newPanel);
        updateGridLayout();

        urlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                let url = urlInput.value.trim();
                if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
                    url = 'https://' + url;
                }
                webview.loadURL(url);
            }
        });

        closeButton.addEventListener('click', () => {
            panels = panels.filter(p => p.id !== panelId);
            wrapper.remove();
            updateGridLayout();
        });
        
        // --- ENHANCED FULLSCREEN LOGIC ---
        webview.addEventListener('dom-ready', () => {
            // Inject fullscreen hijacking script
            webview.executeJavaScript(`
                (function() {
                    // Store original methods
                    const originalRequestFullscreen = Element.prototype.requestFullscreen;
                    const originalExitFullscreen = Document.prototype.exitFullscreen;
                    
                    // Track custom fullscreen state
                    let isCustomFullscreen = false;
                    let fullscreenElement = null;
                    let originalStyles = new Map();
                    
                    // Override all fullscreen request methods
                    function overrideMethod(obj, methodName, newMethod) {
                        if (obj[methodName]) {
                            obj[methodName] = newMethod;
                        }
                    }
                    
                    // Override standard requestFullscreen
                    Element.prototype.requestFullscreen = function(options) {
                        enterCustomFullscreen(this);
                        return Promise.resolve();
                    };
                    
                    // Override vendor prefixed versions
                    overrideMethod(Element.prototype, 'webkitRequestFullscreen', Element.prototype.requestFullscreen);
                    overrideMethod(Element.prototype, 'mozRequestFullScreen', Element.prototype.requestFullscreen);
                    overrideMethod(Element.prototype, 'msRequestFullscreen', Element.prototype.requestFullscreen);
                    
                    // Override exit fullscreen methods
                    Document.prototype.exitFullscreen = function() {
                        exitCustomFullscreen();
                        return Promise.resolve();
                    };
                    
                    overrideMethod(Document.prototype, 'webkitExitFullscreen', Document.prototype.exitFullscreen);
                    overrideMethod(Document.prototype, 'mozCancelFullScreen', Document.prototype.exitFullscreen);
                    overrideMethod(Document.prototype, 'msExitFullscreen', Document.prototype.exitFullscreen);
                    
                    // Override fullscreen properties
                    Object.defineProperty(document, 'fullscreenElement', {
                        get: () => isCustomFullscreen ? fullscreenElement : null,
                        configurable: true
                    });
                    
                    Object.defineProperty(document, 'webkitFullscreenElement', {
                        get: () => isCustomFullscreen ? fullscreenElement : null,
                        configurable: true
                    });
                    
                    Object.defineProperty(document, 'mozFullScreenElement', {
                        get: () => isCustomFullscreen ? fullscreenElement : null,
                        configurable: true
                    });
                    
                    Object.defineProperty(document, 'fullscreenEnabled', {
                        get: () => true,
                        configurable: true
                    });
                    
                    function enterCustomFullscreen(element) {
                        if (isCustomFullscreen) return;
                        
                        console.log('Entering custom fullscreen for element:', element);
                        
                        isCustomFullscreen = true;
                        fullscreenElement = element;
                        
                        // Store original styles
                        const computedStyle = getComputedStyle(element);
                        originalStyles.set(element, {
                            position: element.style.position || computedStyle.position,
                            top: element.style.top || computedStyle.top,
                            left: element.style.left || computedStyle.left,
                            width: element.style.width || computedStyle.width,
                            height: element.style.height || computedStyle.height,
                            zIndex: element.style.zIndex || computedStyle.zIndex,
                            backgroundColor: element.style.backgroundColor || computedStyle.backgroundColor,
                            margin: element.style.margin || computedStyle.margin,
                            padding: element.style.padding || computedStyle.padding,
                            border: element.style.border || computedStyle.border,
                            borderRadius: element.style.borderRadius || computedStyle.borderRadius,
                            transform: element.style.transform || computedStyle.transform,
                            objectFit: element.style.objectFit || computedStyle.objectFit
                        });
                        
                        // Apply fullscreen styles
                        element.style.setProperty('position', 'fixed', 'important');
                        element.style.setProperty('top', '0', 'important');
                        element.style.setProperty('left', '0', 'important');
                        element.style.setProperty('width', '100vw', 'important');
                        element.style.setProperty('height', '100vh', 'important');
                        element.style.setProperty('z-index', '999999', 'important');
                        element.style.setProperty('background-color', 'black', 'important');
                        element.style.setProperty('margin', '0', 'important');
                        element.style.setProperty('padding', '0', 'important');
                        element.style.setProperty('border', 'none', 'important');
                        element.style.setProperty('border-radius', '0', 'important');
                        
                        // For video elements
                        if (element.tagName === 'VIDEO') {
                            element.style.setProperty('object-fit', 'contain', 'important');
                        }
                        
                        // Hide body overflow and other content
                        document.body.style.setProperty('overflow', 'hidden', 'important');
                        
                        // Notify parent window about fullscreen state
                        try {
                            window.electronAPI?.notifyFullscreen?.(true);
                        } catch (e) {
                            console.log('Could not notify parent of fullscreen state');
                        }
                        
                        // Dispatch fullscreen events
                        const fullscreenEvent = new Event('fullscreenchange', { bubbles: true });
                        element.dispatchEvent(fullscreenEvent);
                        document.dispatchEvent(fullscreenEvent);
                        
                        // Also dispatch vendor-specific events
                        document.dispatchEvent(new Event('webkitfullscreenchange', { bubbles: true }));
                        document.dispatchEvent(new Event('mozfullscreenchange', { bubbles: true }));
                    }
                    
                    function exitCustomFullscreen() {
                        if (!isCustomFullscreen || !fullscreenElement) return;
                        
                        console.log('Exiting custom fullscreen');
                        
                        const element = fullscreenElement;
                        const styles = originalStyles.get(element);
                        
                        if (styles) {
                            // Restore original styles
                            Object.entries(styles).forEach(([prop, value]) => {
                                if (value && value !== 'auto' && value !== 'static') {
                                    element.style.setProperty(prop, value);
                                } else {
                                    element.style.removeProperty(prop);
                                }
                            });
                            originalStyles.delete(element);
                        }
                        
                        // Restore body overflow
                        document.body.style.removeProperty('overflow');
                        
                        // Notify parent window
                        try {
                            window.electronAPI?.notifyFullscreen?.(false);
                        } catch (e) {
                            console.log('Could not notify parent of fullscreen state');
                        }
                        
                        // Update state
                        isCustomFullscreen = false;
                        fullscreenElement = null;
                        
                        // Dispatch events
                        const fullscreenEvent = new Event('fullscreenchange', { bubbles: true });
                        element.dispatchEvent(fullscreenEvent);
                        document.dispatchEvent(fullscreenEvent);
                        
                        // Also dispatch vendor-specific events
                        document.dispatchEvent(new Event('webkitfullscreenchange', { bubbles: true }));
                        document.dispatchEvent(new Event('mozfullscreenchange', { bubbles: true }));
                    }
                    
                    // Handle ESC key for fullscreen exit
                    document.addEventListener('keydown', (e) => {
                        if (e.key === 'Escape' && isCustomFullscreen) {
                            e.preventDefault();
                            e.stopPropagation();
                            exitCustomFullscreen();
                        }
                    }, true); // Use capture phase
                    
                    // Handle click outside video to exit fullscreen
                    document.addEventListener('click', (e) => {
                        if (isCustomFullscreen && fullscreenElement && 
                            !fullscreenElement.contains(e.target)) {
                            exitCustomFullscreen();
                        }
                    }, true);
                    
                    // Inject CSS for better video handling
                    const style = document.createElement('style');
                    style.textContent = \`
                        video:fullscreen,
                        video:-webkit-full-screen,
                        video:-moz-full-screen {
                            width: 100% !important;
                            height: 100% !important;
                            object-fit: contain !important;
                            background: black !important;
                        }
                        
                        /* Handle YouTube and other video players */
                        .html5-video-player,
                        .video-js,
                        .plyr,
                        .vjs-tech {
                            background: black !important;
                        }
                        
                        /* Hide controls during custom fullscreen */
                        [data-custom-fullscreen="true"] .ytp-chrome-top,
                        [data-custom-fullscreen="true"] .ytp-chrome-bottom {
                            opacity: 0 !important;
                            transition: opacity 0.3s ease !important;
                        }
                        
                        [data-custom-fullscreen="true"]:hover .ytp-chrome-top,
                        [data-custom-fullscreen="true"]:hover .ytp-chrome-bottom {
                            opacity: 1 !important;
                        }
                    \`;
                    document.head.appendChild(style);
                    
                    // Mark custom fullscreen elements
                    function markCustomFullscreen(entering) {
                        if (fullscreenElement) {
                            if (entering) {
                                fullscreenElement.setAttribute('data-custom-fullscreen', 'true');
                            } else {
                                fullscreenElement.removeAttribute('data-custom-fullscreen');
                            }
                        }
                    }
                    
                    // Listen for our custom events to mark elements
                    document.addEventListener('fullscreenchange', () => {
                        markCustomFullscreen(isCustomFullscreen);
                    });
                    
                    console.log('Fullscreen API hijacking initialized');
                })();
            `);
        });

        // Handle fullscreen events from webview
        webview.addEventListener('enter-html-full-screen', (e) => {
            console.log('Webview attempting fullscreen, redirecting to custom implementation');
            e.preventDefault();
            wrapper.classList.add('is-fullscreen');
        });

        webview.addEventListener('leave-html-full-screen', () => {
            console.log('Exiting webview fullscreen');
            wrapper.classList.remove('is-fullscreen');
        });

        // Listen for messages from webview about fullscreen state
        webview.addEventListener('ipc-message', (event) => {
            if (event.channel === 'fullscreen-change') {
                if (event.args[0]) {
                    wrapper.classList.add('is-fullscreen');
                } else {
                    wrapper.classList.remove('is-fullscreen');
                }
            }
        });
    };

    const updateGridLayout = () => {
        const count = panels.length;
        mainGrid.className = 'p-2 gap-2 h-screen w-screen';

        if (count <= 0) {
            mainGrid.classList.add('grid', 'place-items-center');
        } else if (count === 1) {
            mainGrid.classList.add('grid', 'grid-cols-1', 'grid-rows-1');
        } else if (count === 2) {
            mainGrid.classList.add('grid', 'grid-cols-2', 'grid-rows-1');
        } else if (count === 3) {
            mainGrid.classList.add('grid', 'grid-cols-2', 'grid-rows-2');
            panels[0].element.style.gridRow = 'span 2';
            panels[1].element.style.gridRow = 'span 1';
            panels[2].element.style.gridRow = 'span 1';
            panels[0].element.style.gridColumn = '1';
            panels[1].element.style.gridColumn = '2';
            panels[2].element.style.gridColumn = '2';
        } else {
            mainGrid.classList.add('grid', 'grid-cols-2', 'grid-rows-2');
            panels.forEach(p => {
                p.element.style.gridRow = '';
                p.element.style.gridColumn = '';
            });
        }
    };

    addPanelBtn.addEventListener('click', createPanel);
    createPanel();
});