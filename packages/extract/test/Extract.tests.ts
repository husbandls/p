import {
    ALPHA_MODES,
    FORMATS,
    MSAA_QUALITY,
    Rectangle,
    Renderer,
    RenderTexture,
    SCALE_MODES,
    Texture,
    TYPES,
} from '@pixi/core';
import { Extract } from '@pixi/extract';
import { Graphics } from '@pixi/graphics';
import { Sprite } from '@pixi/sprite';

describe('Extract', () =>
{
    it('should access extract on renderer', () =>
    {
        const renderer = new Renderer();

        expect(renderer.plugins.extract).toBeInstanceOf(Extract);
        expect(renderer.extract).toBeInstanceOf(Extract);

        renderer.destroy();
    });

    it('should extract the same pixels', async () =>
    {
        const renderer = new Renderer({ width: 2, height: 2 });
        const graphics = new Graphics()
            .beginFill(0xFF0000)
            .drawRect(0, 0, 1, 1)
            .endFill()
            .beginFill(0x00FF00)
            .drawRect(1, 0, 1, 1)
            .endFill()
            .beginFill(0x0000FF)
            .drawRect(0, 1, 1, 1)
            .endFill()
            .beginFill(0xFFFF00)
            .drawRect(1, 1, 1, 1)
            .endFill();
        const expectedPixels = new Uint8Array([
            255, 0, 0, 255,
            0, 255, 0, 255,
            0, 0, 255, 255,
            255, 255, 0, 255
        ]);
        const renderTexture = renderer.generateTexture(graphics);
        const extract = renderer.extract;

        renderer.render(graphics);

        const pixelsRenderer = extract.pixels();
        const pixelsRenderTexture = extract.pixels(renderTexture);
        const pixelsGraphics = extract.pixels(graphics);

        expect(pixelsRenderer).toEqual(expectedPixels);
        expect(pixelsRenderTexture).toEqual(expectedPixels);
        expect(pixelsGraphics).toEqual(expectedPixels);

        renderTexture.destroy(true);
        graphics.destroy();
        renderer.destroy();
    });

    it('should extract pixels from renderer correctly', async () =>
    {
        const renderer = new Renderer({ width: 2, height: 2 });
        const texturePixels = new Uint8Array([
            255, 0, 0, 255, 0, 255, 0, 153,
            0, 0, 255, 102, 255, 255, 0, 51
        ]);
        const texture = Texture.fromBuffer(texturePixels, 2, 2, {
            width: 2,
            height: 2,
            format: FORMATS.RGBA,
            type: TYPES.UNSIGNED_BYTE,
            alphaMode: ALPHA_MODES.UNPACK
        });
        const sprite = new Sprite(texture);
        const extract = renderer.extract;

        renderer.render(sprite);

        const extractedPixels = extract.pixels();

        expect(extractedPixels).toEqual(new Uint8Array([
            255, 0, 0, 255, 0, 153, 0, 255,
            0, 0, 102, 255, 51, 51, 0, 255
        ]));

        texture.destroy(true);
        sprite.destroy();
        renderer.destroy();
    });

    it('should extract canvas from renderer correctly', async () =>
    {
        const renderer = new Renderer({ width: 2, height: 2 });
        const texturePixels = new Uint8Array([
            255, 0, 0, 255, 0, 255, 0, 153,
            0, 0, 255, 102, 255, 255, 0, 51
        ]);
        const texture = Texture.fromBuffer(texturePixels, 2, 2, {
            width: 2,
            height: 2,
            format: FORMATS.RGBA,
            type: TYPES.UNSIGNED_BYTE,
            alphaMode: ALPHA_MODES.UNPACK
        });
        const sprite = new Sprite(texture);
        const extract = renderer.extract;

        renderer.render(sprite);

        const canvas = extract.canvas();
        const context = canvas.getContext('2d');
        const imageData = context?.getImageData(0, 0, 2, 2);

        expect(imageData?.data).toEqual(new Uint8ClampedArray([
            255, 0, 0, 255, 0, 153, 0, 255,
            0, 0, 102, 255, 51, 51, 0, 255
        ]));

        texture.destroy(true);
        sprite.destroy();
        renderer.destroy();
    });

    it('should extract pixels from render texture correctly', async () =>
    {
        const renderer = new Renderer({ width: 2, height: 2 });
        const texturePixels = new Uint8Array([
            255, 0, 0, 255, 0, 255, 0, 153,
            0, 0, 255, 102, 255, 255, 0, 51
        ]);
        const texture = Texture.fromBuffer(texturePixels, 2, 2, {
            width: 2,
            height: 2,
            format: FORMATS.RGBA,
            type: TYPES.UNSIGNED_BYTE,
            alphaMode: ALPHA_MODES.UNPACK
        });
        const sprite = new Sprite(texture);
        const extract = renderer.extract;

        const extractedPixels = extract.pixels(sprite);

        expect(extractedPixels).toEqual(texturePixels);

        const extractedPixelsAsync = await extract.pixels(sprite, undefined, true);

        expect(extractedPixelsAsync).toEqual(texturePixels);

        texture.destroy(true);
        sprite.destroy();
        renderer.destroy();
    });

    it('should extract canvas from render texture correctly', async () =>
    {
        const renderer = new Renderer({ width: 2, height: 2 });
        const texturePixels = new Uint8Array([
            255, 0, 0, 255, 0, 255, 0, 153,
            0, 0, 255, 102, 255, 255, 0, 51
        ]);
        const texture = Texture.fromBuffer(texturePixels, 2, 2, {
            width: 2,
            height: 2,
            format: FORMATS.RGBA,
            type: TYPES.UNSIGNED_BYTE,
            alphaMode: ALPHA_MODES.UNPACK
        });
        const sprite = new Sprite(texture);
        const extract = renderer.extract;

        const canvas = extract.canvas(sprite);
        const context = canvas.getContext('2d');
        const imageData = context?.getImageData(0, 0, 2, 2);

        expect(imageData?.data).toEqual(new Uint8ClampedArray(texturePixels.buffer));

        const canvasAsync = await extract.canvas(sprite, undefined, true);
        const contextAsync = canvasAsync.getContext('2d');
        const imageDataAsync = contextAsync?.getImageData(0, 0, 2, 2);

        expect(imageDataAsync?.data).toEqual(new Uint8ClampedArray(texturePixels.buffer));

        texture.destroy(true);
        sprite.destroy();
        renderer.destroy();
    });

    it('should extract pixels with resolution !== 1', async () =>
    {
        const renderer = new Renderer({ width: 2, height: 2, resolution: 2 });
        const texturePixels = new Uint8Array([
            255, 0, 0, 255, 0, 255, 0, 153,
            0, 0, 255, 102, 255, 255, 0, 51,
        ]);
        const texture = Texture.fromBuffer(texturePixels, 2, 2, {
            width: 2,
            height: 2,
            format: FORMATS.RGBA,
            type: TYPES.UNSIGNED_BYTE,
            alphaMode: ALPHA_MODES.UNPACK,
            scaleMode: SCALE_MODES.NEAREST,
        });
        const sprite = new Sprite(texture);

        renderer.render(sprite);

        const extractedPixels = renderer.extract.pixels();

        expect(extractedPixels).toEqual(new Uint8Array([
            255, 0, 0, 255, 255, 0, 0, 255, 0, 153, 0, 255, 0, 153, 0, 255,
            255, 0, 0, 255, 255, 0, 0, 255, 0, 153, 0, 255, 0, 153, 0, 255,
            0, 0, 102, 255, 0, 0, 102, 255, 51, 51, 0, 255, 51, 51, 0, 255,
            0, 0, 102, 255, 0, 0, 102, 255, 51, 51, 0, 255, 51, 51, 0, 255,
        ]));

        texture.destroy(true);
        sprite.destroy();
        renderer.destroy();
    });

    it('should extract canvas with resolution !== 1', async () =>
    {
        const renderer = new Renderer({ width: 2, height: 2, resolution: 2 });
        const texturePixels = new Uint8Array([
            255, 0, 0, 255, 0, 255, 0, 153,
            0, 0, 255, 102, 255, 255, 0, 51,
        ]);
        const texture = Texture.fromBuffer(texturePixels, 2, 2, {
            width: 2,
            height: 2,
            format: FORMATS.RGBA,
            type: TYPES.UNSIGNED_BYTE,
            alphaMode: ALPHA_MODES.UNPACK,
            scaleMode: SCALE_MODES.NEAREST,
        });
        const sprite = new Sprite(texture);

        renderer.render(sprite);

        const canvas = renderer.extract.canvas();

        expect(canvas.width).toEqual(4);
        expect(canvas.height).toEqual(4);

        const context = canvas.getContext('2d');
        const imageData = context?.getImageData(0, 0, 4, 4);

        expect(imageData?.data).toEqual(new Uint8ClampedArray([
            255, 0, 0, 255, 255, 0, 0, 255, 0, 153, 0, 255, 0, 153, 0, 255,
            255, 0, 0, 255, 255, 0, 0, 255, 0, 153, 0, 255, 0, 153, 0, 255,
            0, 0, 102, 255, 0, 0, 102, 255, 51, 51, 0, 255, 51, 51, 0, 255,
            0, 0, 102, 255, 0, 0, 102, 255, 51, 51, 0, 255, 51, 51, 0, 255,
        ]));

        texture.destroy(true);
        sprite.destroy();
        renderer.destroy();
    });

    it('should extract an sprite', async () =>
    {
        const renderer = new Renderer();
        const sprite = new Sprite(Texture.WHITE);
        const extract = renderer.extract;

        expect(extract.canvas(sprite)).toBeInstanceOf(HTMLCanvasElement);
        expect(await extract.base64(sprite)).toBeString();
        expect(extract.pixels(sprite)).toBeInstanceOf(Uint8Array);
        expect(await extract.image(sprite)).toBeInstanceOf(HTMLImageElement);

        renderer.destroy();
        sprite.destroy();
    });

    it('should extract with no arguments', async () =>
    {
        const renderer = new Renderer();
        const extract = renderer.extract;

        expect(extract.canvas()).toBeInstanceOf(HTMLCanvasElement);
        expect(await extract.base64()).toBeString();
        expect(extract.pixels()).toBeInstanceOf(Uint8Array);
        expect(await extract.image()).toBeInstanceOf(HTMLImageElement);

        renderer.destroy();
    });

    it('should extract a render texture', async () =>
    {
        const renderer = new Renderer();
        const extract = renderer.extract;
        const renderTexture = RenderTexture.create({ width: 10, height: 10 });
        const sprite = new Sprite(Texture.WHITE);
        const frame = new Rectangle(1, 2, 5, 6);

        renderer.render(sprite, { renderTexture });

        expect(extract.canvas(renderTexture)).toBeInstanceOf(HTMLCanvasElement);
        expect(await extract.base64(renderTexture)).toBeString();
        expect(extract.pixels(renderTexture, frame)).toBeInstanceOf(Uint8Array);
        expect(await extract.image(renderTexture)).toBeInstanceOf(HTMLImageElement);

        renderer.destroy();
        renderTexture.destroy();
        sprite.destroy();
    });

    it('should extract with multisample', async () =>
    {
        const renderer = new Renderer({ antialias: true });
        const extract = renderer.extract;
        const sprite = new Sprite(Texture.WHITE);

        expect(extract.canvas(sprite)).toBeInstanceOf(HTMLCanvasElement);
        expect(await extract.base64(sprite)).toBeString();
        expect(extract.pixels(sprite)).toBeInstanceOf(Uint8Array);
        expect(await extract.image(sprite)).toBeInstanceOf(HTMLImageElement);

        renderer.destroy();
        sprite.destroy();
    });

    it('should unpremultiply alpha correctly', () =>
    {
        const pixels1 = new Uint8Array(4);
        const pixels2 = new Uint8ClampedArray(4);

        Extract['_unpremultiplyAlpha'](pixels1);
        Extract['_unpremultiplyAlpha'](pixels2);

        expect(pixels1[0]).toBe(0);
        expect(pixels1[1]).toBe(0);
        expect(pixels1[2]).toBe(0);
        expect(pixels1[3]).toBe(0);
        expect(pixels2[0]).toBe(0);
        expect(pixels2[1]).toBe(0);
        expect(pixels2[2]).toBe(0);
        expect(pixels2[3]).toBe(0);

        for (let alpha = 1; alpha < 256; alpha++)
        {
            for (let x = 0; x <= alpha; x++)
            {
                pixels1[0] = x;
                pixels1[1] = 0;
                pixels1[2] = 0;
                pixels1[3] = alpha;
                pixels2[0] = x;
                pixels2[1] = 0;
                pixels2[2] = 0;
                pixels2[3] = alpha;

                Extract['_unpremultiplyAlpha'](pixels1);
                Extract['_unpremultiplyAlpha'](pixels2);

                const y = Math.min(Math.max(Math.round((x * 255) / alpha), 0), 255);

                expect(pixels1[0]).toBe(y);
                expect(pixels1[1]).toBe(0);
                expect(pixels1[2]).toBe(0);
                expect(pixels1[3]).toBe(alpha);
                expect(pixels2[0]).toBe(y);
                expect(pixels2[1]).toBe(0);
                expect(pixels2[2]).toBe(0);
                expect(pixels2[3]).toBe(alpha);
            }
        }
    });

    it('should extract from multisampled render texture', async () =>
    {
        const renderer = new Renderer();
        const extract = renderer.extract;
        const sprite = new Sprite(Texture.WHITE);
        const renderTexture = renderer.generateTexture(sprite, {
            multisample: MSAA_QUALITY.HIGH
        });

        // unbind renderTexture
        renderer.renderTexture.bind();

        const pixels = extract.pixels(renderTexture);

        expect(pixels).toBeInstanceOf(Uint8Array);
        expect(pixels[0]).toBe(255);
        expect(pixels[1]).toBe(255);
        expect(pixels[2]).toBe(255);
        expect(pixels[3]).toBe(255);

        renderer.destroy();
        sprite.destroy();
    });

    it('should fill out-of-bounds pixels with zeros', async () =>
    {
        const renderer = new Renderer();
        const graphics = new Graphics()
            .beginFill(0xFF0000)
            .drawRect(0, 0, 2, 2)
            .endFill();
        const extract = renderer.extract;

        const pixels1 = extract.pixels(graphics, new Rectangle(0, 0, 2, 2));
        const pixels2 = extract.pixels(graphics, new Rectangle(1, 1, 2, 2));

        expect(pixels1).toEqual(new Uint8Array([
            255, 0, 0, 255, 255, 0, 0, 255,
            255, 0, 0, 255, 255, 0, 0, 255
        ]));
        expect(pixels2).toEqual(new Uint8Array([
            255, 0, 0, 255, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0
        ]));

        const pixels3 = await extract.pixels(graphics, new Rectangle(0, 0, 2, 2), true);
        const pixels4 = await extract.pixels(graphics, new Rectangle(1, 1, 2, 2), true);

        expect(pixels3).toEqual(new Uint8Array([
            255, 0, 0, 255, 255, 0, 0, 255,
            255, 0, 0, 255, 255, 0, 0, 255
        ]));
        expect(pixels4).toEqual(new Uint8Array([
            255, 0, 0, 255, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0
        ]));

        graphics.destroy();
        renderer.destroy();
    });

    it('should throw error if renderer is destroyed', async () =>
    {
        const renderer = new Renderer();
        const sprite = new Sprite(Texture.WHITE);
        const extract = renderer.extract;

        renderer.destroy();

        expect(() => extract.canvas(sprite)).toThrow();
        await expect(extract.base64(sprite)).toReject();
        expect(() => extract.pixels(sprite)).toThrow();
        await expect(extract.image(sprite)).toReject();

        sprite.destroy();
    });

    it('should return promise if async', async () =>
    {
        const renderer = new Renderer();
        const sprite = new Sprite(Texture.WHITE);
        const extract = renderer.extract;

        const base64Promise1 = extract.base64(sprite);

        expect(base64Promise1).toBeInstanceOf(Promise);
        await expect(base64Promise1).toResolve();

        const canvasPromise1 = extract.canvas(sprite, undefined, true);

        expect(canvasPromise1).toBeInstanceOf(Promise);
        await expect(canvasPromise1).toResolve();

        const imagePromise1 = extract.image(sprite);

        expect(imagePromise1).toBeInstanceOf(Promise);
        await expect(imagePromise1).toResolve();

        const pixelsPromise1 = extract.pixels(sprite, undefined, true);

        expect(pixelsPromise1).toBeInstanceOf(Promise);
        await expect(pixelsPromise1).toResolve();

        renderer.destroy();

        const base64Promise2 = extract.base64(sprite);

        expect(base64Promise2).toBeInstanceOf(Promise);
        await expect(base64Promise2).toReject();

        const canvasPromise2 = extract.canvas(sprite, undefined, true);

        expect(canvasPromise2).toBeInstanceOf(Promise);
        await expect(canvasPromise2).toReject();

        const imagePromise2 = extract.image(sprite);

        expect(imagePromise2).toBeInstanceOf(Promise);
        await expect(imagePromise2).toReject();

        const pixelsPromise2 = extract.pixels(sprite, undefined, true);

        expect(pixelsPromise2).toBeInstanceOf(Promise);
        await expect(pixelsPromise2).toReject();

        sprite.destroy();
    });
});
