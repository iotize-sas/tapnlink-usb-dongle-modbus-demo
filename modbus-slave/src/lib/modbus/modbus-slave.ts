import { sleep } from '@iotize/common/utility';
import { uint16Buffer } from '../data-converter';
import { debug } from '../debug';
import { SerialController } from '../serial/serial-controller';
import { Modbus } from './modbus-pdu';

export interface ModbusSlaveRegister {
    coils?: Register<number>;
    discretInput?: Register<number>; // status input
    holdingRegisters: Register<number>;
    inputRegisters?: Register<number>;

    onWriteRegister(message: Modbus.Message.WriteSingleRegister): Promise<void>;
}

export type Register<T = number> = Record<number, T | Uint8Array | Buffer | (() => Uint8Array)>;

export function readMultitpleAddress(register: Register, functionCode: number, startAddress: number, registerCount: number = 1): Buffer {
    if (registerCount > 122) {
        throw new Error(`Read register count must be <= 122. Given ${registerCount}`);
    }
    const result = Buffer.alloc(1 + 1 + registerCount * 2);
    let offset = 0;
    result.writeUInt8(functionCode, offset++);
    result.writeUInt8(registerCount * 2, offset++);

    for (let address = startAddress; address < startAddress + registerCount;) {
        const addressContent = readAddress(register, address);
        const targetIndex = offset + ((address - startAddress) * 2);
        // console.log('Copy ', addressContent, 'to index', targetIndex);
        addressContent.copy(result, targetIndex);
        address += (addressContent.length) / 2;
    }

    return result;
}

export function readAddress(register: Register, startAddress: number): Buffer {
    let value = register[startAddress];
    if (value === undefined) {
        console.log('Register', register);
        // throw new Error(`Modbus exception address 0x${startAddress.toString(16).padStart(2, '0')} not found in register`);
        console.warn(`Trying to read a register that was not defined at address: 0x${startAddress.toString(16).padEnd(2, '0')}`);
        return uint16Buffer(0);
    }
    if (typeof value === 'function') {
        value = value();
        return Buffer.from(value);
    }
    else if (typeof value == 'number') {
        const buffer = uint16Buffer(value);
        debug('converter value at address 0x', startAddress.toString(16), ' => ', value, 'to buffer', buffer, register);
        return buffer;
    }
    else {
        return Buffer.from(value);
    }
}

export class ModbusSlave {

    private _isStarted = false;

    constructor(
        private serialController: SerialController,
        public registers: ModbusSlaveRegister) {

    }

    listen() {
        this._isStarted = true;
        return this._listen();
    }

    stop() {
        this._isStarted = false;
    }

    private async _listen() {
        let waitingDisplayed = false;
        while (this._isStarted) {
            while (this.readInput()) {
                waitingDisplayed = false;
            }
            if (!waitingDisplayed) {
                console.info('Waiting for request...');
                waitingDisplayed = true;
            }
            await sleep(1);
        }
    }

    private readInput() {
        if (this.serialController.input.available < 8) {
            return false;
        }
        const received = this.serialController.read(8);
        debug('----------- NEW INPUT ------------- ');
        debug('Modbus input: ', Buffer.from(received));
        try {
            this.handleModbusRequest(Buffer.from(received));
        }
        catch (err) {
            console.warn('Handle modbus request failed: ', err);
        }
        return true;
    }

    private async serialPortWrite(buffer: Buffer) {
        debug(`Modbus response: `, buffer);
        await this.serialController.write(buffer);
    }

    private async sendModbusResponse(response: Modbus.ResponseException, context: {
        request: Modbus.RTU.Request
    }) {
        const pdu = response.encode();
        const encodedRTU = Modbus.RTU.encode({
            message: pdu,
            unitAddress: context.request.unitAddress
        });
        // console.log('Modbus response', encodedRTU);
        await this.serialPortWrite(encodedRTU);
    }

    private sendModbusError(err: Error, request: Modbus.RTU.Request, pdu: Modbus.Message) {
        this.sendModbusResponse(
            new Modbus.ResponseException(
                pdu.functionCode,
                Modbus.ExceptionCode.IllegalFunction
            ),
            {
                request
            }
        );
    }

    private handleModbusRequest(buffer: Buffer) {
        const request = Modbus.RTU.parse(buffer);
        const pdu = Modbus.PDU.parse(request.message);
        const functionCode = pdu.functionCode;

        console.log(`\t- Input request with function code ${Modbus.FunctionCode[functionCode]} (code 0x${functionCode.toString(16).padStart(2, '0')}, address: ${pdu.address}).`);

        switch (functionCode) {
            case Modbus.FunctionCode.WriteSingleRegister:
                const writeSingleRegisterMessage = pdu as Modbus.Message.WriteSingleRegister;
                this.registers
                    .onWriteRegister(writeSingleRegisterMessage)
                    .then(() => {
                        this.registers.holdingRegisters[writeSingleRegisterMessage.address] = writeSingleRegisterMessage.value;
                        this.serialPortWrite(
                            Modbus.RTU.encode({
                                message: request.message,
                                unitAddress: request.unitAddress
                            })
                        );
                    })
                    .catch(err => {
                        this.sendModbusError(err, request, pdu);
                    });
                break;
            case Modbus.FunctionCode.ReadHoldingRegisters:
                const readHoldingRegistersMessage = pdu as Modbus.Message.ReadAddress;
                this.serialPortWrite(
                    Modbus.RTU.encode({
                        unitAddress: request.unitAddress,
                        message: readMultitpleAddress(this.registers.holdingRegisters,
                            functionCode,
                            readHoldingRegistersMessage.address,
                            readHoldingRegistersMessage.quantity)
                    })
                );
                break;
            default:
                return this.sendModbusError(new Error(`Unhandled function code: ${functionCode}`), request, pdu);
            // console.warn(`Unhandled function code: ${functionCode}`);
            // return this.sendModbusResponse(
            //     new Modbus.ResponseException(
            //         functionCode,
            //         Modbus.ExceptionCode.IllegalFunction
            //     ),
            //     {
            //         request
            //     }
            // );
        }
    }

}
