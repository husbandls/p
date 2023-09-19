/**
 * Converts a hexadecimal color number to an [R, G, B] array of normalized floats (numbers from 0.0 to 1.0).
 * @example
 * utils.hex2rgb(0xffffff); // returns [1, 1, 1]
 * @param hex - The hexadecimal number to convert
 * @param out - If supplied, this array will be used rather than returning a new one
 * @returns  An array representing the [R, G, B] of the color where all values are floats.
 */
export function hex2rgb(hex: number, out: number[] = []): number[]
{
    out[0] = ((hex >> 16) & 0xFF) / 255;
    out[1] = ((hex >> 8) & 0xFF) / 255;
    out[2] = (hex & 0xFF) / 255;

    return out;
}

/**
 * Converts a hexadecimal color number to a string.
 * @example
 * utils.hex2string(0xffffff); // returns "#ffffff"
 * @memberof utils
 * @function hex2string
 * @param {number} hex - Number in hex (e.g., `0xffffff`)
 * @returns {string} The string color (e.g., `"#ffffff"`).
 */
export function hex2string(hex: number): string
{
    let hexString = hex.toString(16);

    hexString = '000000'.substring(0, 6 - hexString.length) + hexString;

    return `#${hexString}`;
}

/**
 * Converts a string to a hexadecimal color number.
 * It can handle:
 *  hex strings starting with #: "#ffffff"
 *  hex strings starting with 0x: "0xffffff"
 *  hex strings without prefix: "ffffff"
 *  css colors: "black"
 * @example
 * utils.string2hex("#ffffff"); // returns 0xffffff
 * @memberof utils
 * @function string2hex
 * @param {string} string - The string color (e.g., `"#ffffff"`)
 * @returns {number} Number in hexadecimal.
 */
export function string2hex(string: string): number
{
    if (typeof string === 'string')
    {
        // string = (cssColorNames as {[key: string]: string})[string.toLowerCase()] || string;

        if (string[0] === '#')
        {
            string = string.slice(1);
        }
    }

    return parseInt(string, 16);
}

/**
 * Converts a color as an [R, G, B] array of normalized floats to a hexadecimal number.
 * @example
 * utils.rgb2hex([1, 1, 1]); // returns 0xffffff
 * @memberof utils
 * @function rgb2hex
 * @param {number[]} rgb - Array of numbers where all values are normalized floats from 0.0 to 1.0.
 * @returns {number} Number in hexadecimal.
 */
export function rgb2hex(rgb: number[] | Float32Array): number
{
    return (((rgb[0] * 255) << 16) + ((rgb[1] * 255) << 8) + (rgb[2] * 255 | 0));
}
