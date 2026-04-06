import React from 'react';
import { X, Gamepad2, Puzzle } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { motion, AnimatePresence } from 'motion/react';

export const GameMenu: React.FC = () => {
  const { isGameMenuOpen, toggleGameMenu, handleGameSelect } = useAppContext();

  return (
    <AnimatePresence>
      {isGameMenuOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => toggleGameMenu(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-[1001]"
          />
          <motion.aside 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 w-[85%] h-full bg-white z-[1002] p-8 flex flex-col shadow-2xl"
          >
            <div className="flex justify-between items-center mb-10">
              <button onClick={() => toggleGameMenu(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} className="text-slate-500" />
              </button>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-display font-bold text-slate-900">Games</h2>
                <div className="w-10 h-10 bg-brand-secondary rounded-xl flex items-center justify-center text-white font-bold text-xl">G</div>
              </div>
            </div>
            <div className="flex flex-col h-full overflow-y-auto no-scrollbar pb-10">
              <div className="grid grid-cols-1 gap-4">
                <button onClick={() => handleGameSelect('Tic Tac Toe', '/games/tictactoe.html')} className="flex items-center p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 group text-left w-full">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-4 shadow-md group-hover:scale-110 transition-transform">
                    <Gamepad2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-bold">Tic Tac Toe</h3>
                    <p className="text-slate-500 text-xs">Classic X and O game</p>
                  </div>
                </button>
                
                <button onClick={() => handleGameSelect('Tetris', '/games/tetris.html')} className="flex items-center p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 group text-left w-full">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mr-4 shadow-md group-hover:scale-110 transition-transform">
                    <Gamepad2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-bold">Tetris</h3>
                    <p className="text-slate-500 text-xs">Block puzzle game</p>
                  </div>
                </button>
                
                <button onClick={() => handleGameSelect('Maze Puzzle', '/games/maze.html')} className="flex items-center p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 group text-left w-full">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mr-4 shadow-md group-hover:scale-110 transition-transform">
                    <Puzzle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-bold">Maze Puzzle</h3>
                    <p className="text-slate-500 text-xs">Find your way out</p>
                  </div>
                </button>

                <button onClick={() => handleGameSelect('Connect Four', '/games/connectfour.html')} className="flex items-center p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 group text-left w-full">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center mr-4 shadow-md group-hover:scale-110 transition-transform">
                    <Gamepad2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-bold">Connect Four</h3>
                    <p className="text-slate-500 text-xs">Four in a row wins</p>
                  </div>
                </button>

                <button onClick={() => handleGameSelect('2048 Neon', '/games/2048.html')} className="flex items-center p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 group text-left w-full">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center mr-4 shadow-md group-hover:scale-110 transition-transform">
                    <Gamepad2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-bold">2048 Neon</h3>
                    <p className="text-slate-500 text-xs">Merge to reach 2048</p>
                  </div>
                </button>

                <button onClick={() => handleGameSelect('Tower Blocks', '/games/towerblocks.html')} className="flex items-center p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 group text-left w-full">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mr-4 shadow-md group-hover:scale-110 transition-transform">
                    <Gamepad2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-bold">Tower Blocks</h3>
                    <p className="text-slate-500 text-xs">Build the highest tower</p>
                  </div>
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
