import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

const scrambleChars = '@#$%*01XY<>{}[]+=';

const GlitchText = ({ text = "SYSTEM OVERRIDE", className = "" }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);

  const [displayText, setDisplayText] = useState(text);
  const timelineRef = useRef(null);
  const scrambleIntervalRef = useRef(null);

  const triggerGlitch = () => {
    if (timelineRef.current && timelineRef.current.isActive()) return;

    let iteration = 0;
    clearInterval(scrambleIntervalRef.current);

    scrambleIntervalRef.current = setInterval(() => {
      setDisplayText((prev) =>
        prev.split('').map((char, index) => {
          if (index < iteration) {
            return text[index];
          }
          if (text[index] === ' ') return ' ';
          return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        }).join('')
      );

      iteration += 1 / 2;

      if (iteration >= text.length) {
        clearInterval(scrambleIntervalRef.current);
        setDisplayText(text);
      }
    }, 30);
    timelineRef.current = gsap.timeline({
      onComplete: () => {
        gsap.set(textRef.current, {
          x: 0, y: 0, skewX: 0, clipPath: 'inset(0% 0% 0% 0%)', textShadow: 'none', opacity: 0
        });
      }
    });

    const duration = 0.35;
    const frames = 12;
    const timePerFrame = duration / frames;

    timelineRef.current.set(textRef.current, { opacity: 1 });

    for (let i = 0; i < frames; i++) {
      const top1 = Math.random() * 80;
      const bot1 = Math.random() * (100 - top1);

      const xOffsetRed = (Math.random() - 0.5) * 15 - 3;
      const xOffsetBlue = (Math.random() - 0.5) * 15 + 3;
      timelineRef.current.to(textRef.current, {
        x: (Math.random() - 0.5) * 15,
        y: (Math.random() - 0.5) * 6,
        skewX: (Math.random() - 0.5) * 20,
        clipPath: `inset(${top1}% 0% ${bot1}% 0%)`,
        textShadow: `${xOffsetRed}px 0 0 #ff0000, ${xOffsetBlue}px 0 0 #0000ff`,
        duration: timePerFrame,
        ease: 'steps(1)'
      }, i * timePerFrame);
    }
  };

  useEffect(() => {
    triggerGlitch();

    return () => {
      if (timelineRef.current) timelineRef.current.kill();
      clearInterval(scrambleIntervalRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative inline-block cursor-crosshair font-black uppercase text-white bg-[#050508] tracking-widest ${className}`}
      onMouseEnter={triggerGlitch}
    >
      <span className="relative block opacity-60 z-0">
        {displayText}
      </span>

      <span
        ref={textRef}
        className="absolute top-0 left-0 w-full h-full block mix-blend-screen pointer-events-none select-none z-10"
        aria-hidden="true"
      >
        {displayText}
      </span>
    </div>
  );
};

export default GlitchText;
