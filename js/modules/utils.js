// js/modules/utils.js

import { saveImageToDB, getAllImagesFromDB, deleteImageFromDB, updateImageInDB, getImageFromDB } from './storage.js';

const KEYS = { 
    USERS: 'gallery_users', 
    CURRENT: 'gallery_current_user',
    COMMENTS: 'gallery_comments_v2' 
};

// ==========================================
// 0. 坐标库
// ==========================================
export const COORDINATES = {
    'Beijing, China': { lat: 39.9042, lng: 116.4074 },
    'Shanghai, China': { lat: 31.2304, lng: 121.4737 },
    'Guangzhou, China': { lat: 23.1291, lng: 113.2644 },
    'Chengdu, China': { lat: 30.5728, lng: 104.0668 },
    'Hong Kong, China': { lat: 22.3193, lng: 114.1694 },
    'Tokyo, Japan': { lat: 35.6762, lng: 139.6503 },
    'Osaka, Japan': { lat: 34.6937, lng: 135.5023 },
    'Seoul, Korea': { lat: 37.5665, lng: 126.9780 },
    'Bangkok, Thailand': { lat: 13.7563, lng: 100.5018 },
    'New York, USA': { lat: 40.7128, lng: -74.0060 },
    'San Francisco, USA': { lat: 37.7749, lng: -122.4194 },
    'London, UK': { lat: 51.5074, lng: -0.1278 },
    'Paris, France': { lat: 48.8566, lng: 2.3522 },
    'Berlin, Germany': { lat: 52.5200, lng: 13.4050 },
    'Reykjavik, Iceland': { lat: 64.1466, lng: -21.9426 },
    'Interlaken, Switzerland': { lat: 46.6863, lng: 7.8632 },
    'Banff, Canada': { lat: 51.1784, lng: -115.5708 },
    'Sydney, Australia': { lat: -33.8688, lng: 151.2093 },
    'Localhost (CN)': { lat: 39.9042, lng: 116.4074 }
};

function getRandomLocation() {
    const keys = Object.keys(COORDINATES);
    return keys[Math.floor(Math.random() * keys.length)];
}

// ==========================================
// 1. 基础工具
// ==========================================
export function createCode(length = 4) {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    let code = "";
    for (let i = 0; i < length; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
}
export function drawCaptcha(canvasId, code) {
    const canvas = document.getElementById(canvasId);
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f6f7f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#00aeec';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(code, canvas.width/2, canvas.height/2);
}
export function validatePhone(phone) { return /^1[3-9]\d{9}$/.test(phone); }
export function validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

// ==========================================
// 2. 用户系统
// ==========================================
export function findUser(account) {
    let users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    return users.find(u => u.phone === account || u.email === account);
}

// 🔥 核心修复：更新头像源为 v9.x (adventurer 风格)
export function findUserByNickname(nickname) {
    let users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    const realUser = users.find(u => u.nickname === nickname);
    if (realUser) return realUser;
    
    // 大V账号
    if (nickname === 'CosmicExplorer') {
        return {
            nickname: 'CosmicExplorer',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
            joinDate: '2023/05/20',
            isFake: true,
            bio: '🌌 探索未知的边界，记录光影的瞬间。'
        };
    }

    return {
        nickname: nickname,
        // 🔥 这里的 URL 更新了
        avatar: `https://api.dicebear.com/9.x/adventurer/svg?seed=${nickname}`,
        joinDate: '神秘时间',
        isFake: true
    };
}

export function resetPassword(account, newPass) {
    let users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    const index = users.findIndex(u => u.phone === account || u.email === account);
    if (index !== -1) { users[index].password = newPass; localStorage.setItem(KEYS.USERS, JSON.stringify(users)); return { success: true, msg: '重置成功' }; }
    return { success: false, msg: '用户不存在' };
}
export function registerUser(account, password, type = 'phone') {
    let users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    if (users.find(u => u.phone === account || u.email === account)) return { success: false, msg: '账号已存在' };
    // 🔥 注册用户的默认头像也更新
    const newUser = { password, nickname: `用户${Math.floor(Math.random()*10000)}`, avatar: `https://api.dicebear.com/9.x/adventurer/svg?seed=${account}`, joinDate: new Date().toLocaleDateString(), favorites: [], history: [] };
    if (type === 'email') newUser.email = account; else newUser.phone = account;
    users.push(newUser); localStorage.setItem(KEYS.USERS, JSON.stringify(users)); return { success: true, msg: '注册成功' };
}
export function loginUser(account, password) {
    let users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    const user = users.find(u => (u.phone === account || u.email === account) && (password === null || u.password === password));
    if (user) { if(!user.favorites) user.favorites=[]; if(!user.history) user.history=[]; localStorage.setItem(KEYS.CURRENT, JSON.stringify(user)); return true; }
    return false;
}
export function getCurrentUser() { return JSON.parse(localStorage.getItem(KEYS.CURRENT)); }
export function updateCurrentUser(data) { localStorage.setItem(KEYS.CURRENT, JSON.stringify(data)); } 
export function changePassword(oldP, newP) {
    let u = getCurrentUser(); if(!u) return {success:false, msg:'未登录'};
    if(u.password!==oldP) return {success:false, msg:'旧密码错误'};
    u.password=newP; updateCurrentUser(u); return {success:true, msg:'修改成功'};
}

// ==========================================
// 3. 图片数据
// ==========================================
export async function getImagesByUploader(uploaderName) {
    let list = await getAllImagesFromDB();
    return list.filter(img => img.uploader === uploaderName).reverse();
}

function generateMockComments(imgId) {
    const commentsPool = [
        "拍得真好！很有感觉。", "太强了大佬，求壁纸原图。", 
        "Amazing shot! Love the colors.", "So beautiful!", "Great composition.",
        "写真がとても綺麗ですね。", "すごい！", "构图满分。", "Where is this?", 
        "一眼心动。", "Cyberpunk vibes!", "这光影绝了。"
    ];
    const count = Math.floor(Math.random() * 4) + 2; 
    for(let i=0; i<count; i++) {
        const text = commentsPool[Math.floor(Math.random() * commentsPool.length)];
        const randomUser = `User${Math.floor(Math.random()*9000)+1000}`;
        addComment(imgId, text, { nickname: randomUser, ip: getRandomLocation() });
    }
}

async function initGalleryData() {
    const existing = await getAllImagesFromDB();
    if (existing.length > 5) return; 
    console.log("🔥 正在写入 60 张精选数据 (修复版)...");
    localStorage.removeItem(KEYS.COMMENTS); 

    const REAL_DATA = [
        { title: "夏日草莓盛宴", py: "xrcm", type: "fruit", src: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80", tone: "colorful", desc: "清晨采摘的红颜草莓。", uploader: "FoodieJane" },
        { title: "清新牛油果", py: "qxnyg", type: "fruit", src: "https://images.unsplash.com/photo-1519996543731-80c9fa886c71?w=800&q=80", tone: "cool", desc: "极简主义早餐。", uploader: "FoodieJane" },
        { title: "二次元少女", py: "ecy", type: "comic", src: "https://image.pollinations.ai/prompt/anime%20girl%20blue%20hair%20vivid%20colors?width=800&height=600&seed=101&noshare", tone: "colorful", desc: "AI生成的赛博少女。", uploader: "OtakuKing" },
        { title: "赛博机甲", py: "sbjj", type: "comic", src: "https://image.pollinations.ai/prompt/anime%20boy%20cyborg%20neon%20lights?width=800&height=600&seed=102&noshare", tone: "cool", desc: "机械飞升。", uploader: "OtakuKing" },
        { title: "东京霓虹夜", py: "djnh", type: "city", src: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80", tone: "colorful", desc: "涩谷街头的雨夜。", uploader: "CityHunter" },
        { title: "雪山之巅", py: "xszd", type: "nature", src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80", tone: "cool", uploader: "CosmicExplorer", desc: "阿尔卑斯山脉的日出。" },
        { title: "极客桌面", py: "jkzm", type: "tech", src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80", tone: "cool", uploader: "CosmicExplorer", desc: "生产力工具的究极形态。" },
        { title: "抽象光影", py: "cxgy", type: "art", src: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80", tone: "colorful", uploader: "CosmicExplorer", desc: "光与影的交织。" },
        { title: "无人机视角", py: "wrj", type: "tech", src: "https://images.unsplash.com/photo-1506947411487-a56738267384?w=800&q=80", tone: "cool", uploader: "CosmicExplorer", desc: "上帝视角俯瞰大地。" },
        { title: "多汁甜橙", py: "dztc", type: "fruit", src: "https://images.unsplash.com/photo-1557800636-894a64c1696f?w=800&q=80", tone: "warm" }
    ];

    const mockData = [];
    for(let i=0; i<60; i++) {
        const tpl = REAL_DATA[i % REAL_DATA.length];
        mockData.push({
            id: 1000 + i,
            title: tpl.title + " " + (Math.floor(i/REAL_DATA.length)+1),
            type: tpl.type,
            py: tpl.py || '',
            images: [tpl.src, tpl.src, tpl.src], 
            src: tpl.src,
            views: Math.floor(Math.random() * 50000) + 2000,
            quality: Math.random()>0.5 ? '4k' : '1080p', 
            tone: tpl.tone,
            uploader: tpl.uploader || 'System_Bot',
            desc: tpl.desc || '暂无介绍',
            date: new Date().toLocaleDateString(),
            ip: getRandomLocation() 
        });
    }

    await Promise.all(mockData.map(async (img) => {
        await saveImageToDB(img);
        generateMockComments(img.id);
    }));
}

export async function generateMoreImages(count) {
    const all = await getAllImagesFromDB();
    const maxId = all.length > 0 ? Math.max(...all.map(i=>i.id)) : 1000;
    const newItems = [];
    const TEMPLATES = [
        { t: "随机风景", c: "nature", s: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80" },
        { t: "未来科技", c: "tech", s: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80" },
        { t: "城市夜景", c: "city", s: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80" }
    ];
    for(let i=0; i<count; i++) {
        const tpl = TEMPLATES[Math.floor(Math.random()*TEMPLATES.length)];
        newItems.push({
            id: maxId + 1 + i, title: `${tpl.t} #${Math.floor(Math.random()*999)}`,
            type: tpl.c, py: '', images: [tpl.s], src: tpl.s,
            views: Math.floor(Math.random() * 20000), quality: '1080p', tone: 'cool',
            uploader: 'System_Bot', desc: '随机生成的灵感图片。', 
            date: new Date().toLocaleDateString(), ip: getRandomLocation()
        });
    }
    await Promise.all(newItems.map(img => saveImageToDB(img)));
    return newItems;
}

export async function getImages(type='all', search='', quality='all', tone='all') {
    let list = await getAllImagesFromDB();
    if(list.length===0) { await initGalleryData(); list = await getAllImagesFromDB(); }
    return list.filter(img => {
        if(type!=='all' && img.type!==type) return false;
        if(quality!=='all' && img.quality!==quality) return false;
        if(tone!=='all' && img.tone!==tone) return false;
        if(search) {
            const s = search.toLowerCase();
            return img.title.toLowerCase().includes(s) || (img.py && img.py.includes(s));
        }
        return true;
    }).reverse();
}

export async function getImageById(id) { return await getImageFromDB(id); }
export async function uploadNewImage(imgData) {
    const imagesArray = Array.isArray(imgData.images) ? imgData.images : [imgData.src];
    let user = getCurrentUser();
    let uploaderName = user ? (user.nickname || user.phone) : 'Anonymous';
    const newImage = {
        id: Date.now(), title: imgData.title, type: imgData.type, 
        images: imagesArray, src: imagesArray[0], views: 0, 
        uploader: uploaderName, desc: imgData.desc || '', 
        date: new Date().toLocaleDateString(), quality: '1080p', tone: 'warm', ip: 'Localhost (CN)', py: ''
    };
    return await saveImageToDB(newImage);
}
export async function deleteImage(id) { await deleteImageFromDB(id); }
export async function updateImage(id, t, ty) { const i=await getImageFromDB(id); if(i){i.title=t;i.type=ty;await updateImageInDB(i);return true;}return false;}
export function toggleFavorite(id){let u=getCurrentUser();if(!u)return false;const i=u.favorites.indexOf(id);if(i===-1)u.favorites.push(id);else u.favorites.splice(i,1);updateCurrentUser(u);return i===-1;}
export function addHistory(id){let u=getCurrentUser();if(!u)return;u.history=u.history.filter(x=>x!==id);u.history.unshift(id);updateCurrentUser(u);}

// 🔥 修复核心：评论生成
export function addComment(id, text, customProfile = null) {
    const user = getCurrentUser(); if(!user && !customProfile) return; 
    const commentsMap = JSON.parse(localStorage.getItem(KEYS.COMMENTS) || '{}');
    if(!commentsMap[id]) commentsMap[id] = []; 
    
    let nickname, avatar, userIp;
    if (customProfile) { 
        nickname = customProfile.nickname; 
        // 🔥 这里改成了 v9 的 URL
        avatar = `https://api.dicebear.com/9.x/adventurer/svg?seed=${nickname}`; 
        userIp = customProfile.ip || getRandomLocation(); 
    } else { 
        nickname = user.nickname || user.phone; 
        avatar = user.avatar; 
        userIp = 'Localhost (CN)'; 
    }
    commentsMap[id].push({ nickname, avatar, text, date: new Date().toLocaleString(), ip: userIp });
    localStorage.setItem(KEYS.COMMENTS, JSON.stringify(commentsMap));
}

export function getComments(id){return JSON.parse(localStorage.getItem(KEYS.COMMENTS)||'{}')[id]||[];}
export function deleteComment(id,ix){const c=JSON.parse(localStorage.getItem(KEYS.COMMENTS)||'{}');if(c[id]){c[id].splice(ix,1);localStorage.setItem(KEYS.COMMENTS,JSON.stringify(c));return true;}return false;}