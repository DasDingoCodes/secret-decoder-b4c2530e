#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function hashPasscode(passcode) {
  return crypto.createHash('sha256').update(passcode).digest('hex');
}

function encodeFile(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    return fileBuffer.toString('base64');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    process.exit(1);
  }
}

function encodeText(text) {
  return Buffer.from(text, 'utf8').toString('base64');
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length !== 4) {
    console.log('Usage: node encode-assets.js <6-digit-code> <image-path> <audio-path> <text-content>');
    console.log('Example: node encode-assets.js 123456 ./secret.jpg ./secret.mp3 "SECRET MESSAGE"');
    process.exit(1);
  }

  const [passcode, imagePath, audioPath, textContent] = args;

  // Validate passcode
  if (!/^\d{6}$/.test(passcode)) {
    console.error('Error: Passcode must be exactly 6 digits');
    process.exit(1);
  }

  // Validate file paths
  if (!fs.existsSync(imagePath)) {
    console.error(`Error: Image file not found: ${imagePath}`);
    process.exit(1);
  }

  if (!fs.existsSync(audioPath)) {
    console.error(`Error: Audio file not found: ${audioPath}`);
    process.exit(1);
  }

  console.log('🔐 Encoding assets...\n');

  const hashedPasscode = hashPasscode(passcode);
  const encodedImage = encodeFile(imagePath);
  const encodedAudio = encodeFile(audioPath);
  const encodedText = encodeText(textContent);

  console.log('✅ Results:');
  console.log('='.repeat(50));
  console.log(`Passcode Hash: ${hashedPasscode}`);
  console.log(`\nEncoded Image (first 100 chars): ${encodedImage.substring(0, 100)}...`);
  console.log(`Image full length: ${encodedImage.length} characters`);
  console.log(`\nEncoded Audio (first 100 chars): ${encodedAudio.substring(0, 100)}...`);
  console.log(`Audio full length: ${encodedAudio.length} characters`);
  console.log(`\nEncoded Text: ${encodedText}`);

  // Save to output file
  const output = {
    passcodeHash: hashedPasscode,
    encodedImage,
    encodedAudio,
    encodedText,
    metadata: {
      originalImagePath: imagePath,
      originalAudioPath: audioPath,
      originalText: textContent,
      generatedAt: new Date().toISOString()
    }
  };

  const outputPath = 'encoded-assets.json';
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n💾 Full output saved to: ${outputPath}`);
  console.log('\n📋 Copy these values to your application code:');
  console.log(`PASSCODE_HASH: "${hashedPasscode}"`);
  console.log(`ENCODED_IMAGE: "${encodedImage}"`);
  console.log(`ENCODED_AUDIO: "${encodedAudio}"`);
  console.log(`ENCODED_TEXT: "${encodedText}"`);
}

main();