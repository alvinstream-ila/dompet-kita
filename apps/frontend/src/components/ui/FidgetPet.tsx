import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Heart, Sparkles, Star, Ghost, Cat, Rabbit, Send, X, MessageCircleHeart } from 'lucide-react';
import { useAIChat } from '@/features/home';

type PetType = 'rabbit' | 'cat' | 'ghost';

interface Particle {
  id: string;
  x: number;
  y: number;
  rotate: number;
  type: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const FidgetPet: React.FC = () => {
  const constraintsRef = useRef(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [petType, setPetType] = useState<PetType>('rabbit');
  const [isHappy, setIsHappy] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init-msg', role: 'assistant', content: 'Halo Sayang! Ada yang bisa aku bantu seputar keuangan kita hari ini? ❤️' }
  ]);

  const { mutate: sendMessage, isPending } = useAIChat();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isChatOpen]);

  const togglePet = () => {
    const types: PetType[] = ['rabbit', 'cat', 'ghost'];
    const nextIndex = (types.indexOf(petType) + 1) % types.length;
    setPetType(types[nextIndex]);
    triggerHappiness();
  };

  const triggerHappiness = () => {
    const newParticles = Array.from({ length: 6 }).map(() => ({
      id: crypto.randomUUID(),
      x: (Math.random() - 0.5) * 120, // NOSONAR: Visual particle effect only
      y: (Math.random() - 0.5) * 120 - 40, // NOSONAR: Visual particle effect only
      rotate: Math.random() * 360, // NOSONAR: Visual particle effect only
      type: Math.floor(Math.random() * 3), // NOSONAR: Visual particle effect only
    }));
    setParticles(newParticles);
    setIsHappy(true);
    setTimeout(() => {
      setIsHappy(false);
      setParticles([]);
    }, 800);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || isPending) return;

    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', content: userMessage }]);
    setInputValue('');
    triggerHappiness();

    sendMessage(userMessage, {
      onSuccess: (data) => {
        setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: data.message }]);
      },
      onError: () => {
        setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: 'Duh maaf ya sayang, aku lagi pusing dengerin angkanya. Coba lagi nanti ya! 🥺' }]);
      }
    });
  };

  const getPetIcon = () => {
    switch (petType) {
      case 'rabbit':
        return <Rabbit className="h-8 w-8" />;
      case 'cat':
        return <Cat className="h-8 w-8" />;
      case 'ghost':
        return <Ghost className="h-8 w-8" />;
    }
  };

  const getPetColor = () => {
    switch (petType) {
      case 'rabbit':
        return 'from-pink-400 to-rose-400';
      case 'cat':
        return 'from-amber-400 to-orange-400';
      case 'ghost':
        return 'from-blue-300 to-indigo-300';
    }
  };

  return (
    <div
      ref={constraintsRef}
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      <div className="pointer-events-auto absolute right-6 bottom-28 flex flex-col items-end gap-4">
        {/* Chat window */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20, x: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20, x: 20 }}
              className="mr-2 mb-2 flex w-[320px] flex-col overflow-hidden rounded-[32px] border border-white/20 bg-white/80 shadow-2xl backdrop-blur-md md:w-[380px]"
            >
              {/* Header */}
              <div className={cn(
                "flex items-center justify-between bg-linear-to-r p-4 text-white",
                getPetColor()
              )}>
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-white/20 p-1.5">
                    <MessageCircleHeart className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-black tracking-tight">Asisten Sayang ✨</h5>
                    <p className="text-[10px] font-medium opacity-80 uppercase tracking-widest">Financial Partner</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="rounded-full p-1.5 transition-colors hover:bg-black/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Messages Area */}
              <div 
                ref={scrollRef}
                className="flex h-72 flex-col gap-3 overflow-y-auto p-4 scrollbar-hide md:h-96"
              >
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={cn(
                      "max-w-[85%] rounded-2xl p-3 text-sm font-medium shadow-sm",
                      msg.role === 'user' 
                        ? "self-end bg-pink-500 text-white rounded-tr-none" 
                        : "self-start bg-slate-100 text-slate-700 rounded-tl-none border border-slate-200"
                    )}
                  >
                    {msg.content}
                  </motion.div>
                ))}
                {isPending && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="self-start rounded-2xl bg-slate-100 p-3 shadow-sm"
                  >
                    <div className="flex gap-1.5">
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0ms' }} />
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '150ms' }} />
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '300ms' }} />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-slate-100 bg-white/50 p-3">
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Sapa si Sayang..."
                    className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium placeholder:text-slate-400 focus:border-pink-300 focus:outline-none"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isPending}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full text-white shadow-lg transition-all active:scale-95 disabled:grayscale",
                      getPetColor()
                    )}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          drag
          dragConstraints={constraintsRef}
          dragElastic={0.1}
          dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
          whileDrag={{ scale: 1.2, cursor: 'grabbing', rotate: 10 }}
          whileTap={{ scale: 0.8 }}
          onTap={() => {
            if (isChatOpen) {
              triggerHappiness();
            } else {
              setIsChatOpen(true);
              triggerHappiness();
            }
          }}
          onDoubleClick={togglePet}
          className="relative cursor-grab active:cursor-grabbing"
        >
          {/* Pet Base with Squash and Stretch */}
          <motion.div
            animate={{
              y: isHappy ? [0, -40, 0] : [0, -15, 0],
              scaleX: isHappy ? [1, 1.4, 0.8, 1] : [1, 1.05, 1],
              scaleY: isHappy ? [1, 0.6, 1.3, 1] : [1, 0.95, 1],
              rotate: isHappy ? [0, 15, -15, 0] : [0, -3, 3, 0],
            }}
            transition={{
              duration: isHappy ? 0.4 : 3,
              repeat: isHappy ? 0 : Infinity,
              ease: 'easeInOut',
            }}
            className={cn(
              'relative flex h-18 w-18 items-center justify-center rounded-[28px] text-white shadow-[0_20px_50px_rgba(0,0,0,0.2)]',
              'bg-linear-to-br ring-4 ring-white/30 backdrop-blur-sm transform-gpu',
              'backface-visibility-hidden',
              getPetColor()
            )}
          >
            {/* Crown/Ear Accessory */}
            <motion.div
              animate={{ y: [0, -5, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-4 text-amber-300 drop-shadow-md"
            >
              <Star className="h-6 w-6 fill-amber-300" />
            </motion.div>

            {/* Explosive Particles on click */}
            <AnimatePresence>
              {isHappy && (
                <>
                  {particles.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                      animate={{
                        scale: [0, 1.5, 0],
                        opacity: [0, 1, 0],
                        x: p.x,
                        y: p.y,
                        rotate: p.rotate,
                      }}
                      className="pointer-events-none absolute"
                    >
                      {(() => {
                        if (p.type === 0) return <Heart className="h-5 w-5 fill-white text-white" />;
                        if (p.type === 1) return <Sparkles className="h-6 w-6 text-amber-200" />;
                        return <Star className="h-4 w-4 fill-white text-white" />;
                      })()}
                    </motion.div>
                  ))}
                </>
              )}
            </AnimatePresence>

            {/* Inner glow effect */}
            <div className="absolute inset-0 overflow-hidden rounded-[28px]">
              <div className="absolute -top-[50%] -left-[50%] h-[200%] w-[200%] rotate-45 bg-white/20" />
            </div>

            {/* Pet Face */}
            <div className="relative z-10 drop-shadow-lg transition-transform group-hover:scale-110">
              {getPetIcon()}
            </div>

            {/* More Expressive Eyes */}
            <div className="absolute top-[45%] left-1/2 flex h-full w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-3">
              <motion.div
                animate={
                  isHappy
                    ? { height: [6, 2, 6], scaleX: 1.5 }
                    : { height: [6, 6, 1, 6] }
                }
                transition={{
                  duration: isHappy ? 0.2 : 4,
                  repeat: Infinity,
                  repeatDelay: isHappy ? 0 : 3,
                }}
                className="h-2 w-2 rounded-full bg-slate-900/60"
              />
              <motion.div
                animate={
                  isHappy
                    ? { height: [6, 2, 6], scaleX: 1.5 }
                    : { height: [6, 6, 1, 6] }
                }
                transition={{
                  duration: isHappy ? 0.2 : 4,
                  repeat: Infinity,
                  repeatDelay: isHappy ? 0 : 3,
                }}
                className="h-2 w-2 rounded-full bg-slate-900/60"
              />
            </div>
          </motion.div>

          {/* Shadow behind pet */}
          <div className="absolute -bottom-2 left-1/2 -z-10 h-2 w-10 -translate-x-1/2 rounded-full bg-black/10 blur-md" />
        </motion.div>
      </div>
    </div>
  );
};
