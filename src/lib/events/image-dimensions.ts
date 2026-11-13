import { readFileSync } from "node:fs";
import path from "node:path";
import type { ImageAsset } from "@/content/types";

type Size = { width: number; height: number };

function jpegSize(buffer: Buffer): Size | undefined {
    let offset = 2;
    while (offset + 9 < buffer.length) {
        if (buffer[offset] !== 0xff) {
            offset += 1;
            continue;
        }
        const marker = buffer[offset + 1];
        // Start-of-frame markers carry the dimensions.
        if (
            marker >= 0xc0 &&
            marker <= 0xcf &&
            marker !== 0xc4 &&
            marker !== 0xc8 &&
            marker !== 0xcc
        ) {
            return {
                height: buffer.readUInt16BE(offset + 5),
                width: buffer.readUInt16BE(offset + 7),
            };
        }
        offset += 2 + buffer.readUInt16BE(offset + 2);
    }
    return undefined;
}

function pngSize(buffer: Buffer): Size | undefined {
    if (buffer.length < 24) return undefined;
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

/** Reads the pixel size of a file in /public. Returns undefined for unknown formats or missing files. */
function readSize(src: string): Size | undefined {
    try {
        const file = path.join(process.cwd(), "public", src);
        const buffer = readFileSync(file);
        if (buffer[0] === 0xff && buffer[1] === 0xd8) return jpegSize(buffer);
        if (buffer[0] === 0x89 && buffer[1] === 0x50) return pngSize(buffer);
    } catch {
        // Missing file or unreadable header: fall back to the declared size.
    }
    return undefined;
}

/** Fills in width and height from the files themselves when the content data omits them. */
export function withImageSizes(images: readonly ImageAsset[]): ImageAsset[] {
    return images.map((image) => {
        if (image.width && image.height) return image;
        const size = readSize(image.src);
        return size ? { ...image, ...size } : image;
    });
}
