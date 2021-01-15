export function uint32Buffer(input: number): Buffer {
    const buffer = Buffer.alloc(4);
    buffer.writeUInt32BE(input, 0);
    return buffer;
}
export function uint16Buffer(input: number): Buffer {
    const buffer = Buffer.alloc(2);
    buffer.writeUInt16BE(input, 0);
    return buffer;
}