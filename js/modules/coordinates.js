// js/modules/coordinates.js
// 🌍 全球地理坐标数据库 & 智能分配系统

const COORDINATES = {
    // --- 🍓 水果美食 (Fruit) ---
    'Bangkok, Thailand': { lat: 13.7563, lng: 100.5018, type: 'fruit' },
    'Yunnan, China': { lat: 25.0453, lng: 102.7100, type: 'fruit' },
    'California, USA': { lat: 36.7783, lng: -119.4179, type: 'fruit' },
    'Hainan, China': { lat: 20.0174, lng: 110.3492, type: 'fruit' },
    'Valencia, Spain': { lat: 39.4699, lng: -0.3763, type: 'fruit' },
    'Miyazaki, Japan': { lat: 31.9077, lng: 131.4202, type: 'fruit' },
    'Chengdu, China': { lat: 30.5728, lng: 104.0668, type: 'fruit' },
    'Guangzhou, China': { lat: 23.1291, lng: 113.2644, type: 'fruit' },

    // --- 🌆 城市建筑 (City) ---
    'Hong Kong, China': { lat: 22.3193, lng: 114.1694, type: 'city' },
    'Chongqing, China': { lat: 29.5630, lng: 106.5516, type: 'city' },
    'Manhattan, USA': { lat: 40.7831, lng: -73.9712, type: 'city' },
    'Shinjuku, Japan': { lat: 35.6938, lng: 139.7034, type: 'city' },
    'Dubai, UAE': { lat: 25.2048, lng: 55.2708, type: 'city' },
    'Singapore': { lat: 1.3521, lng: 103.8198, type: 'city' },
    'Chicago, USA': { lat: 41.8781, lng: -87.6298, type: 'city' },
    'Shanghai, China': { lat: 31.2304, lng: 121.4737, type: 'city' },

    // --- 🔮 二次元 (Comic) ---
    'Akihabara, Japan': { lat: 35.6984, lng: 139.7731, type: 'comic' },
    'Tokyo, Japan': { lat: 35.6762, lng: 139.6503, type: 'comic' },
    'Osaka, Japan': { lat: 34.6937, lng: 135.5023, type: 'comic' },
    'Seoul, Korea': { lat: 37.5665, lng: 126.9780, type: 'comic' },
    'Comiket, Japan': { lat: 35.6324, lng: 139.7963, type: 'comic' },
    
    // --- 🏔️ 自然风光 (Nature) ---
    'Reykjavik, Iceland': { lat: 64.1466, lng: -21.9426, type: 'nature' },
    'Interlaken, Switzerland': { lat: 46.6863, lng: 7.8632, type: 'nature' },
    'Banff, Canada': { lat: 51.1784, lng: -115.5708, type: 'nature' },
    'Queenstown, NZ': { lat: -45.0312, lng: 168.6626, type: 'nature' },
    'Lhasa, China': { lat: 29.6525, lng: 91.1721, type: 'nature' },
    'Yellowstone, USA': { lat: 44.4280, lng: -110.5885, type: 'nature' },

    // --- 💻 科技未来 (Tech) ---
    'Silicon Valley, USA': { lat: 37.3875, lng: -122.0575, type: 'tech' },
    'Shenzhen, China': { lat: 22.5431, lng: 114.0579, type: 'tech' },
    'Hangzhou, China': { lat: 30.2741, lng: 120.1551, type: 'tech' },
    'Bangalore, India': { lat: 12.9716, lng: 77.5946, type: 'tech' },
    'Tel Aviv, Israel': { lat: 32.0853, lng: 34.7818, type: 'tech' },
    'Zhongguancun, China': { lat: 39.9832, lng: 116.3153, type: 'tech' },

    // --- 🎨 艺术创意 (Art) ---
    'Florence, Italy': { lat: 43.7696, lng: 11.2558, type: 'art' },
    'Paris, France': { lat: 48.8566, lng: 2.3522, type: 'art' },
    '798 Art Zone, China': { lat: 39.9856, lng: 116.4965, type: 'art' },
    'SoHo, NY': { lat: 40.7233, lng: -74.0030, type: 'art' },
    'Barcelona, Spain': { lat: 41.3851, lng: 2.1734, type: 'art' },
    'Vienna, Austria': { lat: 48.2082, lng: 16.3738, type: 'art' },
    'London, UK': { lat: 51.5074, lng: -0.1278, type: 'art' },
    'Berlin, Germany': { lat: 52.5200, lng: 13.4050, type: 'art' },

    // --- 🏠 默认 ---
    'Beijing, China': { lat: 39.9042, lng: 116.4074, type: 'default' },
    'Localhost (CN)': { lat: 39.9042, lng: 116.4074, type: 'default' }
};

// 工具：根据类型随机获取一个地点名称
export function getRandomCityByType(type) {
    const keys = Object.keys(COORDINATES);
    // 过滤出符合类型的城市
    let filtered = keys.filter(k => COORDINATES[k].type === type);
    // 如果该类型没有特定城市，就从所有城市里随一个
    if (filtered.length === 0) filtered = keys;
    
    return filtered[Math.floor(Math.random() * filtered.length)];
}

// 工具：根据地点名称获取坐标
export function getCoordinates(city) {
    // 如果找不到精确匹配，尝试模糊匹配或返回默认
    return COORDINATES[city] || COORDINATES['Localhost (CN)'];
}

export default COORDINATES;