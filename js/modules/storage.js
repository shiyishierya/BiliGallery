// js/modules/storage.js
// 必须要有这段代码，否则验证码出不来
const DB_NAME = 'Gallery_Pro_DB';
const DB_VERSION = 1;
const STORE_NAME = 'images_store';

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject('DB Error');
    });
}

export async function saveImageToDB(imgData) {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([STORE_NAME], 'readwrite');
            tx.objectStore(STORE_NAME).add(imgData);
            tx.oncomplete = () => resolve({ success: true });
            tx.onerror = () => resolve({ success: false });
        });
    } catch (e) { return { success: false }; }
}

export async function getAllImagesFromDB() {
    try {
        const db = await openDB();
        return new Promise((resolve) => {
            const tx = db.transaction([STORE_NAME], 'readonly');
            const req = tx.objectStore(STORE_NAME).getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => resolve([]);
        });
    } catch (e) { return []; }
}

export async function deleteImageFromDB(id) {
    const db = await openDB();
    return new Promise((resolve) => {
        const tx = db.transaction([STORE_NAME], 'readwrite');
        tx.objectStore(STORE_NAME).delete(id);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
    });
}

export async function updateImageInDB(data) {
    const db = await openDB();
    return new Promise((resolve) => {
        const tx = db.transaction([STORE_NAME], 'readwrite');
        tx.objectStore(STORE_NAME).put(data);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
    });
}

export async function getImageFromDB(id) {
    const db = await openDB();
    return new Promise((resolve) => {
        const tx = db.transaction([STORE_NAME], 'readonly');
        const req = tx.objectStore(STORE_NAME).get(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
    });
}