import { expect } from 'chai';
import {add} from "../src/index.js"
describe('add function', () => {
    it('should return 5 when adding 2 and 3', () => {
        const result = add(2, 3);
        expect(result).to.equal(5);
    });

    it('should return -1 when adding -1 and 0', () => {
        const result = add(-1, 0);
        expect(result).to.equal(-1);
    });
});