import { bufferToAsciiString, bufferToHexString, typedArrayToBuffer } from '@iotize/common/byte-converter';
import { sleep } from '@iotize/common/utility';
import { timeStamp } from 'console';
import { Observable, Subject } from 'rxjs';
import * as SerialPort from 'serialport';

import { debug } from '../debug';

const TAG = 'SerialController';

class RollingBuffer {

    private writePosition = 0;
    private readPosition = 0;

    static alloc(length: number){
        return new RollingBuffer(Buffer.alloc(length));
    }

    constructor(private buffer: Buffer){

    }

    get available(){
        return this.writePosition - this.readPosition;
    }

    add(buffer: Buffer){
        for (var i = 0; i < buffer.length; i++){
            this.buffer[(this.writePosition++ % this.buffer.length)] = buffer[i];
        }
    }

    read(length: number = this.available){
        if (length > this.available){
            throw new Error(`Cannot read more than ${this.available} byte(s)`);
        }
        var output = Buffer.alloc(length);
        for (let i=0; i < length; i++){
            output[i] = this.buffer[ this.readPosition++ %this.buffer.length];
        }
        return output;
    }
}

export class SerialController {

    private _errorQueue: Subject<Error>;
    public readonly input = RollingBuffer.alloc(10 * 1024);

    get errors(): Observable<Error> {
        return this._errorQueue.asObservable();
    }

    static async listSerialPort(): Promise<SerialPort.PortInfo[]> {
        return SerialPort.list();
    }

    private static _createSerialPort(port: string, options: SerialPort.OpenOptions) {
        return new SerialPort(port, options);
    }

    public static create(port: string, options: SerialPort.OpenOptions) {
        debug(TAG, `Creating setting for port ${port} with options`, options);
        const serialPort = SerialController._createSerialPort(port, options);
        return new SerialController(serialPort, port);
    }

    private constructor(public serialport: SerialPort, public port: string) {
        this._errorQueue = new Subject();
        this.serialport.on('close', () => {
            debug(TAG, this.port, 'closed event');
        });
        this.serialport.on('open', () => {
            debug(TAG, this.port, 'open event');
        });
        this.serialport.on('error', (err: Error) => {
            debug(TAG, this.port, 'err event', err);
            this._errorQueue.next(err);
        });
        this.reset();
    }

    close(): Promise<void> {
        debug(TAG, this.port, 'closing serial port...');
        return new Promise<void>((resolve, reject) => {
            if (!this.serialport.isOpen) {
                debug(TAG, this.port, `serial port is already closed`);
                this.destroy();
                resolve();
                return;
            }
            this.serialport.close(err => {
                if (err) {
                    reject(err);
                    return;
                }
                debug(TAG, this.port, `serial port is now closed!`);
                this.destroy();
                resolve();
            });
        });
    }

    destroy() {
        this.serialport.destroy();
        debug(TAG, this.port, 'serial port is now destroyed!');
    }

    open(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            if (this.serialport.isOpen) {
                debug(TAG, this.port, `Port is already open...`);
                resolve();
                return;
            }
            if ((this.serialport as any).opening) {
                debug(TAG, this.port, `Port is already opening... please wait`);
                do {
                    await sleep(100);
                } while (!this.serialport.open);
                debug(TAG, this.port, 'PORT IS NOW OPEN');
                resolve();
                return;
            }
            debug(TAG, this.port, `Opening port... please wait`);
            this.serialport.open(err => {
                if (err) {
                    reject(err);
                    return;
                }
                debug(TAG, this.port, 'PORT IS NOW OPEN');
                resolve();
            });
        });
    }

    async reOpen(): Promise<void> {
        await this.close();
        await this.open();
    }

    async reset(): Promise<void> {
        debug(TAG, this.port, `reset()`);
        this.serialport.on('data', (data: Buffer) => {
            debug(TAG,
                `Append data: 0x${bufferToHexString(
                    data
                )} |  ASCII=${bufferToAsciiString(data)}`
            );

            this.input.add(data);
        });

    }

    read(length: number): Buffer {
        return this.input.read(length);
    }

    write(data: string | number[] | Buffer | Uint8Array): Promise<number> {
        if (!data) {
            throw new Error(`Invalid argument. Data must not be null`);
        }
        if (data instanceof Uint8Array) {
            data = Buffer.from(typedArrayToBuffer(data));
        }
        return new Promise<number>((resolve, reject) => {
            if (!this.serialport.isOpen) {
                reject(
                    new Error(
                        `Trying to write data on serial port but it's closed`
                    )
                );
            }
            if (this.serialport.isPaused()) {
                reject(
                    new Error(
                        `Trying to write data on serial port but it's paused`
                    )
                );
            }
            debug(TAG,
                `Start writing data "${data}"`// (0x${toHexString(data)})`
            );
            this.serialport.write(
                data as any,
                (err, bytesWritten) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    debug(TAG, this.port, 'Done writing bytes ', data.length);
                    resolve(bytesWritten);
                }
            );
        });
    }
}
