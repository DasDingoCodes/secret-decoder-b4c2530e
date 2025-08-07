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
  "#FFE066", "#F4E4BC", "#FFEAA7", "#FFD700", "#FFFFFF", 
  "#FFF8DC", "#FFFACD", "#FFB6C1", "#FFCCCB", "#FFB3BA",
  "#FF91A4", "#FF6B6B", "#FF7F7F", "#FFEFD5", "#FFEBCD"
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
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: Math.random(),
        x: -10,
        y: window.innerHeight * 0.7,
        vx: Math.random() * 10 + 5,
        vy: -(Math.random() * 20 + 15),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 8,
        size: Math.random() * 10 + 4
      });
    }

    // Right cannon
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: Math.random(),
        x: window.innerWidth + 10,
        y: window.innerHeight * 0.7,
        vx: -(Math.random() * 10 + 5),
        vy: -(Math.random() * 20 + 15),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 8,
        size: Math.random() * 10 + 4
      });
    }

    setParticles(newParticles);
    animateParticles(newParticles);
  };

  const animateParticles = (initialParticles: Particle[]) => {
    let animationParticles = [...initialParticles];
    const gravity = 0.4;
    const airResistance = 0.98;
    const floatAmplitude = 2;

    const animate = () => {
      animationParticles = animationParticles.map((particle, index) => {
        let newVx = particle.vx * airResistance;
        let newVy = particle.vy + gravity;
        
        // Add gentle swaying motion when falling (after reaching peak)
        if (particle.vy > 0) {
          newVx += Math.sin(Date.now() * 0.003 + index) * 0.1;
          newVy *= 0.95; // Slower falling for floating effect
        }
        
        return {
          ...particle,
          x: particle.x + newVx,
          y: particle.y + newVy,
          vx: newVx,
          vy: newVy,
          rotation: particle.rotation + particle.rotationSpeed * 0.8
        };
      }).filter(particle => 
        particle.y < window.innerHeight + 100 && 
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