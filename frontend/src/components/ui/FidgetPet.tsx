import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import { Heart, Sparkles, Star, Ghost, Cat, Rabbit } from 'lucide-react';

type PetType = 'rabbit' | 'cat' | 'ghost';

interface Particle {
  x: number;
  y: number;
  rotate: number;
  type: number;
}

export const FidgetPet: React.FC = () => {
  const constraintsRef = useRef(null);
  const [petType, setPetType] = useState<PetType>('rabbit');
  const [isHappy, setIsHappy] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  const togglePet = () => {
    const types: PetType[] = ['rabbit', 'cat', 'ghost'];
    const nextIndex = (types.indexOf(petType) + 1) % types.length;
    setPetType(types[nextIndex]);
    triggerHappiness();
  };

  const triggerHappiness = () => {
    const newParticles = [...Array(6)].map(() => ({
      x: (Math.random() - 0.5) * 120,
      y: (Math.random() - 0.5) * 120 - 40,
      rotate: Math.random() * 360,
      type: Math.floor(Math.random() * 3)
    }));
    setParticles(newParticles);
    setIsHappy(true);
    // Extra visual feedback like haptic if available, but here we just use sound-like visual
    setTimeout(() => {
      setIsHappy(false);
      setParticles([]);
    }, 800);
  };

  const getPetIcon = () => {
    switch (petType) {
      case 'rabbit': return <Rabbit className="w-8 h-8" />;
      case 'cat': return <Cat className="w-8 h-8" />;
      case 'ghost': return <Ghost className="w-8 h-8" />;
    }
  };

  const getPetColor = () => {
    switch (petType) {
      case 'rabbit': return 'from-pink-400 to-rose-400';
      case 'cat': return 'from-amber-400 to-orange-400';
      case 'ghost': return 'from-blue-300 to-indigo-300';
    }
  };

  return (
    <div ref={constraintsRef} className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      <div className="absolute bottom-28 right-6 pointer-events-auto">
        <motion.div
          drag
          dragConstraints={constraintsRef}
          dragElastic={0.1}
          dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
          whileDrag={{ scale: 1.2, cursor: 'grabbing', rotate: 10 }}
          whileTap={{ scale: 0.8 }}
          onTap={triggerHappiness}
          onDoubleClick={togglePet}
          className="relative cursor-grab active:cursor-grabbing"
        >
          {/* Pet Base with Squash and Stretch */}
          <motion.div
            animate={{
              y: isHappy ? [0, -40, 0] : [0, -15, 0],
              scaleX: isHappy ? [1, 1.4, 0.8, 1] : [1, 1.05, 1],
              scaleY: isHappy ? [1, 0.6, 1.3, 1] : [1, 0.95, 1],
              rotate: isHappy ? [0, 15, -15, 0] : [0, -3, 3, 0]
            }}
            transition={{
              duration: isHappy ? 0.4 : 3,
              repeat: isHappy ? 0 : Infinity,
              ease: "easeInOut"
            }}
            className={cn(
              "w-18 h-18 rounded-[28px] flex items-center justify-center text-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] relative",
              "bg-linear-to-br ring-4 ring-white/30 backdrop-blur-sm",
              getPetColor()
            )}
          >
            {/* Crown/Ear Accessory */}
            <motion.div 
              animate={{ y: [0, -5, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-4 text-amber-300 drop-shadow-md"
            >
              <Star className="w-6 h-6 fill-amber-300" />
            </motion.div>

            {/* Explosive Particles on click */}
            <AnimatePresence>
              {isHappy && (
                <>
                  {particles.map((p, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                      animate={{ 
                        scale: [0, 1.5, 0], 
                        opacity: [0, 1, 0], 
                        x: p.x, 
                        y: p.y,
                        rotate: p.rotate
                      }}
                      className="absolute pointer-events-none"
                    >
                      {p.type === 0 ? <Heart className="w-5 h-5 fill-white text-white" /> : 
                       p.type === 1 ? <Sparkles className="w-6 h-6 text-amber-200" /> : 
                       <Star className="w-4 h-4 text-white fill-white" />}
                    </motion.div>
                  ))}
                </>
              )}
            </AnimatePresence>

            {/* Inner glow effect */}
            <div className="absolute inset-0 rounded-[28px] overflow-hidden">
               <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-white/20 rotate-45" />
            </div>
            
            {/* Pet Face */}
            <div className="relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform">
              {getPetIcon()}
            </div>

            {/* More Expressive Eyes */}
            <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center gap-3">
               <motion.div 
                 animate={isHappy ? { height: [6, 2, 6], scaleX: 1.5 } : { height: [6, 6, 1, 6] }} 
                 transition={{ duration: isHappy ? 0.2 : 4, repeat: Infinity, repeatDelay: isHappy ? 0 : 3 }}
                 className="w-2 h-2 bg-slate-900/60 rounded-full" 
               />
               <motion.div 
                 animate={isHappy ? { height: [6, 2, 6], scaleX: 1.5 } : { height: [6, 6, 1, 6] }} 
                 transition={{ duration: isHappy ? 0.2 : 4, repeat: Infinity, repeatDelay: isHappy ? 0 : 3 }}
                 className="w-2 h-2 bg-slate-900/60 rounded-full" 
               />
            </div>
          </motion.div>

          {/* Shadow behind pet */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-2 bg-black/10 blur-md rounded-full -z-10" />
        </motion.div>
      </div>
    </div>
  );
};
