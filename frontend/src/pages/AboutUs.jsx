import React, { useRef } from 'react';
import { Instagram, Users, Award, Code, Database, Layout, Sparkles, Globe, Zap, Heart, Bookmark } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const TeamMemberCard = ({ member, position, index }) => {
    const cardRef = useRef(null);

    // Track scroll progress relative to this specific card
    const { scrollYProgress } = useScroll({
        target: cardRef,
        // offset: Start animation when card top enters viewport bottom ('start end').
        //         End animation FULLY when card center is at viewport center ('center center').
        offset: ["start end", "center center"]
    });

    // Smooth out the scroll progress
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 20,
        mass: 1
    });

    // 1. Image Animation (Pop up from behind)
    // Starts DEEP (y: 250) and moves HIGHER (y: -160)
    // Updated: Linear interpolation [0, 1] ensures it reaches exactly -160 at center (progress: 1)
    const imageY = useTransform(smoothProgress, [0, 1], [250, -160]);
    // Opacity SYNCED: Starts appearing much earlier (0.2) to match card movement
    const imageOpacity = useTransform(smoothProgress, [0, 0.2, 1], [0, 0, 1]);
    const imageScale = useTransform(smoothProgress, [0, 1], [0.8, 1.15]);

    // 2. Card Animation (Directional Hinge + DOWNWARD Movement)
    const cardRotateX = useTransform(smoothProgress, [0, 1], [0, 15]); // Slightly more tilt
    const cardScale = useTransform(smoothProgress, [0, 1], [1, 0.95]); // Shrink slightly more

    // MOVE DOWN: Pushes card down to separate from rising image (prevents text crash)
    const cardMoveY = useTransform(smoothProgress, [0, 1], [0, 100]);

    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Directional lateral movement (Fall back slightly to sides) - Disabled on mobile
    const xOutput = (position === 'left' && !isMobile) ? -50 : (position === 'right' && !isMobile) ? 50 : 0;
    const cardX = useTransform(smoothProgress, [0, 1], [0, xOutput]);

    // Dynamic style for the perspective container
    const perspectiveStyle = {
        perspective: "1200px",
        ...(isMobile ? {
            position: 'sticky',
            top: `${100 + (index * 30)}px`,
            zIndex: 10 + index
        } : {})
    };

    // Center card elevation (moved up via negative margin) - Only on desktop
    // On mobile: reduced height to 550px and removed negative margins/bottom margin to tighten stack
    const containerClasses = `relative flex items-center justify-center ${isMobile ? 'h-[550px] mb-0' : 'h-[650px] -my-10'} md:-my-10 md:h-[650px] ${position === 'center' ? 'md:-mt-24 z-20' : ''}`;

    return (
        <div ref={cardRef} className={containerClasses} style={perspectiveStyle}>

            {/* Hologram Image */}
            {member.image ? (
                <motion.div
                    style={{
                        y: imageY,
                        opacity: imageOpacity,
                        scale: imageScale,
                        zIndex: 0
                    }}
                    className="absolute inset-x-0 bottom-[45%] flex justify-center pointer-events-none"
                >
                    <div className="relative w-80 h-80 flex items-end justify-center">
                        <div className={`absolute inset-0 bg-gradient-to-t ${member.color} blur-[60px] opacity-40 rounded-full`} />
                        <img
                            src={member.image}
                            alt={member.name}
                            className="relative w-full h-full object-contain z-10"
                            style={{ filter: 'drop-shadow(0 0 20px rgba(99,102,241,0.3))' }}
                        />
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    style={{ y: imageY, opacity: imageOpacity }}
                    className="absolute inset-x-0 bottom-[50%] z-0 flex justify-center pointer-events-none"
                >
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${member.color} shadow-lg shadow-offset overflow-hidden h-24 w-24 flex items-center justify-center`}>
                        <div className="absolute inset-0 bg-white opacity-20 rounded-2xl animate-pulse"></div>
                        {member.icon}
                    </div>
                </motion.div>
            )}

            {/* Main Card */}
            <motion.div
                style={{
                    rotateX: cardRotateX,
                    x: cardX,
                    y: cardMoveY, // Applied downward movement
                    scale: cardScale,
                    zIndex: 10,
                    transformOrigin: "top",
                    transformStyle: "preserve-3d"
                }}
                className="relative bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-slate-700/50 p-8 flex flex-col items-center text-center shadow-2xl w-full max-w-sm"
            >
                {/* Background Ambient Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${member.color} rounded-3xl blur-2xl opacity-5 -z-10`} />

                {/* Top Header */}
                <div className="mb-6 w-full flex items-center justify-center gap-3 opacity-50">
                    <div className="h-px bg-slate-300 dark:bg-slate-600 flex-1"></div>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                        Developer Profile
                    </span>
                    <div className="h-px bg-slate-300 dark:bg-slate-600 flex-1"></div>
                </div>

                {/* Role Badge */}
                <div className={`mb-4 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600`}>
                    {member.role}
                </div>

                {/* Name & NIM */}
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                    {member.name}
                </h3>
                <p className="text-sm font-mono text-slate-500 dark:text-slate-400 mb-6 bg-slate-100 dark:bg-slate-900/50 px-3 py-1 rounded-md">
                    NIM: {member.nim}
                </p>

                {/* Extended Description */}
                <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                    {member.description}
                </p>

                {/* Skills - New Content */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {member.skills.map((skill, i) => (
                        <span key={i} className="px-2 py-1 text-[10px] font-semibold bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 rounded-md border border-slate-200 dark:border-slate-600">
                            {skill}
                        </span>
                    ))}
                </div>

                {/* Responsibility */}
                <div className="w-full pt-6 border-t border-slate-200/60 dark:border-slate-700/60 mb-6">
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
                    className={`w-full py-3 rounded-xl bg-gradient-to-r ${member.color} text-white font-medium shadow-lg hover:shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2`}
                >
                    <Instagram className="h-5 w-5" />
                    <span>@{member.username}</span>
                </motion.a>
            </motion.div>
        </div>
    );
};

export default function AboutUs() {
    const rawTeam = [
        {
            name: "Muhammad Zhafier Ardine Yudhistira",
            nim: "240533608306",
            username: "zhaf_ard",
            role: "Ketua",
            responsibility: "Fullstack Developer & System Architect",
            description: "Responsible for the entire system architecture, backend development with Laravel, and seamless integration of various APIs. Passionate about scalable code and clean design patterns.",
            skills: ["Laravel", "React", "System Architecture", "DevOps"],
            image: "/public/images/zhafier.png",
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
            description: "Crafting beautiful and intuitive user interfaces. Focuses on user experience, responsive design, and implementing modern visual effects to make the platform come alive.",
            skills: ["Figma", "React", "Tailwind CSS", "Animation"],
            image: "/public/images/swyhke.png",
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
            description: "Ensures code quality and thorough documentation. Specializes in React component optimization and maintaining a consistent design system across the application.",
            skills: ["React", "Documentation", "QA Testing", "CSS"],
            image: "/public/images/reva.png",
            icon: <Code className="h-6 w-6 text-white" />,
            color: "from-emerald-500 to-teal-500",
            shadow: "shadow-emerald-500/20"
        }
    ];

    // Reorder: [Left, Center, Right] -> [Member, Leader, Member]
    // Current Raw: [Leader, Member1, Member2]
    // Goal: [Member1, Leader, Member2]
    const team = [rawTeam[1], rawTeam[0], rawTeam[2]];

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/30 pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                {/* Header Section */}
                <div className="text-center mb-24 space-y-6">
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

                {/* Project Purpose (New Section) */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="mb-32 max-w-4xl mx-auto"
                >
                    <div className="relative p-1 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-2xl">
                        <div className="bg-white dark:bg-slate-900 rounded-[22px] p-8 md:p-12 text-center relative overflow-hidden">
                            {/* Decorative blur */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none" />

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400">
                                    <Bookmark className="h-6 w-6" />
                                </div>
                                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 mb-6">
                                    Final Project: Pemrograman Web
                                </h2>
                                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                                    Project ini diajukan sebagai bentuk pemenuhan <span className="font-bold text-indigo-600 dark:text-indigo-400">Tugas Akhir</span> pada mata kuliah <span className="font-semibold text-slate-900 dark:text-white">Pemrograman Web</span>. Dikembangkan dengan teknologi modern seperti React, Laravel, dan TailwindCSS untuk mendemonstrasikan pemahaman mendalam tentang pengembangan aplikasi web fullstack.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Team Grid */}
                {/* Modified for Mobile Stacking: flex-col ensures sticky items stack within the same container context */}
                {/* Reduced gap-y from 24 to 4 on mobile to fix large gaps between sticky cards */}
                <div className="flex flex-col gap-y-4 md:grid md:grid-cols-3 md:gap-y-24 gap-x-8 mb-40 items-start relative">
                    {team.map((member, index) => {
                        // Determine position based on index in the reordered array
                        // 0: Left, 1: Center, 2: Right
                        const position = index === 0 ? 'left' : index === 1 ? 'center' : 'right';

                        return (
                            <TeamMemberCard key={index} member={member} position={position} index={index} />
                        );
                    })}
                </div>

                {/* Bottom Decorative Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center pb-20"
                >
                    <p className="text-sm text-slate-400 dark:text-slate-500 flex items-center justify-center gap-2">
                        Made with <span className="text-red-500 animate-pulse">❤</span> by Kelompok 10
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
