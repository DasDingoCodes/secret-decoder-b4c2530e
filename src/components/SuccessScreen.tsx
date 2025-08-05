import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import ConfettiEffect from "@/components/ConfettiEffect";

interface SuccessScreenProps {
  revealedText: string;
  imageUrl: string;
  imageTileUrl: string;
  audioUrl: string;
  onReset: () => void;
  showConfetti: boolean;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({
  revealedText,
  imageUrl,
  imageTileUrl,
  audioUrl,
  onReset,
  showConfetti
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.25);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const handleReset = () => {
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
    onReset();
  };

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
              onClick={handleReset}
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
};

export default SuccessScreen;