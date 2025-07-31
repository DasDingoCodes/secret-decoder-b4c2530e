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
  "#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", 
  "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE"
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
    
    // Left cannon
    for (let i = 0; i < 25; i++) {
      newParticles.push({
        id: Math.random(),
        x: -10,
        y: window.innerHeight * 0.7,
        vx: Math.random() * 8 + 4,
        vy: -(Math.random() * 15 + 10),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 10,
        size: Math.random() * 8 + 4
      });
    }

    // Right cannon
    for (let i = 0; i < 25; i++) {
      newParticles.push({
        id: Math.random(),
        x: window.innerWidth + 10,
        y: window.innerHeight * 0.7,
        vx: -(Math.random() * 8 + 4),
        vy: -(Math.random() * 15 + 10),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 10,
        size: Math.random() * 8 + 4
      });
    }

    setParticles(newParticles);
    animateParticles(newParticles);
  };

  const animateParticles = (initialParticles: Particle[]) => {
    let animationParticles = [...initialParticles];
    const gravity = 0.3;
    const airResistance = 0.99;

    const animate = () => {
      animationParticles = animationParticles.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vx: particle.vx * airResistance,
        vy: particle.vy + gravity,
        rotation: particle.rotation + particle.rotationSpeed
      })).filter(particle => 
        particle.y < window.innerHeight + 50 && 
        particle.x > -50 && 
        particle.x < window.innerWidth + 50
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