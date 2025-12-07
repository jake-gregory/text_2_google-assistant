import fs from 'fs';
import { spawn } from 'child_process';

export function playRawPCM(filePath, buffer) {
    // Write WAV header + buffer
    const wavHeader = generateWavHeader(buffer.length, 24000, 1, 16);
    const wavBuffer = Buffer.concat([wavHeader, buffer]);

    // Write wave file to disk. filepath supplied in grpc.js
    fs.writeFileSync(filePath, wavBuffer);

    // Play using OS specific command for Mac, Windows or Linux
    playAudio(filePath)
}

// Helper to create WAV header
function generateWavHeader(byteLength, sampleRate, channels, bitDepth) {
    const header = Buffer.alloc(44);
    const blockAlign = channels * bitDepth / 8;
    const byteRate = sampleRate * blockAlign;

    header.write('RIFF', 0);
    header.writeUInt32LE(byteLength + 36, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16); // PCM chunk size
    header.writeUInt16LE(1, 20);  // PCM format
    header.writeUInt16LE(channels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(bitDepth, 34);
    header.write('data', 36);
    header.writeUInt32LE(byteLength, 40);
    return header;
}

function playAudio(filePath) {

    // Get OS platform
    const platform = process.platform;

    let cmd;
    let args = [];

    if (platform === 'darwin') {
        // macOS: use afplay
        cmd = 'afplay';
        args = [filePath];

    } else if (platform === 'win32') {
        // Windows: use PowerShell SoundPlayer
        cmd = 'powershell';
        args = [
            '-c',
            `(New-Object Media.SoundPlayer "${filePath}").PlaySync();`
        ];

    } else if (platform === 'linux') {
        // Linux: use aplay
        cmd = 'aplay';
        args = [filePath];
    } else {
        throw new Error(`Unsupported audio playback platform: ${platform}`);
    }

    // Run play command in OS shell
    const shell = spawn(cmd, args, { stdio: 'inherit' });

    // Log any errors from shell
    shell.on('error', err => {
        console.error('Failed to start audio player:', err);
    });
}
