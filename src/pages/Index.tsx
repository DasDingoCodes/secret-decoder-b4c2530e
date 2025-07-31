import { useState, useEffect } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

// Security: Only store hashed passcode and encoded assets
const PASSCODE_HASH = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92"; // hash of "123456"
const ENCODED_IMAGE = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="; // placeholder
const ENCODED_AUDIO = ""; // placeholder for audio
const ENCODED_TEXT = "VEhFIEFOQ0lFTlQgV0lTRE9NIEhBUyBCRUVOIFVOTE9DS0VE"; // base64 of "THE ANCIENT WISDOM HAS BEEN UNLOCKED"

// Utility functions for security
const hashCode = async (code: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const decodeAssets = () => {
  const secretMessage = atob(ENCODED_TEXT);
  const imageDataUrl = `data:image/jpeg;base64,${ENCODED_IMAGE}`;
  return { secretMessage, imageDataUrl };
};

const Index = () => {
  const [code, setCode] = useState("");
  const [isRevealed, setIsRevealed] = useState(false);
  const [revealedText, setRevealedText] = useState("");
  const [showBackground, setShowBackground] = useState(false);

  useEffect(() => {
    const checkCode = async () => {
      if (code.length === 6 && !isRevealed) {
        const inputHash = await hashCode(code);
        if (inputHash === PASSCODE_HASH) {
          setIsRevealed(true);
          // Start the reveal sequence
          setTimeout(() => setShowBackground(true), 500);
          setTimeout(() => animateText(), 1000);
        }
      }
    };
    
    checkCode();
  }, [code, isRevealed]);

  const animateText = () => {
    const { secretMessage } = decodeAssets();
    let index = 0;
    const interval = setInterval(() => {
      setRevealedText(secretMessage.substring(0, index + 1));
      index++;
      if (index >= secretMessage.length) {
        clearInterval(interval);
      }
    }, 100);
  };

  const resetApp = () => {
    setCode("");
    setIsRevealed(false);
    setRevealedText("");
    setShowBackground(false);
  };

  if (isRevealed) {
    const { imageDataUrl } = decodeAssets();
    
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background image with fade-in animation */}
        <div 
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            showBackground ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(${imageDataUrl})` }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        {/* Revealed content */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-white px-4">
          <div className="text-center animate-fade-in">
            <h1 className="text-6xl font-bold mb-8 animate-scale-in text-yellow-300 drop-shadow-lg">
              SUCCESS!
            </h1>
            <div className="text-2xl font-mono tracking-wider mb-8 h-8">
              {revealedText}
              {revealedText.length < decodeAssets().secretMessage.length && (
                <span className="animate-pulse">|</span>
              )}
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
        <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-lg">
          Secret Decoder
        </h1>
        <p className="text-lg text-white/80 mb-8">
          Enter the 6-digit code to unlock the secret
        </p>
        
        {/* Custom styled OTP input */}
        <div className="mb-8">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={setCode}
            className="gap-3"
          >
            <InputOTPGroup className="gap-3">
              {[...Array(6)].map((_, index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  className="w-16 h-16 text-2xl font-bold bg-white border-2 border-white/30 rounded-xl shadow-lg hover:border-white/50 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 transition-all duration-200 text-slate-800"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {code.length === 6 && !isRevealed && (
          <p className="text-red-400 animate-fade-in">
            Incorrect code. Try again.
          </p>
        )}
        
        <p className="text-sm text-white/60 mt-4">
          Hint: The code starts with 123...
        </p>
      </div>
    </div>
  );
};

export default Index;
