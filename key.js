import bs58 from 'bs58';
import fs from 'fs';
const b = bs58.decode('private key');
const j = new Uint8Array(b.buffer, b.byteOffset, b.byteLength / Uint8Array.BYTES_PER_ELEMENT);
fs.writeFileSync('key.json', `[${j}]`);
