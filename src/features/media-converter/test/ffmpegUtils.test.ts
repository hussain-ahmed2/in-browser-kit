import { describe, expect, it } from 'vitest'
import { getFFmpegArgs, getMimeType } from '../lib/ffmpegUtils'

describe('FFmpeg Utilities', () => {
    describe('getFFmpegArgs', () => {
        it('generates correct arguments for high quality mp4', () => {
            const args = getFFmpegArgs('mp4', 'high', 'original', 'input.mov', 'output.mp4', '4');
            expect(args).toEqual([
                '-i', 'input.mov', 
                '-threads', '4', 
                '-vf', "scale='min(1920,iw)':-2",
                '-preset', 'fast', 
                '-crf', '22', 
                'output.mp4'
            ]);
        });

        it('generates correct arguments for low quality webm', () => {
            const args = getFFmpegArgs('webm', 'low', 'input.mp4', 'output.webm', '2');
            expect(args).toEqual([
                '-i', 'input.mp4', 
                '-threads', '2', 
                '-vf', "scale='min(1920,iw)':-2",
                '-preset', 'ultrafast', 
                '-crf', '35',
                '-deadline', 'realtime',
                '-cpu-used', '8',
                'output.webm'
            ]);
        });

        it('generates correct arguments for high quality mp3', () => {
            const args = getFFmpegArgs('mp3', 'high', 'original', 'input.wav', 'output.mp3', '4');
            expect(args).toEqual([
                '-i', 'input.wav', 
                '-threads', '4', 
                '-b:a', '320k', 
                'output.mp3'
            ]);
        });

        it('generates correct arguments for wav (no quality flags)', () => {
            const args = getFFmpegArgs('wav', 'medium', 'original', 'input.mp3', 'output.wav', '4');
            expect(args).toEqual([
                '-i', 'input.mp3', 
                '-threads', '4', 
                'output.wav'
            ]);
        });

        it('defaults to 2 threads if not provided', () => {
            const args = getFFmpegArgs('gif', 'medium', 'original', 'input.mp4', 'output.gif');
            expect(args).toEqual([
                '-i', 'input.mp4', 
                '-threads', '2', 
                'output.gif'
            ]);
        });
    });

    describe('getMimeType', () => {
        it('returns video/mp4 for mp4', () => {
            expect(getMimeType('mp4')).toBe('video/mp4');
        });

        it('returns audio/mpeg for mp3', () => {
            expect(getMimeType('mp3')).toBe('audio/mpeg');
        });

        it('returns image/gif for gif', () => {
            expect(getMimeType('gif')).toBe('image/gif');
        });

        it('returns application/octet-stream for unknown formats', () => {
            expect(getMimeType('unknown_format')).toBe('application/octet-stream');
        });
    });
});
