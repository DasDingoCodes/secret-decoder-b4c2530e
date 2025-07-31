#!/usr/bin/env node

import crypto from "crypto";
import fs from "fs";
import path from "path";

const SALT = "my-static-salt"; // Change this or randomize it if you're storing it separately

function deriveKey(passcode) {
  return crypto.pbkdf2Sync(passcode, SALT, 100000, 32, 'sha256'); // 32 bytes = 256-bit key
}

function encryptData(dataBuffer, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(dataBuffer), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('base64')}`;
}

function readFileAsBuffer(filePath) {
  try {
    return fs.readFileSync(filePath);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    process.exit(1);
  }
}

function readTextFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading text file ${filePath}:`, error.message);
    process.exit(1);
  }
}

function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length !== 4) {
    console.log('Usage: node encode-assets.js <6-digit-code> <image-path> <audio-path> <text-file-path>');
    console.log('Example: node encode-assets.js 123456 ./secret.jpg ./secret.mp3 ./message.txt');
    process.exit(1);
  }

  const [passcode, imagePath, audioPath, textFilePath] = args;

  // Validate passcode
  if (!/^\d{6}$/.test(passcode)) {
    console.error('Error: Passcode must be exactly 6 digits');
    process.exit(1);
  }

  for (const file of [imagePath, audioPath, textFilePath]) {
    if (!fs.existsSync(file)) {
      console.error(`Error: File not found: ${file}`);
      process.exit(1);
    }
  }

  console.log('🔐 Encrypting assets...\n');

  const key = deriveKey(passcode);

  const encryptedImage = encryptData(readFileAsBuffer(imagePath), key);
  const encryptedAudio = encryptData(readFileAsBuffer(audioPath), key);
  const encryptedText = encryptData(Buffer.from(readTextFile(textFilePath), 'utf8'), key);

  const hashedPasscode = crypto.createHash('sha256').update(passcode).digest('hex');

  const outputDir = path.join('src', 'assets');
  ensureDirExists(outputDir);

  fs.writeFileSync(path.join(outputDir, 'encoded-image.enc'), encryptedImage);
  fs.writeFileSync(path.join(outputDir, 'encoded-audio.enc'), encryptedAudio);
  fs.writeFileSync(path.join(outputDir, 'encoded-text.enc'), encryptedText);
  fs.writeFileSync(path.join(outputDir, 'passcode-hash.txt'), hashedPasscode);

  console.log('✅ Assets encrypted and saved:');
  console.log(`- Image: ${outputDir}/encoded-image.enc`);
  console.log(`- Audio: ${outputDir}/encoded-audio.enc`);
  console.log(`- Text : ${outputDir}/encoded-text.enc`);
  console.log('\n📋 Store this in your app to verify passcode input:');
  console.log(`PASSCODE_HASH: "${hashedPasscode}"`);
}

main();
