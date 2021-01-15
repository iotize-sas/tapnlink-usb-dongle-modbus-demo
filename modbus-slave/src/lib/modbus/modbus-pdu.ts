export namespace Modbus {

    export enum FunctionCode {
        ReadCoils = 0x1, // (address, quantity)
        ReadDiscreteInputs = 0x2,
        ReadHoldingRegisters = 0x3,
        ReadInputRegisters = 0x4,
        WriteSingleCoil = 0x5, // (address, value)
        WriteSingleRegister = 0x6, // ()
        ReadExceptionStatus = 0x7,
        GetCommEventCounter = 0xB,
        GetCommEventLog = 0xC,
        WriteMultipleCoils = 0xF, //(address, values)  values should be Array of 1/0,
        WriteMultipleRegisters = 0x10, //(address, values) // values should be Array of 2-size Buffers,
        ReadFileRecord = 0x14, // (requests) // requests should be Array of objects with keys file, address and length,
        WriteFileRecord = 0x15, // (requests) // requests should be Array of objects with keys file, address and values (Array of 2-size Buffers),
        MaskWriteRegister = 0x16, //(address, andmask, ormask)
        ReadWriteMultipleRegisters = 0x17, // (read_address, read_quantity, write_address, values) // values should be Array of 2-size Buffers 
        ReadFIFOQueue = 0x18, // (address)
        ReadDeviceIdentification = 0x2B, // 0E  // (code, id)

    }

    export enum ExceptionCode {
        IllegalFunction = 0x1,
        IllegalDataAddress = 0x2,
        IllegalDataValue = 0x3,
        ServerDeviceFailure = 0x4,
        Aknowledge = 0x5,
        ServerDeviceBusy = 0x6,
        MemoryParityError = 0x8,
        GatewayPathUnavailable = 0xA,
        GatewayTargetDeviceFailedToRespond = 0xB,
    }

    export type Message = Message.ReadAddress | Message.WriteSingleRegister;

    export namespace Message {
        export interface ReadAddress {
            functionCode: number;
            address: number;
            quantity: number;
        }

        export interface WriteSingleRegister {
            functionCode: number;
            address: number;
            value: Uint8Array;
        }
    }

    export namespace RTU {

        export interface Request {
            unitAddress: number;
            message: Buffer;
            crc: number;
        }

        export function encode(input: Pick<Request, 'message' | 'unitAddress'>): Buffer {
            const totalSize = 1 + input.message.length + 2;
            const buffer = Buffer.alloc(totalSize);
            buffer.writeUInt8(input.unitAddress, 0);
            for (let i = 0; i < input.message.length; i++) {
                buffer.writeUInt8(input.message.readUInt8(i), i + 1);
            }
            const crc = checksum(buffer.subarray(0, buffer.length - 2));
            buffer.writeUInt16LE(crc, buffer.length - 2);
            return buffer;
        }

        export function parse(input: Buffer): Request {
            if (input.length < 3) {
                console.warn('Received invalid frame', input);
                throw new Error(`Invalid modbus request. Frame size is too small`);
            }
            const message = input.subarray(1, input.length - 2);
            // console.log('Modbus pdu: ', message);
            const crc = input.readUInt16LE(input.length - 2);
            const subArrayFrame = input.subarray(0, input.length - 2);
            // console.log('LENGTH', subArrayFrame, subArrayFrame.length, subArrayFrame.byteLength, subArrayFrame.byteOffset, subArrayFrame.buffer.byteLength);
            const expectedCrc = checksum(subArrayFrame);
            if (expectedCrc !== crc) {
                console.warn('Received invalid frame', input);
                throw new Error(`Invalid modbus request. Invalid CRC (found ${crc} but expecting ${expectedCrc})`);
            }
            // TODO check CRC
            return {
                unitAddress: input.readUInt8(0),
                message: Buffer.from(message),
                crc
            }
        }

        export function checksum(buffer: Buffer) {
            let crc = 0xFFFF;
            let odd: number;
            for (let i = 0; i < buffer.byteLength; i++) {
                crc = crc ^ buffer.readUInt8(i);

                for (var j = 0; j < 8; j++) {
                    odd = crc & 0x0001;
                    crc = crc >> 1;
                    if (odd) {
                        crc = crc ^ 0xA001;
                    }
                }
            }
            return crc;
        }
    }

    export namespace PDU {

        export function parse(input: Buffer): Message {
            const functionCode = input.readUInt8(0);

            switch (functionCode) {
                case FunctionCode.ReadHoldingRegisters:
                case FunctionCode.ReadInputRegisters:
                    return parseAddressQuantity(functionCode, input.subarray(1));
                case FunctionCode.WriteSingleRegister:
                    return parseAddressValue(functionCode, input.subarray(1));
                default:
                    throw new Error(`Unsupported function code: ${functionCode}`);
            }
        }

    }

    export namespace Function {

        export namespace WriteSingleRegister {

        }
    }

    export class ResponseException {

        constructor(public functionCode: FunctionCode, public exceptionCode: ExceptionCode) {

        }

        encode() {
            return Buffer.from([
                0x80 + this.functionCode,
                this.exceptionCode
            ]);
        }
    }

}

function parseAddressQuantity(functionCode: number, buffer: Buffer): Modbus.Message.ReadAddress {
    if (buffer.length < 4) {
        throw new Error(`Invalid buffer`);
    }
    return {
        functionCode,
        address: buffer.readUInt16BE(0),
        quantity: buffer.readUInt16BE(2),
    };
}

function parseAddressValue(functionCode: number, buffer: Buffer): Modbus.Message.WriteSingleRegister {
    if (buffer.length < 4) {
        throw new Error(`Invalid buffer`);
    }
    return {
        functionCode,
        address: buffer.readUInt16BE(0),
        value: buffer.subarray(2) // readUInt16BE(2)
    };
}