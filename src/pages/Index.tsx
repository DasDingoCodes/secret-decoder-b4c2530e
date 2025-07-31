import { useState, useEffect } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import secretBackground from "@/assets/secret-background.jpg";

const CORRECT_CODE = "123456";
const SECRET_MESSAGE = "THE ANCIENT WISDOM HAS BEEN UNLOCKED";

const Index = () => {
  const [code, setCode] = useState("");
  const [isRevealed, setIsRevealed] = useState(false);
  const [revealedText, setRevealedText] = useState("");
  const [showBackground, setShowBackground] = useState(false);

  useEffect(() => {
    if (code === CORRECT_CODE && !isRevealed) {
      setIsRevealed(true);
      // Start the reveal sequence
      setTimeout(() => setShowBackground(true), 500);
      setTimeout(() => animateText(), 1000);
    }
  }, [code, isRevealed]);

  const animateText = () => {
    let index = 0;
    const interval = setInterval(() => {
      setRevealedText(SECRET_MESSAGE.substring(0, index + 1));
      index++;
      if (index >= SECRET_MESSAGE.length) {
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
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background image with fade-in animation */}
        <div 
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            showBackground ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(${secretBackground})` }}
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
              {revealedText.length < SECRET_MESSAGE.length && (
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

        {code.length > 0 && code !== CORRECT_CODE && code.length === 6 && (
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
