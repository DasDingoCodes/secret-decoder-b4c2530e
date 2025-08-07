import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  size: number;
}

interface ConfettiEffectProps {
  trigger: boolean;
  onComplete?: () => void;
}

const colors = [
  "#ff9f9fff", "#fff6a0ff", "#b8ee8bff", "#ffd595ff", "#b4e2cdff", 
  "#ffedb4ff", "#a0ddc1ff", "#adddb9ff", "#f1dc84ff", "#a1cea5ff"
];

const ConfettiEffect = ({ trigger, onComplete }: ConfettiEffectProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true);
      createParticles();
    }
  }, [trigger, isActive]);

  const createParticles = () => {
    const newParticles: Particle[] = [];
    
    // Create particles across the top of the screen
    for (let i = 0; i < 40; i++) {
      newParticles.push({
        id: Math.random(),
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * 100, // Start above screen with staggered timing
        vx: (Math.random() - 0.5) * 2, // Gentle horizontal drift
        vy: Math.random() * 2 + 1, // Slow downward fall
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 4,
        size: Math.random() * 10 + 6
      });
    }

    setParticles(newParticles);
    animateParticles(newParticles);
  };

  const animateParticles = (initialParticles: Particle[]) => {
    let animationParticles = [...initialParticles];
    let time = 0;

    const animate = () => {
      time += 0.02;
      
      animationParticles = animationParticles.map(particle => ({
        ...particle,
        x: particle.x + particle.vx + Math.sin(time + particle.id) * 0.5, // Swaying motion
        y: particle.y + particle.vy,
        vx: particle.vx * 0.998, // Very gentle air resistance
        vy: Math.min(particle.vy + 0.02, 3), // Gentle gravity with terminal velocity
        rotation: particle.rotation + particle.rotationSpeed
      })).filter(particle => 
        particle.y < window.innerHeight + 50 && 
        particle.x > -100 && 
        particle.x < window.innerWidth + 100
      );

      setParticles([...animationParticles]);

      if (animationParticles.length > 0) {
        requestAnimationFrame(animate);
      } else {
        setIsActive(false);
        onComplete?.();
      }
    };

    requestAnimationFrame(animate);
  };

  if (!isActive && particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
            transform: `rotate(${particle.rotation}deg)`,
            boxShadow: `0 0 6px ${particle.color}40`
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiEffect;