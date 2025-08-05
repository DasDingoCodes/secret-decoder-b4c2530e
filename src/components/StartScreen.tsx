import React from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface StartScreenProps {
  code: string;
  setCode: (code: string) => void;
  invalid: boolean;
  isDecrypting: boolean;
  currentMessage: string;
}

const StartScreen: React.FC<StartScreenProps> = ({ 
  code, 
  setCode, 
  invalid, 
  isDecrypting, 
  currentMessage 
}) => {
  if (isDecrypting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl max-w-md mx-4">
          <div className="mb-6">
            <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Decrypting...</h2>
            <p className="text-white/80 text-lg min-h-[1.5rem]">{currentMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="text-center p-4 sm:p-6 md:p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl w-full max-w-sm sm:max-w-md">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-white drop-shadow-lg">7.5) Secret Decoder</h1>
        <p className="text-lg text-white/80 mb-6 sm:mb-8"></p>

        <div className="mb-6 sm:mb-8 flex justify-center">
          <InputOTP maxLength={6} value={code} onChange={setCode} className="gap-1 sm:gap-2">
            <InputOTPGroup className="gap-1 sm:gap-2">
              {[...Array(6)].map((_, i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-lg sm:text-xl md:text-2xl font-bold bg-white border-2 border-white/30 rounded-lg sm:rounded-xl shadow-lg hover:border-white/50 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 transition-all duration-200 text-slate-800"
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

export default StartScreen;