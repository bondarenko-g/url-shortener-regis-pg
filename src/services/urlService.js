import { db } from '../db/postgres.js';
import { client } from '../services/redisService.js'

export function generateShortCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let shortcode = "";
    for (let i = 0; i < 6; i++){
        const randomLetter = Math.floor(Math.random() * characters.length);
        shortcode += characters[randomLetter];
    }
    return shortcode;
}

export async function createShortUrl(originalUrl) {
    const shortCode = generateShortCode();
    await db.query(`insert into urls (short_code, original_url) values ($1, $2)`, [shortCode, originalUrl]);
    const result = { originalUrl: originalUrl, shortCode: shortCode };
    return result;
}

export async function getOriginalUrl (shortCode) {
    const cachedUrl = await client.get(shortCode);
    if (cachedUrl) {
        return cachedUrl;
    }
    const result = await db.query('select original_url from urls where short_code = $1', [shortCode]);
    if (result.rows.length === 0) {
        return null;
    }
    const originalUrl = result.rows[0].original_url;
    await client.set(shortCode, originalUrl, {EX: 3600});
    return originalUrl;
}