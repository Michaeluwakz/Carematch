import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const html = fs.readFileSync(path.resolve(__dirname, '../specialty_raw.html'), 'utf-8');

const dom = new JSDOM(html);
const document = dom.window.document;

const hospitals = [];
const hospitalItems = document.querySelectorAll('.hospital-item');

hospitalItems.forEach(item => {
    const name = item.querySelector('.hospital-name')?.textContent?.trim() || null;
    const ceoContent = item.querySelector('.hospital-ceo')?.textContent?.trim() || null;
    const contactContent = item.querySelector('.hospital-contact')?.textContent?.trim() || null;

    let ceo = null;
    if (ceoContent) {
        ceo = ceoContent.replace('CEO:', '').trim();
    }

    let phone = null;
    let email = null;
    if (contactContent) {
        const parts = contactContent.split('|');
        if (parts[0]) {
            phone = parts[0].replace('Phone:', '').trim();
        }
        if (parts[1]) {
            email = parts[1].replace('Email:', '').trim();
        }
    }

    hospitals.push({
        name,
        ceo,
        phone,
        email,
    });
});

fs.writeFileSync(path.resolve(__dirname, '../specialty_hospitals.json'), JSON.stringify(hospitals, null, 2));

console.log('Successfully extracted specialty hospitals data.'); 