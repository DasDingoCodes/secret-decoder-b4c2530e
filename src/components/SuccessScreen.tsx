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

const AnimatedTitle: React.FC<{
  text: string;
  onDone: () => void;
}> = ({ text, onDone }) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onDone();
    }, text.length * 250); // 0.25s per char

    return () => clearTimeout(timeout);
  }, [text, onDone]);

  return (
    <h1 className="text-5xl font-handwritten text-yellow-600 drop-shadow-lg leading-tight flex flex-wrap justify-center whitespace-pre-wrap mb-8">
      {[...text].map((char, index) => (
        <span
          key={index}
          className="inline-block opacity-0 animate-fadeInLetter"
          style={{ animationDelay: `${index * 0.25}s` }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </h1>
  );
};

const AnimatedParagraph: React.FC<{ text: string; startDelay: number }> = ({ text, startDelay }) => {
  const words = text.split(" ");
  return (
    <p className="mb-6 leading-relaxed whitespace-pre-wrap break-words">
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block mr-1 align-bottom">
          {[...word].map((char, charIndex) => {
            const index = wordIndex * 5 + charIndex; // Estimate a delay index
            return (
              <span
                key={charIndex}
                className="inline-block opacity-0 animate-fadeInLetter"
                style={{ animationDelay: `${startDelay + index * 0.025}s` }}
              >
                {char}
              </span>
            );
          })}
          {/* Add space after each word */}
          <span
            className="inline-block opacity-0 animate-fadeInLetter"
            style={{ animationDelay: `${startDelay + (wordIndex + 1) * 5 * 0.025}s` }}
          >
            {"\u00A0"}
          </span>
        </span>
      ))}
    </p>
  );
};

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
  const [titleDone, setTitleDone] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const firstLine = revealedText.split("\n")[0];
  const restOfText = revealedText.split("\n").slice(1).join("\n");

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
      <div
        className="absolute inset-0 bg-repeat bg-center opacity-60 md:block hidden"
        style={{ backgroundImage: `url(${imageTileUrl})` }}
      />
      <div className="absolute inset-0 bg-white/80 md:block hidden" />

      <div className="relative z-10 w-full max-w-3xl min-h-screen flex items-center justify-center shadow-2xl shadow-black/20 overflow-hidden bg-white">
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-cover pointer-events-none"
          style={{
            backgroundImage: `url(${imageUrl})`,
            maskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
          }}
        >
          <div className="absolute inset-0 bg-white/60" />
        </div>

        <div className="relative z-10 flex flex-col justify-between items-center text-center px-6 py-12 w-full max-w-3xl h-full min-h-screen">
          {/* Animated Title */}
          <AnimatedTitle text={firstLine} onDone={() => setTitleDone(true)} />

          {/* Animated Paragraphs */}
            <div className="flex-1 overflow-y-auto w-full">
            {titleDone && (
              <div className="text-xl font-mono tracking-wide text-slate-800 text-left max-w-xl mx-auto leading-relaxed whitespace-pre-wrap">
                {restOfText
                  .split("\n\n")
                  .filter((para) => para.trim() !== "")
                  .map((para, i) => (
                    <AnimatedParagraph key={i} text={para} startDelay={firstLine.length * 0.25 + i * 0.5} />
                  ))}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="w-full mt-12 pt-8 border-t border-slate-300 flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4">
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-xl transition duration-200 shadow"
            >
              Try Again
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMuted((prev) => !prev)}
                className="w-10 h-10 flex items-center justify-center bg-slate-700 hover:bg-slate-800 text-white rounded-full shadow transition"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

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
