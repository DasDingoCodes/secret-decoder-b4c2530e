import React from "react"
import { useEffect, useState, useRef } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Volume2, VolumeX } from "lucide-react";
import ConfettiEffect from "@/components/ConfettiEffect";

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
  const [imageTileUrl, setImageTileUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.25); // 25%
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showBackground, setShowBackground] = useState(false);
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
      if (code.length === 6 && !isRevealed && passcodeHash) {
        const hash = await hashCode(code);
        if (hash === passcodeHash) {
          setIsRevealed(true);
          setInvalid(false);
          setShowConfetti(true);

          const key = await deriveKey(code);

          try {
            const text = (await loadAndDecryptAsset("/encoded-text.enc", key, true)) as string;
            const imageBuffer = (await loadAndDecryptAsset("/encoded-image.enc", key)) as ArrayBuffer;
            const imageBase64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
            const imageUrl = `data:image/jpeg;base64,${imageBase64}`;
            setImageUrl(imageUrl);

            const imageTileBuffer = (await loadAndDecryptAsset("/encoded-image-tile.enc", key)) as ArrayBuffer;
            const imageTileBase64 = btoa(String.fromCharCode(...new Uint8Array(imageTileBuffer)));
            const tileUrl = `data:image/jpeg;base64,${imageTileBase64}`;
            setImageTileUrl(tileUrl);

            const audioBuffer = (await loadAndDecryptAsset("/encoded-audio.enc", key)) as ArrayBuffer;
            const audioBlob = new Blob([audioBuffer], { type: "audio/mp3" });
            const audioObjectUrl = URL.createObjectURL(audioBlob);
            setAudioUrl(audioObjectUrl);

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

  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.volume = volume;
      audio.muted = isMuted;
      audio.loop = true;
      audioRef.current = audio;

      audio.play().catch((err) => {
        console.error("Audio playback failed:", err);
      });
    }
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const animateText = (text: string) => {
    let index = 0;
    const interval = setInterval(() => {
      setRevealedText(text.substring(0, index + 1));
      index++;
      if (index >= text.length) clearInterval(interval);
    }, 100);
  };

  const resetApp = () => {
    if (audioRef.current) {
      const fadeOut = () => {
        const fadeInterval = setInterval(() => {
          if (audioRef.current && audioRef.current.volume > 0.05) {
            audioRef.current.volume = Math.max(0, audioRef.current.volume - 0.05);
          } else {
            clearInterval(fadeInterval);
            audioRef.current?.pause();
            audioRef.current = null;
          }
        }, 100);
      };
      fadeOut();
    }

    setCode("");
    setIsRevealed(false);
    setRevealedText("");
    setShowBackground(false);
    setInvalid(false);
    setShowConfetti(false);
    setAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  if (isRevealed && imageUrl && imageTileUrl) {
    return (
      <div className="min-h-screen relative bg-white flex items-center justify-center overflow-hidden">
        {/* Subtle tiled background (hidden on mobile) */}
        <div
          className="absolute inset-0 bg-repeat bg-center opacity-60 md:block hidden"
          style={{ backgroundImage: `url(${imageTileUrl})` }}
        />
        {/* White overlay to make background more subtle */}
        <div className="absolute inset-0 bg-white/80 md:block hidden" />

        {/* Center content panel */}
        <div className="relative z-10 w-full max-w-3xl min-h-screen flex items-center justify-center shadow-2xl shadow-black/20 overflow-hidden bg-white">
          {/* Background image with soft gradient mask */}
          <div
            className="absolute inset-0 bg-center bg-no-repeat bg-cover pointer-events-none"
            style={{
              backgroundImage: `url(${imageUrl})`,
              maskImage:
                "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
            }}
          >
            <div className="absolute inset-0 bg-white/60" />
          </div>

          {/* Foreground content */}
          <div className="relative z-10 flex flex-col justify-between items-center text-center px-6 py-12 w-full max-w-3xl h-full min-h-screen">

            {/* Title at Top */}
            <div className="w-full">
              <h1 className="text-6xl font-bold mb-8 animate-scale-in text-yellow-600 drop-shadow-lg">
                SUCCESS!
              </h1>
            </div>

            {/* Expanding Text Area (stretches between title and controls) */}
            <div className="flex-1 overflow-y-auto w-full">
              <div className="text-xl font-mono tracking-wide text-slate-800 space-y-4 text-left max-w-xl mx-auto leading-relaxed">
                {revealedText.split("\n\n").map((para, i) => (
                  <p key={i}>
                    {para.split("\n").map((line, j) => (
                      <React.Fragment key={j}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </p>
                ))}
              </div>
            </div>

            {/* Controls at Bottom */}
            <div className="w-full mt-12 pt-8 border-t border-slate-300 flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4">

              <button
                onClick={resetApp}
                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-xl transition duration-200 shadow"
              >
                Try Again
              </button>

              <div className="flex items-center gap-4">
                {/* Icon button for mute */}
                <button
                  onClick={() => setIsMuted((prev) => !prev)}
                  className="w-10 h-10 flex items-center justify-center bg-slate-700 hover:bg-slate-800 text-white rounded-full shadow transition"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>


                {/* Volume slider */}
                <div className="flex items-center gap-2">
                  <label htmlFor="volume" className="text-slate-700 font-medium">Volume</label>
                  <input
                    id="volume"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-40 h-2 rounded-full bg-slate-200 appearance-none accent-yellow-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        <ConfettiEffect trigger={showConfetti} />
      </div>
    );
  }




  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl">
        <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-lg">7.5) Secret Decoder</h1>

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

      </div>
    </div>
  );
};

export default Index;
