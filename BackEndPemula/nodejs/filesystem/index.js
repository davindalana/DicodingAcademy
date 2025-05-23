const fs = require("fs");
const { resolve } = require('path')

const fileReadCallback = (error, data) => {
    if (error) {
        console.log('Gagal membaca berkas');
        return;
    }
    console.log(data);
};

fs.readFile(resolve(__dirname, './notes.txt'), "utf8", fileReadCallback);
// fs.readFile('./notes.txt', "utf8", fileReadCallback);