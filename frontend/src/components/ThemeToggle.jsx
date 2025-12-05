import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`
                relative w-14 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                ${theme === 'dark' ? 'bg-slate-700 focus:ring-offset-slate-900' : 'bg-indigo-100 focus:ring-offset-white'}
            `}
            aria-label="Toggle Theme"
        >
            <motion.div
                className="w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center relative z-10"
                layout
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                animate={{
                    x: theme === 'dark' ? 24 : 0,
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff'
                }}
            >
                <motion.div
                    initial={false}
                    animate={{
                        scale: theme === 'dark' ? 0 : 1,
                        opacity: theme === 'dark' ? 0 : 1
                    }}
                    transition={{ duration: 0.2 }}
                    className="absolute"
                >
                    <Sun className="w-4 h-4 text-orange-500" />
                </motion.div>
                <motion.div
                    initial={false}
                    animate={{
                        scale: theme === 'dark' ? 1 : 0,
                        opacity: theme === 'dark' ? 1 : 0
                    }}
                    transition={{ duration: 0.2 }}
                    className="absolute"
                >
                    <Moon className="w-4 h-4 text-indigo-400" />
                </motion.div>
            </motion.div>
        </button>
    );
}
