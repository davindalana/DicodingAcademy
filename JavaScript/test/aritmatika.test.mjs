
import { describe, it } from 'node:test';
import assert from 'assert';
import { tambah, kurang, kali, bagi } from '../artimatika.mjs';

describe('Artimatika', () => {
    it('Should return 5 when adding 2 + 3', () => {
        assert.strictEqual(tambah(2, 3), 5);
    });
    it('Should return 1 when subtracting 3 - 2', () => {
        assert.strictEqual(kurang(3, 2), 1);
    });
    it('Should return 6 when multiplying 2 * 3', () => {
        assert.strictEqual(kali(2, 3), 6);
    });
    it('Should return 1 when dividing 2 / 2', () => {
        assert.strictEqual(bagi(2, 2), 1);
    });
});