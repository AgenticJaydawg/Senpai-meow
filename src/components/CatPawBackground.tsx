import React from 'react';

export default function CatPawBackground() {
  // A standard cute paw print path
  const PawPath = () => (
    <svg
      viewBox="0 0 100 100"
      className="w-24 h-24 text-primary fill-current cat-paw-opacity pointer-events-none select-none"
    >
      {/* Big pad */}
      <path d="M50 50 C40 50, 30 55, 30 65 C30 75, 40 85, 50 85 C60 85, 70 75, 70 65 C70 55, 60 50, 50 50 Z" />
      {/* Toes */}
      <circle cx="28" cy="40" r="10" />
      <circle cx="42" cy="28" r="11" />
      <circle cx="58" cy="28" r="11" />
      <circle cx="72" cy="40" r="10" />
    </svg>
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Paw 1: Top Left */}
      <div className="absolute top-10 left-[5%] transform -rotate-12 animate-float-slow opacity-[0.03]">
        <PawPath />
      </div>
      
      {/* Paw 2: Top Right */}
      <div className="absolute top-24 right-[8%] transform rotate-45 animate-float-slower opacity-[0.02]">
        <PawPath />
      </div>

      {/* Paw 3: Mid Left */}
      <div className="absolute top-[45%] left-[2%] transform rotate-15 animate-float-slower opacity-[0.03]">
        <PawPath />
      </div>

      {/* Paw 4: Mid Right */}
      <div className="absolute top-[60%] right-[4%] transform -rotate-45 animate-float-slow opacity-[0.04]">
        <PawPath />
      </div>

      {/* Paw 5: Bottom Left */}
      <div className="absolute bottom-12 left-[10%] transform rotate-12 animate-float-slow opacity-[0.03]">
        <PawPath />
      </div>

      {/* Paw 6: Bottom Right */}
      <div className="absolute bottom-24 right-[15%] transform -rotate-12 animate-float-slower opacity-[0.02]">
        <PawPath />
      </div>
    </div>
  );
}
