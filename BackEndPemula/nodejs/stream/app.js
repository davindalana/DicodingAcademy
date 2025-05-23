const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'input.txt');
const outputPath = path.join(__dirname, 'output.txt');

// Buat stream baca dengan ukuran chunk 12 karakter (byte)
const readableStream = fs.createReadStream(inputPath, {
    highWaterMark: 15,
    encoding: 'utf-8'
});

const writableStream = fs.createWriteStream(outputPath);

readableStream.on('readable', () => {
    let chunk;
    while ((chunk = readableStream.read()) !== null) {
        process.stdout.write(`${chunk}\n`);  // Menampilkan ke console
        writableStream.write(chunk + '\n');    // Tulis ke file
    }
});

readableStream.on('end', () => {
    writableStream.end('null');
    console.log('Done');
});
