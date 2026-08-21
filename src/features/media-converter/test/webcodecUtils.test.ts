import { describe, expect, it } from 'vitest';
import { buildWebCodecVideoConfig } from '../lib/webcodecUtils';

describe('WebCodec Utilities', () => {
    describe('buildWebCodecVideoConfig', () => {
        it('builds default config', () => {
            const config = buildWebCodecVideoConfig({
                quality: 'medium',
                resolution: 'original',
                videoCodec: 'default'
            });
            expect(config.hardwareAcceleration).toBe('prefer-hardware');
            expect(config.height).toBeUndefined();
            expect(config.codec).toBeUndefined();
        });

        it('injects height for 1080p resolution', () => {
            const config = buildWebCodecVideoConfig({
                resolution: '1080p',
            });
            expect(config.height).toBe(1080);
        });

        it('injects codec for HEVC', () => {
            const config = buildWebCodecVideoConfig({
                videoCodec: 'hevc',
            });
            expect(config.codec).toBe('hevc');
        });

        it('injects both codec and height correctly', () => {
            const config = buildWebCodecVideoConfig({
                resolution: '480p',
                videoCodec: 'vp9',
            });
            expect(config.height).toBe(480);
            expect(config.codec).toBe('vp9');
        });
    });
});
