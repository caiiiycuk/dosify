interface IMemRange {
    // [left, right)
    // [0, 1) -> 0
    left: number;
    right: number;
}

function takeMemRanges(mem: Uint8Array, minRangeInterval: number = 8): IMemRange[] {
    const ranges: IMemRange[] = [];
    function pushRange(newRange: IMemRange) {
        if (ranges.length === 0) {
            ranges.push(newRange);
        } else {
            const prevRange = ranges[ranges.length - 1];
            if (newRange.left - prevRange.right > minRangeInterval)  {
                ranges.push(newRange);
            } else {
                prevRange.right = newRange.right;
            }
        }
    }

    const curRange: IMemRange = { left: -1, right: -1 };
    for (let i = 0; i < mem.length; ++i) {
        const value = mem[i];
        if (value === 0) {
            if (curRange.left !== -1) {
                const newRange = {...curRange};
                curRange.left = -1;
                curRange.right = -1;
                pushRange(newRange);
            }
            continue;
        }

        if (curRange.left === -1) {
            curRange.left = i;
        }

        curRange.right = (i + 1);
    }

    if (curRange.left !== -1) {
        pushRange(curRange);
    }

    return ranges;
}

export function heapsnapshot(module: any, callback: (snapshot: ArrayBuffer) => void) {
    module.onglobals = (...globals: any[]) => {
        const time = Date.now();
        globals.push(time);

        const globalsCopy = new TextEncoder().encode(JSON.stringify(globals));

        const mem = module.HEAPU8;
        const memRanges = takeMemRanges(mem);
        const memRangesSize = 4 + memRanges.length * 2 * 4;

        let memSize = 0;
        memRanges.forEach((v) => memSize += v.right - v.left);
        memSize = Math.ceil(memSize / 4) * 4;

        const globalsSize = 4 + Math.ceil(globalsCopy.byteLength / 4) * 4;

        const totalSize = globalsSize + memRangesSize + memSize;
        const snapshot = new Uint8Array(totalSize);
        const i32View = new Uint32Array(snapshot.buffer);

        i32View[0] = globalsCopy.byteLength;
        snapshot.set(globalsCopy, 4);

        const memRangesOffest = globalsSize / 4;
        let payloadOffset = memRangesOffest * 4 + memRangesSize;
        i32View[memRangesOffest] = memRanges.length;

        memRanges.forEach((r, i) => {
            i32View[memRangesOffest + i * 2 + 1] = r.left;
            i32View[memRangesOffest + i * 2 + 2] = r.right;
            snapshot.set(mem.subarray(r.left, r.right), payloadOffset);
            payloadOffset += r.right - r.left;
        });

        callback(snapshot.buffer);
    };

    module.asm.globalsread();
}

export function heaprestore(module: any, buffer: ArrayBuffer): number {
    const snapshot = new Uint8Array(buffer);
    const i32View = new Uint32Array(buffer);

    const globalsArray = snapshot.subarray(4, 4 + i32View[0]);
    const globals: any[] = JSON.parse(new TextDecoder("utf-8").decode(globalsArray));
    const globalsSize = 4 + Math.ceil(i32View[0] / 4) * 4;

    const time: number = globals.pop();

    const memRangesOffest = globalsSize / 4;
    const memRangesLength = i32View[memRangesOffest];
    const memRangesSize = 4 + memRangesLength * 2 * 4;
    let payloadOffset = memRangesOffest * 4 + memRangesSize;

    module.HEAPU8.fill(0);
    for (let i = 0; i < memRangesLength; ++i) {
        const left = i32View[memRangesOffest + 1 + i * 2];
        const right = i32View[memRangesOffest + 2 + i * 2];
        const len = right - left;

        module.HEAPU8.set(snapshot.subarray(payloadOffset, payloadOffset + len), left);
        payloadOffset += len;
    }

    module.asm.globalswrite.apply(null, globals);
    return time;
}

export function globalscall(module: any, ...globals: any[]) {
    if (module.onglobals !== undefined) {
        const fn = module.onglobals;
        delete module.onglobals;
        fn(globals);
    }
}
