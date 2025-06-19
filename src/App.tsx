import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WelcomeScreen from './components/WelcomeScreen';
import MuseumEntrance from './components/MuseumEntrance';
import GrammarRooms from './components/GrammarRooms';
import PersonalNotebook from './components/PersonalNotebook';
import StudyProgress from './components/StudyProgress';
import GrammarGame from './components/GrammarGame';
import { GrammarLevel, GrammarPoint } from './types/grammar';

type ScreenType = 'welcome' | 'entrance' | 'rooms' | 'notebook' | 'progress' | 'games';

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('welcome');
  const [selectedLevel, setSelectedLevel] = useState<GrammarLevel | null>(null);
  const [savedGrammar, setSavedGrammar] = useState<GrammarPoint[]>([]);
  const [studyStats, setStudyStats] = useState({
    quizStats: { correct: 0, total: 0, streak: 0, bestStreak: 0 },
    studyTime: 0,
    grammarMastered: 0
  });

  // Load saved data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('korean-grammar-saved');
    if (saved) {
      setSavedGrammar(JSON.parse(saved));
    }

    const stats = localStorage.getItem('korean-grammar-stats');
    if (stats) {
      setStudyStats(JSON.parse(stats));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('korean-grammar-saved', JSON.stringify(savedGrammar));
  }, [savedGrammar]);

  useEffect(() => {
    localStorage.setItem('korean-grammar-stats', JSON.stringify(studyStats));
  }, [studyStats]);

  // Study time tracker
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentScreen === 'rooms') {
      interval = setInterval(() => {
        setStudyStats(prev => ({
          ...prev,
          studyTime: prev.studyTime + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentScreen]);

  const handleScreenChange = (screen: ScreenType) => {
    setCurrentScreen(screen);
  };

  const handleLevelSelect = (level: GrammarLevel) => {
    setSelectedLevel(level);
    setCurrentScreen('rooms');
  };

  const handleSaveGrammar = (grammar: GrammarPoint) => {
    setSavedGrammar(prev => {
      const exists = prev.find(g => g.id === grammar.id);
      if (!exists) {
        return [...prev, grammar];
      }
      return prev;
    });
  };

  const handleQuizComplete = (correct: number, total: number) => {
    setStudyStats(prev => ({
      ...prev,
      quizStats: {
        correct: prev.quizStats.correct + correct,
        total: prev.quizStats.total + total,
        streak: correct === total ? prev.quizStats.streak + correct : 0,
        bestStreak: Math.max(prev.quizStats.bestStreak, prev.quizStats.streak)
      }
    }));
  };

  const handleGameComplete = (score: number, totalQuestions: number) => {
    handleQuizComplete(score, totalQuestions);
  };

  // Get total grammar count based on level
  const getTotalGrammarCount = () => {
    const counts = { beginner: 2, intermediate: 50, advanced: 1 };
    return Object.values(counts).reduce((sum, count) => sum + count, 0);
  };

  // Get grammar points for games
  const getAllGrammarPoints = (): GrammarPoint[] => {
    // This would normally come from your grammar data
    // For now, return saved grammar or empty array
    return savedGrammar;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
                           radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
          backgroundSize: '100px 100px'
        }} />
      </div>

      <AnimatePresence mode="wait">
        {currentScreen === 'welcome' && (
          <WelcomeScreen 
            key="welcome"
            onEnterMuseum={() => handleScreenChange('entrance')} 
          />
        )}
        
        {currentScreen === 'entrance' && (
          <MuseumEntrance 
            key="entrance"
            onLevelSelect={handleLevelSelect}
            onOpenNotebook={() => handleScreenChange('notebook')}
            onOpenGames={() => handleScreenChange('games')}
            onOpenProgress={() => handleScreenChange('progress')}
            onBack={() => handleScreenChange('welcome')}
          />
        )}
        
        {currentScreen === 'rooms' && selectedLevel && (
          <GrammarRooms 
            key="rooms"
            level={selectedLevel}
            onBack={() => handleScreenChange('entrance')}
            onSaveGrammar={handleSaveGrammar}
            onOpenNotebook={() => handleScreenChange('notebook')}
          />
        )}
        
        {currentScreen === 'notebook' && (
          <PersonalNotebook 
            key="notebook"
            savedGrammar={savedGrammar}
            onBack={() => handleScreenChange('entrance')}
          />
        )}

        {currentScreen === 'progress' && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleScreenChange('entrance')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <span className="korean-text">돌아가기</span>
              </motion.button>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <StudyProgress
                quizStats={studyStats.quizStats}
                studyTime={studyStats.studyTime}
                grammarMastered={savedGrammar.length}
                totalGrammar={getTotalGrammarCount()}
              />
            </div>
          </motion.div>
        )}

        {currentScreen === 'games' && (
          <motion.div
            key="games"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleScreenChange('entrance')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <span className="korean-text">돌아가기</span>
              </motion.button>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <GrammarGame
                grammarPoints={getAllGrammarPoints()}
                onGameComplete={handleGameComplete}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;