const fs = require('fs');
const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==', 'base64');
fs.writeFileSync('assets/iconos/empty.png', buffer);
console.log('empty.png created');
