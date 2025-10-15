"use client";
import React, { useEffect, useState } from 'react';

interface ShootingStarBackgroundProps {
  className?: string;
}

interface Star {
  id: number;
  tailLength: number;
  topOffset: number;
  fallDuration: number;
  fallDelay: number;
}

export default function ShootingStarBackground({ 
  className = "" 
}: ShootingStarBackgroundProps) {
  const [stars, setStars] = useState<Star[]>([]);
  const starCount = 50;

  const randomRange = (min: number, max: number): number => {
    return min + Math.floor(Math.random() * ((max - min) + 1));
  };

  useEffect(() => {
    const generateStars = () => {
      const newStars: Star[] = [];
      
      for (let i = 1; i <= starCount; i++) {
        newStars.push({
          id: i,
          tailLength: randomRange(500, 750) / 100,
          topOffset: randomRange(0, 10000) / 100,
          fallDuration: randomRange(6000, 12000) / 1000,
          fallDelay: randomRange(0, 10000) / 1000,
        });
      }
      
      setStars(newStars);
    };

    generateStars();
  }, []);

  return (
    <>
      <style jsx global>{`
        .shooting-star-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          pointer-events: none;
          z-index: -1;
          background: radial-gradient(ellipse at bottom, #0d1d31 0%, #0c0d13 100%);
        }
        
        .stars {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 120%;
          transform: rotate(-45deg);
        }
        
        .star {
          position: absolute;
          left: 0;
          height: 2px;
          color: #ff6b6b;
          background: linear-gradient(45deg, currentColor, transparent);
          border-radius: 50%;
          filter: drop-shadow(0 0 6px currentColor);
          transform: translate3d(104em, 0, 0);
          animation: fall var(--fall-duration) var(--fall-delay) linear infinite, tail-fade var(--tail-fade-duration) var(--fall-delay) ease-out infinite;
        }
        
        .star::before, .star::after {
          position: absolute;
          content: '';
          top: 0;
          left: calc(var(--star-width) / -2);
          width: var(--star-width);
          height: 100%;
          background: linear-gradient(45deg, transparent, currentColor, transparent);
          border-radius: inherit;
          animation: blink 2s linear infinite;
        }
        
        .star::before {
          transform: rotate(45deg);
        }
        
        .star::after {
          transform: rotate(-45deg);
        }
        
        @keyframes fall {
          to {
            transform: translate3d(-30em, 0, 0);
          }
        }
        
        @keyframes tail-fade {
          0%, 50% {
            width: var(--star-tail-length);
            opacity: 1;
          }
          70%, 80% {
            width: 0;
            opacity: 0.4;
          }
          100% {
            width: 0;
            opacity: 0;
          }
        }
        
        @keyframes blink {
          50% {
            opacity: 0.6;
          }
        }
        
        @media screen and (max-width: 750px) {
          .star {
            animation: fall var(--fall-duration) var(--fall-delay) linear infinite;
          }
        }
      `}</style>
      
      <div className={`shooting-star-bg ${className}`}>
        <div className="stars">
          {stars.map((star) => (
            <div
              key={star.id}
              className="star"
              style={{
                '--star-tail-length': `${star.tailLength}em`,
                '--star-tail-height': '2px',
                '--star-width': `${star.tailLength / 6}em`,
                '--fall-duration': `${star.fallDuration}s`,
                '--tail-fade-duration': `${star.fallDuration}s`,
                '--top-offset': `${star.topOffset}vh`,
                '--fall-delay': `${star.fallDelay}s`,
                top: `var(--top-offset)`,
                width: `var(--star-tail-length)`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      </div>
    </>
  );
}
