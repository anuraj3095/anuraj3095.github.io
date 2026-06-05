import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Car, Plane, Gamepad2, ChefHat, Briefcase, Code, Terminal, TrendingUp, RotateCcw } from 'lucide-react';

const ICONS = [Car, Plane, Gamepad2, ChefHat, Briefcase, Code, Terminal, TrendingUp];

interface CardData {
  id: number;
  iconIndex: number;
  isFlipped: boolean;
  isMatched: boolean;
}

const generateDeck = (): CardData[] => {
  const deck = [...ICONS, ...ICONS].map((_, index) => ({
    id: index,
    iconIndex: index % ICONS.length,
    isFlipped: false,
    isMatched: false,
  }));
  // Shuffle
  return deck.sort(() => Math.random() - 0.5);
};

const MemoryGame = () => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);

  useEffect(() => {
    setCards(generateDeck());
  }, []);

  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2) return; // Prevent flipping more than 2 at a time
    if (cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstIndex, secondIndex] = newFlipped;
      if (newCards[firstIndex].iconIndex === newCards[secondIndex].iconIndex) {
        // Match!
        setTimeout(() => {
          setCards((prev) => {
            const matched = [...prev];
            matched[firstIndex].isMatched = true;
            matched[secondIndex].isMatched = true;
            return matched;
          });
          setMatches((m) => m + 1);
          setFlippedIndices([]);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) => {
            const reset = [...prev];
            reset[firstIndex].isFlipped = false;
            reset[secondIndex].isFlipped = false;
            return reset;
          });
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  const restartGame = () => {
    setCards(generateDeck());
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Memory Grid</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Matches: {matches} / {ICONS.length} | Moves: {moves}</p>
        </div>
        <button 
          onClick={restartGame}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.75rem 1.5rem', borderRadius: '12px',
            background: 'var(--bg-color-card)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600
          }}
        >
          <RotateCcw size={18} /> Restart
        </button>
      </div>

      {matches === ICONS.length && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ padding: '2rem', background: 'rgba(0, 240, 255, 0.1)', border: '1px solid var(--accent-neon)', borderRadius: '16px', textAlign: 'center', marginBottom: '2rem' }}
        >
          <h2 style={{ color: 'var(--accent-neon)' }}>System Override Complete!</h2>
          <p>You completed the grid in {moves} moves.</p>
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {cards.map((card, index) => {
          const Icon = ICONS[card.iconIndex];
          const isVisible = card.isFlipped || card.isMatched;

          return (
            <motion.div
              key={card.id}
              onClick={() => handleCardClick(index)}
              style={{
                aspectRatio: '1',
                background: isVisible ? 'var(--bg-color-card-hover)' : 'var(--bg-color-card)',
                border: isVisible ? '1px solid var(--accent-neon)' : '1px solid rgba(255,255,255,0.05)',
                borderRadius: '16px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: (card.isMatched || card.isFlipped) ? 'default' : 'pointer',
                boxShadow: isVisible ? '0 0 20px rgba(0, 240, 255, 0.1)' : 'none',
              }}
              whileHover={{ scale: (card.isMatched || card.isFlipped) ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                initial={false}
                animate={{ rotateY: isVisible ? 0 : 180, opacity: isVisible ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isVisible && <Icon size={40} color={card.isMatched ? 'var(--accent-neon)' : 'var(--text-primary)'} />}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default MemoryGame;
