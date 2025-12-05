import { motion } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Card({ children, className, shine = false, ...props }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={twMerge(
                "glass-card p-6",
                shine && "shine-effect",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function CardHeader({ children, className }) {
    return (
        <div className={twMerge("mb-4", className)}>
            {children}
        </div>
    );
}

export function CardTitle({ children, className }) {
    return (
        <h3 className={twMerge("text-xl font-bold text-slate-800 dark:text-white", className)}>
            {children}
        </h3>
    );
}

export function CardContent({ children, className }) {
    return (
        <div className={twMerge("", className)}>
            {children}
        </div>
    );
}
