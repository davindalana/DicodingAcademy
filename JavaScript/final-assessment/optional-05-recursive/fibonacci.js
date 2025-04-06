function fibonacci(n) {
    let urutan = [];
    for (let i = 0; i <= n; i++) {
        if (i === 0) {
            urutan.push(0);
        } else if (i === 1) {
            urutan.push(1);
        } else {
            urutan.push(urutan[i - 1] + urutan[i - 2]);
        }
    }
    return urutan;
}

// Jangan hapus kode di bawah ini!
export default fibonacci;
