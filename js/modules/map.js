// js/modules/map.js

import { getImages, COORDINATES } from './utils.js';

// 1. 注入 CSS (HUD 科技风 + 选项卡布局)
const style = document.createElement('style');
style.textContent = `
    /* 悬浮球 */
    #map-wrapper {
        position: fixed; bottom: 25px; right: 25px; width: 60px; height: 60px;
        z-index: 9998; border-radius: 50%; 
        box-shadow: 0 0 30px rgba(0, 174, 236, 0.4);
        transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
        overflow: hidden; border: 2px solid rgba(255,255,255,0.6); 
        background: #111; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
    }
    
    /* 展开态：战术大屏 */
    #map-wrapper.active {
        width: 850px; height: 600px; border-radius: 16px;
        bottom: 50%; right: 50%; transform: translate(50%, 50%);
        z-index: 10001; border-color: #00aeec;
        cursor: default;
        background: rgba(18, 18, 18, 0.95);
        backdrop-filter: blur(15px);
        display: flex; flex-direction: column;
    }

    #leaflet-map { flex: 1; width: 100%; opacity: 0; transition: opacity 0.5s; z-index: 1; }
    #map-wrapper.active #leaflet-map { opacity: 1; }

    /* 悬浮图标 */
    .map-icon { font-size: 28px; pointer-events: none; transition: 0.3s; }
    #map-wrapper:hover .map-icon { transform: scale(1.2); }
    #map-wrapper.active .map-icon { display: none; }

    /* UI 顶栏 (搜索 + 切换) */
    .map-ui-header {
        position: absolute; top: 20px; left: 20px; right: 20px;
        z-index: 1000; display: none; flex-direction: column; gap: 10px;
        pointer-events: none; /* 让点击穿透到地图，具体元素开启 pointer-events */
    }
    #map-wrapper.active .map-ui-header { display: flex; }

    /* 模式切换 Tabs */
    .map-tabs { 
        display: flex; gap: 5px; pointer-events: auto; width: fit-content; 
        background: rgba(0,0,0,0.6); padding: 4px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);
    }
    .map-tab {
        padding: 6px 15px; border-radius: 6px; cursor: pointer; color: #aaa; font-size: 13px; font-weight: bold; transition: 0.2s;
    }
    .map-tab:hover { color: white; background: rgba(255,255,255,0.1); }
    .map-tab.active { background: #00aeec; color: white; box-shadow: 0 2px 8px rgba(0, 174, 236, 0.4); }

    /* 搜索条 */
    .map-search-row { display: flex; gap: 10px; pointer-events: auto; max-width: 400px; }
    .map-input {
        flex: 1; padding: 10px 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2);
        background: rgba(0,0,0,0.7); color: white; outline: none; font-size: 14px;
        backdrop-filter: blur(5px); transition: 0.3s;
    }
    .map-input:focus { border-color: #00aeec; background: rgba(0,0,0,0.9); }
    .map-btn {
        padding: 0 20px; border-radius: 8px; border: none;
        background: #00aeec; color: white; cursor: pointer; font-weight: bold;
        transition: 0.2s; white-space: nowrap;
    }
    .map-btn:hover { background: #008acb; }

    /* 图层控制器 (右下角) */
    .map-layers {
        position: absolute; bottom: 30px; right: 20px; z-index: 1000;
        display: none; flex-direction: column; gap: 8px; pointer-events: auto;
    }
    #map-wrapper.active .map-layers { display: flex; }
    .layer-btn {
        width: 40px; height: 40px; border-radius: 8px; border: 2px solid rgba(255,255,255,0.3);
        background-size: cover; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    }
    .layer-btn:hover, .layer-btn.active { border-color: #00aeec; transform: scale(1.1); }
    .layer-btn.dark { background: #222; }
    .layer-btn.light { background: #ddd; }
    .layer-btn.sat { background: #354a21; }

    /* 关闭按钮 */
    .map-close {
        position: absolute; top: 20px; right: 20px;
        color: white; font-size: 24px; cursor: pointer; display: none;
        z-index: 1001; width: 32px; height: 32px; pointer-events: auto;
        background: rgba(255,255,255,0.1); border-radius: 50%;
        align-items: center; justify-content: center; transition: 0.2s;
    }
    .map-close:hover { background: #ff4d4d; }
    #map-wrapper.active .map-close { display: flex; }

    /* 标记点样式 */
    .custom-marker {
        background-color: #00aeec; border: 2px solid white; border-radius: 50%;
        box-shadow: 0 0 10px #00aeec; transition: 0.3s;
    }
    .custom-marker:hover { background-color: #fb7299; transform: scale(1.5); box-shadow: 0 0 15px #fb7299; z-index: 1000 !important; }
    
    /* 弹窗美化 */
    .leaflet-popup-content-wrapper { background: rgba(255,255,255,0.95); border-radius: 8px; }
    .leaflet-popup-tip { background: rgba(255,255,255,0.95); }
`;
document.head.appendChild(style);

function loadResource(type, url) {
    return new Promise((resolve, reject) => {
        let tag;
        if (type === 'css') {
            tag = document.createElement('link'); tag.rel = 'stylesheet'; tag.href = url;
        } else {
            tag = document.createElement('script'); tag.src = url;
        }
        tag.onload = resolve; tag.onerror = reject; document.head.appendChild(tag);
    });
}

async function initMap() {
    const old = document.getElementById('map-wrapper'); if(old) old.remove();

    const wrapper = document.createElement('div');
    wrapper.id = 'map-wrapper';
    wrapper.title = "双击展开战术地图";
    
    // 🔥 全新的 UI 结构：Tab + Search + Layers
    wrapper.innerHTML = `
        <div class="map-icon">🗺️</div>
        
        <div class="map-ui-header">
            <div class="map-tabs">
                <div class="map-tab active" data-mode="img">📸 搜作品</div>
                <div class="map-tab" data-mode="geo">🌏 搜地点</div>
            </div>
            <div class="map-search-row">
                <input type="text" id="mapInput" class="map-input" placeholder="输入作品名或拼音 (如: xrcm)">
                <button class="map-btn" id="mapSearchBtn">定位</button>
            </div>
        </div>

        <div class="map-layers">
            <div class="layer-btn dark active" title="深色模式" data-layer="dark">🌑</div>
            <div class="layer-btn light" title="航海家" data-layer="voyager">🗺️</div>
            <div class="layer-btn sat" title="卫星影像" data-layer="sat">🛰️</div>
        </div>

        <div class="map-close" id="mapClose">×</div>
        <div id="leaflet-map"></div>
    `;
    document.body.appendChild(wrapper);

    // 状态管理
    let mapInstance = null;
    let markersLayer = null;
    let currentLayer = null;
    let allData = [];
    let searchMode = 'img'; // 'img' or 'geo'

    // 地图源配置
    const TILE_LAYERS = {
        dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        voyager: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        sat: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    };

    const toggleMap = async (expand) => {
        if (expand) {
            wrapper.classList.add('active');
            if (!mapInstance) await createLeafletMap();
            setTimeout(() => { if(mapInstance) mapInstance.invalidateSize(); }, 550);
        } else {
            wrapper.classList.remove('active');
        }
    };

    wrapper.addEventListener('dblclick', (e) => { if (!wrapper.classList.contains('active')) toggleMap(true); });
    document.getElementById('mapClose').addEventListener('click', (e) => { e.stopPropagation(); toggleMap(false); });

    // 切换搜索模式
    wrapper.querySelectorAll('.map-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.stopPropagation();
            wrapper.querySelectorAll('.map-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            searchMode = tab.dataset.mode;
            
            const input = document.getElementById('mapInput');
            if(searchMode === 'img') {
                input.placeholder = "输入作品名或拼音 (如: xrcm)...";
                document.getElementById('mapSearchBtn').innerText = "定位作品";
            } else {
                input.placeholder = "输入真实地名 (如: Paris, Tokyo)...";
                document.getElementById('mapSearchBtn').innerText = "飞往城市";
            }
        });
    });

    // 切换图层
    wrapper.querySelectorAll('.layer-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            wrapper.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const type = btn.dataset.layer;
            if(mapInstance && TILE_LAYERS[type]) {
                if(currentLayer) mapInstance.removeLayer(currentLayer);
                currentLayer = L.tileLayer(TILE_LAYERS[type], { maxZoom: 19 }).addTo(mapInstance);
            }
        });
    });

    async function createLeafletMap() {
        try {
            await loadResource('css', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
            await loadResource('js', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');

            mapInstance = L.map('leaflet-map', { center: [20, 0], zoom: 3, zoomControl: false, attributionControl: false });
            currentLayer = L.tileLayer(TILE_LAYERS.dark, { maxZoom: 19 }).addTo(mapInstance);

            // 数据点逻辑
            const images = await getImages('all');
            const SAFE_COORDS = COORDINATES || { 'Localhost (CN)': { lat: 39.9, lng: 116.4 } };
            
            allData = images.filter(img => img.ip && SAFE_COORDS[img.ip]).map(img => {
                const coords = SAFE_COORDS[img.ip];
                return { lat: coords.lat + (Math.random()-0.5)*0.2, lng: coords.lng + (Math.random()-0.5)*0.2, ...img };
            });

            markersLayer = L.layerGroup().addTo(mapInstance);
            allData.forEach(d => {
                const icon = L.divIcon({ className: 'custom-marker', iconSize: [10, 10], iconAnchor: [5, 5] });
                const marker = L.marker([d.lat, d.lng], { icon: icon }).addTo(markersLayer);
                
                const popupHtml = `
                    <div style="text-align:center; min-width:140px;">
                        <img src="${d.src}" style="width:120px; height:70px; object-fit:cover; border-radius:4px; margin-bottom:8px; display:block; margin:0 auto 5px;">
                        <div style="font-size:13px; font-weight:bold; color:#333;">${d.title}</div>
                        <div style="font-size:11px; color:#999; margin-bottom:8px;">📍 ${d.ip}</div>
                        <button style="background:#00aeec; color:white; border:none; border-radius:4px; padding:4px 10px; cursor:pointer;" id="btn-view-${d.id}">查看详情</button>
                    </div>
                `;
                marker.bindPopup(popupHtml);
                
                marker.on('popupopen', () => {
                    mapInstance.panTo([d.lat, d.lng]); // 自动居中
                    const btn = document.getElementById(`btn-view-${d.id}`);
                    if(btn) btn.onclick = () => {
                        toggleMap(false);
                        const card = document.querySelector(`.b-card[data-id="${d.id}"]`);
                        if(card) { card.scrollIntoView({behavior: "smooth", block: "center"}); setTimeout(() => card.click(), 500); }
                        else { alert('当前列表未加载此图'); }
                    };
                });
            });

            console.log("🗺️ Tactical Map Loaded");

        } catch (e) {
            console.error("Map error", e);
            document.getElementById('leaflet-map').innerHTML = `<p style="text-align:center;margin-top:100px;color:white;">地图加载失败，请检查网络</p>`;
        }
    }

    // 🔥 统一搜索入口
    document.getElementById('mapSearchBtn').addEventListener('click', async () => {
        const val = document.getElementById('mapInput').value.trim();
        if(!val || !mapInstance) return;

        if (searchMode === 'img') {
            // --- 模式A：搜作品 ---
            const lowerVal = val.toLowerCase();
            const target = allData.find(d => d.title.toLowerCase().includes(lowerVal) || (d.py && d.py.includes(lowerVal)));
            
            if (target) {
                mapInstance.flyTo([target.lat, target.lng], 8, { duration: 1.5 });
                // 模拟点击最近的 Marker (简单实现：仅飞行，不自动开弹窗以免乱)
            } else {
                alert('未找到相关作品');
            }
        } else {
            // --- 模式B：搜真实地点 (调用 OSM Nominatim API) ---
            const btn = document.getElementById('mapSearchBtn');
            const originalText = btn.innerText;
            btn.innerText = "搜索中...";
            
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}`);
                const data = await res.json();
                
                if (data && data.length > 0) {
                    const { lat, lon, display_name } = data[0];
                    mapInstance.flyTo([lat, lon], 10, { duration: 1.5 });
                    
                    // 创建一个临时标记显示搜索结果
                    L.popup()
                        .setLatLng([lat, lon])
                        .setContent(`<div style="font-size:12px;width:150px;"><b>📍 搜索结果</b><br>${display_name}</div>`)
                        .openOn(mapInstance);
                } else {
                    alert('未找到该城市/地点');
                }
            } catch (e) {
                alert('地理搜索服务连接失败');
            } finally {
                btn.innerText = originalText;
            }
        }
    });
}

// 启动
setTimeout(initMap, 800);
