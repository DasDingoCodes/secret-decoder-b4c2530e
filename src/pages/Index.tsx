import { useEffect, useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

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
  const encryptedData = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return crypto.subtle.decrypt({ name: "AES-CBC", iv }, key, encryptedData);
};

const loadAndDecryptAsset = async (url: string, key: CryptoKey, asText = false): Promise<string | ArrayBuffer> => {
  const response = await fetch(url);
  const encText = await response.text();
  const decryptedBuffer = await decryptData(encText, key);
  return asText ? new TextDecoder("utf-8").decode(decryptedBuffer) : decryptedBuffer;
};

const Index = () => {
  const [code, setCode] = useState("");
  const [isRevealed, setIsRevealed] = useState(false);
  const [revealedText, setRevealedText] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showBackground, setShowBackground] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [passcodeHash, setPasscodeHash] = useState<string | null>(null);

  // Load hash from file on first render
  useEffect(() => {
    const loadHash = async () => {
      try {
        const res = await fetch("/src/assets/passcode-hash.txt");
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
      if (code.length === 6 && !isRevealed && passcodeHash) {
        const hash = await hashCode(code);
        if (hash === passcodeHash) {
          setIsRevealed(true);
          setInvalid(false);

          const key = await deriveKey(code);

          try {
            const text = (await loadAndDecryptAsset("/src/assets/encoded-text.enc", key, true)) as string;
            const imageBuffer = (await loadAndDecryptAsset("/src/assets/encoded-image.enc", key)) as ArrayBuffer;
            const imageBase64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
            const imageUrl = `data:image/jpeg;base64,${imageBase64}`;
            setImageUrl(imageUrl);

            setTimeout(() => setShowBackground(true), 500);
            animateText(text);
          } catch (err) {
            console.error("Decryption failed:", err);
            setIsRevealed(false);
            setInvalid(true);
          }
        } else {
          setInvalid(true);
        }
      }
    };

    tryReveal();
  }, [code, isRevealed, passcodeHash]);

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
    setRevealedText("");
    setShowBackground(false);
    setInvalid(false);
  };

  if (isRevealed && imageUrl) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            showBackground ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${imageUrl})` }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-white px-4">
          <div className="text-center animate-fade-in">
            <h1 className="text-6xl font-bold mb-8 animate-scale-in text-yellow-300 drop-shadow-lg">
              SUCCESS!
            </h1>
            <div className="text-2xl font-mono tracking-wider mb-8 h-8">
              {revealedText}
              {revealedText.length < revealedText.length && <span className="animate-pulse">|</span>}
            </div>
            <button
              onClick={resetApp}
              className="mt-8 px-8 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl">
        <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-lg">Secret Decoder</h1>
        <p className="text-lg text-white/80 mb-8">Enter the 6-digit code to unlock the secret</p>

        <div className="mb-8">
          <InputOTP maxLength={6} value={code} onChange={setCode} className="gap-3">
            <InputOTPGroup className="gap-3">
              {[...Array(6)].map((_, i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="w-16 h-16 text-2xl font-bold bg-white border-2 border-white/30 rounded-xl shadow-lg hover:border-white/50 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 transition-all duration-200 text-slate-800"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {invalid && <p className="text-red-400 animate-fade-in">Incorrect code. Try again.</p>}

        <p className="text-sm text-white/60 mt-4">Hint: The code starts with 123...</p>
      </div>
    </div>
  );
};

export default Index;
