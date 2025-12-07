import React from 'react';
import { Instagram, Users, Award, Code, Database, Layout, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutUs() {
    const team = [
        {
            name: "Muhammad Zhafier Ardine Yudhistira",
            nim: "240533608306",
            username: "zhaf_ard",
            role: "Ketua",
            responsibility: "Fullstack Developer & System Architect",
            icon: <Database className="h-6 w-6 text-white" />,
            color: "from-indigo-500 to-purple-500",
            shadow: "shadow-indigo-500/20"
        },
        {
            name: "Swykhe Galeh Wahyu Purnama",
            nim: "240533600469",
            username: "swykheprnma",
            role: "Anggota",
            responsibility: "Frontend & UI/UX Designer",
            icon: <Layout className="h-6 w-6 text-white" />,
            color: "from-pink-500 to-rose-500",
            shadow: "shadow-pink-500/20"
        },
        {
            name: "Reva Aliya Putri Purwanto",
            nim: "240533608595",
            username: "revalyaaaa",
            role: "Anggota",
            responsibility: "Frontend Specialist & Documentation",
            icon: <Code className="h-6 w-6 text-white" />,
            color: "from-emerald-500 to-teal-500",
            shadow: "shadow-emerald-500/20"
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-900">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-50 dark:opacity-20"
                />
                <motion.div
                    animate={{ rotate: -360, scale: [1, 1.3, 1] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute top-40 -left-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl opacity-50 dark:opacity-20"
                />
                <motion.div
                    animate={{ y: [0, -50, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-0 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl opacity-30 dark:opacity-10"
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                {/* Header Section */}
                <div className="text-center mb-20 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-sm mb-4"
                    >
                        <Sparkles className="h-4 w-4 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Development Team
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-extrabold tracking-tight"
                    >
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-800 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white">
                            Meet The Creators
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed"
                    >
                        Tim dibalik pengembangan ekosistem <span className="font-bold text-indigo-600 dark:text-indigo-400">SolveSphere</span>.
                        Kami berdedikasi menciptakan solusi digital yang inovatif, modern, dan bermanfaat bagi masyarakat.
                    </motion.p>
                </div>

                {/* Cards Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10"
                >
                    {team.map((member, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            whileHover={{ y: -10 }}
                            className="group relative"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${member.color} rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300 -z-10`} />

                            <div className="relative h-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-slate-700/50 p-8 flex flex-col items-center text-center shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300">

                                {/* Icon/Avatar */}
                                <div className={`relative mb-6 p-4 rounded-2xl bg-gradient-to-br ${member.color} shadow-lg shadow-offset`}>
                                    <div className="absolute inset-0 bg-white opacity-20 rounded-2xl animate-pulse"></div>
                                    {member.icon}
                                </div>

                                {/* Role Badge */}
                                <div className={`mb-4 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600`}>
                                    {member.role}
                                </div>

                                {/* Name & NIM */}
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                    {member.name}
                                </h3>
                                <p className="text-sm font-mono text-slate-500 dark:text-slate-400 mb-6 bg-slate-100 dark:bg-slate-900/50 px-3 py-1 rounded-md">
                                    NIM: {member.nim}
                                </p>

                                {/* Responsibility */}
                                <div className="mt-auto w-full pt-6 border-t border-slate-200/60 dark:border-slate-700/60">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 italic">
                                        "{member.responsibility}"
                                    </p>
                                </div>

                                {/* Social Link */}
                                <motion.a
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    href={`https://instagram.com/${member.username}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`mt-6 w-full py-2.5 rounded-xl bg-gradient-to-r ${member.color} text-white font-medium shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
                                >
                                    <Instagram className="h-4 w-4" />
                                    <span>@{member.username}</span>
                                </motion.a>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Bottom Decorative Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-24 text-center"
                >
                    <p className="text-sm text-slate-400 dark:text-slate-500 flex items-center justify-center gap-2">
                        Made with <span className="text-red-500 animate-pulse">❤</span> by Kelompok 10
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
