import { expect } from 'chai';
import { Modbus } from './modbus-pdu';

describe('modbus-pdu', function () {

    before(function () {

    });

    it(`should work`, function () {
        const frame = Modbus.RTU.parse(Buffer.from([
            0x1C, 0x10, 0x00, 0x64, 0x00, 0x02, 0x04, 0x03, 0xE8, 0x07, 0xD8, 0x19, 0x02
        ]));
        expect(frame).to.be.deep.eq({
            crc: 537,
            message: Buffer.from([
                0x10, 0x00, 0x64, 0x00, 0x02, 0x04, 0x03, 0xE8, 0x07, 0xD8
            ]),
            unitAddress: 28
        });
    });

});
