import { describe, it } from 'node:test';
import assert from 'node:assert';
import { sum } from './index.js';

describe('Sum', () => {
    it('should return 4 for sum of 2 and 2', () => {
        assert.strictEqual(sum(2, 2), 4);
    });
});