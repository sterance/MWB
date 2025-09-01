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
        
        // --- FINAL FULLSCREEN LOGIC ---
        webview.addEventListener('enter-html-full-screen', (e) => {
            e.preventDefault();
            wrapper.classList.add('is-fullscreen');
        });

        webview.addEventListener('leave-html-full-screen', () => {
            wrapper.classList.remove('is-fullscreen');
        });
    };

    const updateGridLayout = () => {
        const count = panels.length;
        mainGrid.className = 'p-2 gap-2 h-screen w-screen'; // Reset classes

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
        } else { // 4 or more
            mainGrid.classList.add('grid', 'grid-cols-2', 'grid-rows-2');
            panels.forEach(p => {
                p.element.style.gridRow = '';
                p.element.style.gridColumn = '';
            });
        }
    };

    addPanelBtn.addEventListener('click', createPanel);
    createPanel(); // Start with one panel
});