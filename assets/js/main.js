document.addEventListener('DOMContentLoaded', () => {

    const naturalWonders = [
         { name: "Serengeti National Park", location: "Tanzania", lat: -2.3333, lng: 34.8333, description: "Home to the Great Migration, the Serengeti is a vast, ancient ecosystem where millions of wildebeest and zebra traverse the plains in a continuous cycle of life and death. Its name, derived from the Maasai language, means 'endless plains'.", image: "https://images.unsplash.com/photo-1532079753926-6d53a24fDD72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" }, { name: "Victoria Falls", location: "Zambia & Zimbabwe", lat: -17.9244, lng: 25.8566, description: "Known locally as 'Mosi-oa-Tunya' or 'The Smoke That Thunders,' Victoria Falls is one of the world's largest waterfalls. The sheer volume of water cascading into the gorge below creates a mist visible from miles away.", image: "https://images.unsplash.com/photo-1598583272223-9a35327e364e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80" }, { name: "Mount Kilimanjaro", location: "Tanzania", lat: -3.0674, lng: 37.3556, description: "Africa's highest peak, this dormant volcano rises from the plains, its snow-capped summit a stark contrast to the surrounding savanna. It is a symbol of resilience and natural majesty, a beacon for adventurers.", image: "https://images.unsplash.com/photo-1589553400936-7efe38a0f44b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" }, { name: "Okavango Delta", location: "Botswana", lat: -19.5333, lng: 22.7, description: "A unique inland delta where the Okavango River fans out into the Kalahari Desert, creating a lush, water-logged oasis. This pristine wilderness supports a staggering diversity of wildlife in a constantly shifting landscape.", image: "https://images.unsplash.com/photo-1596700335341-a1e46953256a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1548&q=80" }, { name: "Sahara Desert", location: "North Africa", lat: 23.4162, lng: 25.6628, description: "The world's largest hot desert, the Sahara is a realm of stark beauty. Its endless dunes, rocky plateaus, and hidden oases have shaped cultures and witnessed the passage of millennia. It is a testament to the power of extremes.", image: "https://images.unsplash.com/photo-1543389826-444738550b1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" }, { name: "Avenue of the Baobabs", location: "Madagascar", lat: -20.2508, lng: 44.4182, description: "A striking grove of ancient baobab trees lining a dirt road on the island of Madagascar. These majestic trees, some over 800 years old, create a surreal and unforgettable landscape, especially at sunrise and sunset.", image: "https://images.unsplash.com/photo-1563653123282-9c28e8f219e8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" }, { name: "The Nile River", location: "Northeast Africa", lat: 22.399, lng: 31.815, description: "The longest river in the world, the Nile has been the cradle of civilization for millennia. Its predictable floods sustained ancient Egypt, and it continues to be a vital artery of life, flowing through deserts and cities on its journey to the Mediterranean.", image: "https://images.unsplash.com/photo-1572569512154-8c7344933a02?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80" }
        ];

        const welcomeOverlay = document.getElementById('welcome-overlay');
        const infoPanel = document.getElementById('info-panel');
        const infoPanelContent = document.getElementById('info-panel-content');
        const panelCloseBtn = document.getElementById('panel-close-btn');
        const zoomInBtn = document.getElementById('zoom-in');
        const zoomOutBtn = document.getElementById('zoom-out');
        const body = document.body;

        let markers = [];
        let activeMarker = null;
        // FIX: UX-002 - State flag to prevent animation collisions
        let isAnimating = false;

        // FIX: CODE-001 - Wrap initialization in try...catch for resilience
        try {
            const map = L.map('map', { zoomControl: false, attributionControl: true, center: [2.8, 18.35], zoom: 4, minZoom: 3, maxZoom: 12 });
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map);

            // FIX: UX-002 & UX-003 - Set animation flag on move and disable map interaction
            map.on('movestart', () => { isAnimating = true; });
            map.on('moveend', () => { isAnimating = false; });

            const addMarkers = () => {
                naturalWonders.forEach((wonder, index) => {
                    // FIX: UX-001 - Markers are now buttons for accessibility
                    const markerIcon = L.divIcon({
                        className: 'reset-button', // Reset button styles
                        html: `<button type="button" class="custom-marker" style="--marker-delay: ${0.2 + index * 0.1}s" aria-label="View details for ${wonder.name}"></button>`,
                        iconSize: [18, 18],
                        iconAnchor: [9, 9]
                    });
                    const marker = L.marker([wonder.lat, wonder.lng], { icon: markerIcon, keyboard: true }).addTo(map);
                    marker.getElement().addEventListener('click', () => handleMarkerClick(wonder, marker));
                    markers.push(marker);
                });
            };

            const handleMarkerClick = (wonder, markerInstance) => {
                // FIX: UX-002 - Block clicks during animation
                if (isAnimating) return;
                if (activeMarker === markerInstance) { closePanel(); return; }
                
                map.flyTo([wonder.lat, wonder.lng], 7, { animate: true, duration: 1.5, easeLinearity: 0.1 });
                updatePanelContent(wonder);
                openPanel();

                if (activeMarker) { activeMarker.getElement().querySelector('.custom-marker').classList.remove('active'); }
                markers.forEach(m => m.getElement().querySelector('.custom-marker').classList.add('dimmed'));
                markerInstance.getElement().querySelector('.custom-marker').classList.remove('dimmed');
                markerInstance.getElement().querySelector('.custom-marker').classList.add('active');
                activeMarker = markerInstance;
            };

            const updatePanelContent = (wonder) => {
                // FIX: PERF-001 - Added onerror handler for image reliability
                const brokenImageUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='rgba(255,255,255,0.1)'%3E%3Cpath d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";
                infoPanelContent.innerHTML = `
                    <div class="panel-image-container">
                        <img src="${wonder.image}" alt="${wonder.name}" class="panel-image" onerror="this.onerror=null;this.src='${brokenImageUrl}';">
                    </div>
                    <div class="decorative-svg-corner">
                        <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 80 V 0 H 80" fill="none" stroke-opacity="0.3" stroke="var(--accent-color)" stroke-width="3"/>
                        </svg>
                    </div>
                    <div class="panel-text-content">
                        <h2>${wonder.name}</h2>
                        <h3>${wonder.location}</h3>
                        <p>${wonder.description}</p>
                    </div>
                `;
            };

            const openPanel = () => {
                infoPanel.classList.add('active');
                body.classList.add('panel-active');
                // FIX: UX-003 - Disable map interaction when panel is open
                map.dragging.disable();
                map.scrollWheelZoom.disable();
            };

            const closePanel = () => {
                infoPanel.classList.remove('active');
                body.classList.remove('panel-active');
                if (activeMarker) {
                    activeMarker.getElement().querySelector('.custom-marker').classList.remove('active');
                    activeMarker = null;
                }
                markers.forEach(m => m.getElement().querySelector('.custom-marker').classList.remove('dimmed'));
                map.flyTo([2.8, 18.35], 4, { animate: true, duration: 1.5, easeLinearity: 0.1 });
                // FIX: UX-003 - Re-enable map interaction
                map.dragging.enable();
                map.scrollWheelZoom.enable();
            };

            panelCloseBtn.addEventListener('click', closePanel);
            zoomInBtn.addEventListener('click', () => map.zoomIn());
            zoomOutBtn.addEventListener('click', () => map.zoomOut());
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });

            // FIX: ARCH-001 - Use event listener for more robust animation sequencing
            welcomeOverlay.addEventListener('transitionend', (event) => {
                if (event.propertyName === 'opacity' && welcomeOverlay.classList.contains('hidden')) {
                    addMarkers();
                }
            }, { once: true });

            setTimeout(() => {
                welcomeOverlay.classList.add('hidden');
            }, 3000);

        } catch (error) {
            console.error("CRITICAL ERROR: Map initialization failed.", error);
            document.body.innerHTML = '<div style="color:white;text-align:center;padding-top:20%;">A critical error occurred. Unable to load the experience. Please check your connection and try again.</div>';
        }
    });
