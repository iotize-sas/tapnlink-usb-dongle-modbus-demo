import { expect } from 'chai';
import { readMultitpleAddress } from './modbus-slave';
	
describe('modbus-slave', function() {

	before(function() {

    });
    
    describe('readMultitpleAddress()', function(){

        const register = {
            0x02: 1,
            0x03: 2
        }

        it(`reading a single address should work`, function() {
            expect(readMultitpleAddress(register, 0x02, 1)).to.be.deep.eq(
                Buffer.from([0, 1])
            );
            expect(true).to.be.true;
        });

        it(`reading multiple addresss should work`, function() {
            expect(readMultitpleAddress(register, 0x02, 2)).to.be.deep.eq(
                Buffer.from([0, 1, 0, 2])
            );
        });

        it(`reading an address that do not exist should throw`, function() {
            expect(() => readMultitpleAddress(register, 0x87229, 1)).to.throw('Modbus exception address');
        });
    
    });
});
	