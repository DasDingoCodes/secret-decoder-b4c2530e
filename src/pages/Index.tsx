import React from "react"
import { useEffect, useState } from "react";
import StartScreen from "@/components/StartScreen";
import SuccessScreen from "@/components/SuccessScreen";

const SALT = "my-static-salt"; // Must match the encoder

const hashCode = async (code: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

const deriveKey = async (passcode: string): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey("raw", encoder.encode(passcode), { name: "PBKDF2" }, false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode(SALT),
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-CBC", length: 256 },
    false,
    ["decrypt"]
  );
};

const decryptData = async (encString: string, key: CryptoKey): Promise<ArrayBuffer> => {
  const [ivHex, base64] = encString.trim().split(":");
  const iv = Uint8Array.from(ivHex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));

  const binaryStr = atob(base64);
  const encryptedData = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    encryptedData[i] = binaryStr.charCodeAt(i);
  }

  return crypto.subtle.decrypt({ name: "AES-CBC", iv }, key, encryptedData);
};

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}



const loadAndDecryptAsset = async (url: string, key: CryptoKey, asText = false): Promise<string | ArrayBuffer> => {
  const response = await fetch(url);
  const encText = await response.text();
  const decryptedBuffer = await decryptData(encText, key);
  return asText ? new TextDecoder("utf-8").decode(decryptedBuffer) : decryptedBuffer;
};

const DECRYPTION_MESSAGES = [
  "Decrypting secret assets...",
  "Calling the power of the personified evil...", 
  "Debating database models...",
  "✨ Making everything perfect..."
];

const Index = () => {
  const [code, setCode] = useState("");
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [revealedText, setRevealedText] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageTileUrl, setImageTileUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [passcodeHash, setPasscodeHash] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Load hash from file on first render
  useEffect(() => {
    const loadHash = async () => {
      try {
        const res = await fetch("/passcode-hash.txt");
        const hashText = await res.text();
        setPasscodeHash(hashText.trim());
      } catch (err) {
        console.error("Failed to load passcode hash:", err);
      }
    };
    loadHash();
  }, []);

  useEffect(() => {
    const tryReveal = async () => {
      if (code.length === 6 && !isRevealed && !isDecrypting && passcodeHash) {

        // Nice try, but no. You got to know the code.
        const hash = await hashCode(code);
        if (hash === passcodeHash) {
          setIsDecrypting(true);
          setInvalid(false);
          
          // Start cycling through decryption messages
          let messageIndex = 0;
          setCurrentMessage(DECRYPTION_MESSAGES[0]);
          
          const messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % DECRYPTION_MESSAGES.length;
            setCurrentMessage(DECRYPTION_MESSAGES[messageIndex]);
          }, 2000);

          const key = await deriveKey(code);

          try {
            const text = (await loadAndDecryptAsset("/encoded-text.enc", key, true)) as string;
            const imageBuffer = (await loadAndDecryptAsset("/encoded-image.enc", key)) as ArrayBuffer;
            const imageBase64 = arrayBufferToBase64(imageBuffer);
            const imageUrl = `data:image/jpeg;base64,${imageBase64}`;
            setImageUrl(imageUrl);

            const imageTileBuffer = (await loadAndDecryptAsset("/encoded-image-tile.enc", key)) as ArrayBuffer;
            const imageTileBase64 = arrayBufferToBase64(imageTileBuffer);
            const tileUrl = `data:image/jpeg;base64,${imageTileBase64}`;
            setImageTileUrl(tileUrl);

            const audioBuffer = (await loadAndDecryptAsset("/encoded-audio.enc", key)) as ArrayBuffer;
            const audioBlob = new Blob([audioBuffer], { type: "audio/mp3" });
            const audioObjectUrl = URL.createObjectURL(audioBlob);
            setAudioUrl(audioObjectUrl);

            // Stop message cycling and reveal content
            clearInterval(messageInterval);
            setIsDecrypting(false);
            setIsRevealed(true);
            setShowConfetti(true);
            animateText(text);
          } catch (err) {
            console.error("Decryption failed:", err);
            clearInterval(messageInterval);
            setIsDecrypting(false);
            setInvalid(true);
          }
        } else {
          setInvalid(true);
        }
      }
    };

    tryReveal();
  }, [code, isRevealed, isDecrypting, passcodeHash]);


  const animateText = (text: string) => {
    let index = 0;
    const interval = setInterval(() => {
      setRevealedText(text.substring(0, index + 1));
      index++;
      if (index >= text.length) clearInterval(interval);
    }, 100);
  };

  const resetApp = () => {
    setCode("");
    setIsRevealed(false);
    setIsDecrypting(false);
    setRevealedText("");
    setInvalid(false);
    setShowConfetti(false);
    setCurrentMessage("");
    setAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setImageUrl(null);
    setImageTileUrl(null);
  };

  if (isRevealed && imageUrl && imageTileUrl && audioUrl) {
    return (
      <SuccessScreen
        revealedText={revealedText}
        imageUrl={imageUrl}
        imageTileUrl={imageTileUrl}
        audioUrl={audioUrl}
        onReset={resetApp}
        showConfetti={showConfetti}
      />
    );
  }

  return (
    <StartScreen
      code={code}
      setCode={setCode}
      invalid={invalid}
      isDecrypting={isDecrypting}
      currentMessage={currentMessage}
    />
  );
};

export default Index;
