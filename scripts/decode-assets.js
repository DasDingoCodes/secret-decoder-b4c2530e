import crypto from "crypto";
import fs from "fs";

const SALT = "my-static-salt"; // Must be the same as in the encoder

function deriveKey(passcode) {
  return crypto.pbkdf2Sync(passcode, SALT, 100000, 32, 'sha256');
}

function decryptData(encString, key) {
  const [ivHex, encryptedBase64] = encString.split(":");
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedBase64, 'base64');
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted;
}

// Example usage:
const passcode = '123456';
const key = deriveKey(passcode);
const encryptedImage = fs.readFileSync('src/assets/encoded-image.enc', 'utf8');
const imageBuffer = decryptData(encryptedImage, key);
fs.writeFileSync('decrypted-image.jpg', imageBuffer); // or .png depending on original

const encryptedAudio = fs.readFileSync('src/assets/encoded-audio.enc', 'utf8');
const audioBuffer = decryptData(encryptedImage, key);
fs.writeFileSync('decrypted-audio.mp3', audioBuffer);

const encryptedText = fs.readFileSync('src/assets/encoded-text.enc', 'utf8');
const text = decryptData(encryptedText, key).toString('utf8');
console.log("Decrypted text:", text);
