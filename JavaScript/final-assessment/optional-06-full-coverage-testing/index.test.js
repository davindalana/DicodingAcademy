import { describe, it } from 'node:test';
import assert from 'node:assert';
import sum from './index.js';

describe ('Sum', () => {
    it ('Should return 0 for a < 0 or b < 0',()=> {
        assert.strictEqual(sum(-1,2),0);
    });
    it ('Should return 0 for a < 0 or b < 0',()=> {
        assert.strictEqual(sum(1,-2),0);
    });
    it ('Should return 0 for typeof a !== number ',()=> {
        assert.strictEqual(sum("1",1),0);
    });
    it ('Should return 0 for typeof b !== number ',()=> {
        assert.strictEqual(sum(1,"1"),0);
    });
    it ('Should return 4 for sum of 3 and 1 ',()=> {
        assert.strictEqual(sum(3,1),4);
    });

});