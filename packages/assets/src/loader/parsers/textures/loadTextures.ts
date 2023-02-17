import { BaseTexture, extensions, ExtensionType, settings, utils } from '@pixi/core';
import { checkDataUrl } from '../../../utils/checkDataUrl';
import { checkExtension } from '../../../utils/checkExtension';
import { LoaderParserPriority } from '../LoaderParser';
import { WorkerManager } from '../WorkerManager';
import { createTexture } from './utils/createTexture';

import type { IBaseTextureOptions, Texture } from '@pixi/core';
import type { Loader } from '../../Loader';
import type { LoadAsset } from '../../types';
import type { LoaderParser } from '../LoaderParser';

const validImageExtensions = ['.jpeg', '.jpg', '.png', '.webp', '.avif'];
const validImageMIMEs = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
];

/**
 * Returns a promise that resolves an ImageBitmaps.
 * This function is designed to be used by a worker.
 * Part of WorkerManager!
 * @param url - The image to load an image bitmap for
 */
export async function loadImageBitmap(url: string): Promise<ImageBitmap>
{
    const response = await settings.ADAPTER.fetch(url);

    if (!response.ok)
    {
        throw new Error(`[loadImageBitmap] Failed to fetch ${url}: `
            + `${response.status} ${response.statusText}`);
    }

    const imageBlob = await response.blob();
    const imageBitmap = await createImageBitmap(imageBlob);

    return imageBitmap;
}

/**
 * Loads our textures!
 * this makes use of imageBitmaps where available.
 * We load the ImageBitmap on a different thread using the WorkerManager
 * We can then use the ImageBitmap as a source for a Pixi Texture
 *
 * You can customize the behavior of this loader by setting the `config` property.
 * ```js
 * // Set the config
 * import { loadTextures } from '@pixi/assets';
 * loadTextures.config = {
 *    // If true we will use a worker to load the ImageBitmap
 *    preferWorkers: true,
 *    // If false we will use new Image() instead of createImageBitmap
 *    // If false then this will also disable the use of workers as it requires createImageBitmap
 *    preferCreateImageBitmap: true,
 *    crossOrigin: 'anonymous',
 * };
 * ```
 */
export const loadTextures = {
    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.High,
    },

    config: {
        preferWorkers: true,
        preferCreateImageBitmap: true,
        crossOrigin: 'anonymous',
    },

    test(url: string): boolean
    {
        return checkDataUrl(url, validImageMIMEs) || checkExtension(url, validImageExtensions);
    },

    async load(url: string, asset: LoadAsset<IBaseTextureOptions>, loader: Loader): Promise<Texture>
    {
        let src: any = null;

        if (globalThis.createImageBitmap && this.config.preferCreateImageBitmap)
        {
            if (this.config.preferWorkers && await WorkerManager.isImageBitmapSupported())
            {
                src = await WorkerManager.loadImageBitmap(url);
            }
            else
            {
                src = await loadImageBitmap(url);
            }
        }
        else
        {
            src = await new Promise((resolve) =>
            {
                src = new Image();
                src.crossOrigin = this.config.crossOrigin;

                src.src = url;
                if (src.complete)
                {
                    resolve(src);
                }
                else
                {
                    src.onload = (): void =>
                    {
                        resolve(src);
                    };
                }
            });
        }

        const base = new BaseTexture(src, {
            resolution: utils.getResolutionOfUrl(url),
            ...asset.data,
        });

        base.resource.src = url;

        return createTexture(base, loader, url);
    },

    unload(texture: Texture): void
    {
        texture.destroy(true);
    }
} as LoaderParser<Texture, IBaseTextureOptions>;

extensions.add(loadTextures);
