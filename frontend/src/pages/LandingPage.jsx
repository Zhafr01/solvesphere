import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Star } from 'lucide-react';
import api from '../lib/api';
import PartnerApplication from '../components/PartnerApplication';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
    const [partners, setPartners] = useState([]);
    const [filteredPartners, setFilteredPartners] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isApplicationOpen, setIsApplicationOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const { data } = await api.get('/landing-page');
                setPartners(data.partners || []);
                setFilteredPartners(data.partners || []);
            } catch (error) {
                console.error("Failed to fetch partners", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPartners();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const filtered = partners.filter(partner =>
                partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                partner.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredPartners(filtered);
        } else {
            setFilteredPartners(partners);
        }
    }, [searchQuery, partners]);

    const handleApplyClick = () => {
        if (user) {
            setIsApplicationOpen(true);
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="glass-panel p-10 rounded-3xl inline-block"
                    >
                        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 mb-6 tracking-tight">
                            SolveSphere
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10 font-light">
                            A simply lovely way to make place for your users interaction with you.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link to="/login" className="btn-primary text-lg px-8 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
                                Login to Platform
                            </Link>
                            <button
                                onClick={handleApplyClick}
                                className="px-8 py-3 rounded-full bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-700 shadow-md hover:bg-indigo-50 dark:hover:bg-slate-700 hover:shadow-lg transform hover:-translate-y-1 transition-all"
                            >
                                Become a Partner
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                    <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-200 dark:bg-purple-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-200 dark:bg-indigo-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-200 dark:bg-pink-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                </div>
            </section>

            {/* Partner Search & Showcase */}
            <section className="py-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Our Trusted Partners</h2>
                        <div className="max-w-xl mx-auto relative">
                            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search for a partner..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-full border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition-all shadow-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-10 text-slate-600 dark:text-slate-400">Loading partners...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredPartners.length > 0 ? (
                                filteredPartners.map((partner, index) => (
                                    <motion.div
                                        key={partner.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                        <Link to={`/partners/${partner.slug}`} className="block h-full">
                                            <Card className="h-full hover:shadow-xl transition-all duration-300 border-t-4 border-t-indigo-500 group glass-card">
                                                <div className="p-6 flex flex-col items-center text-center h-full">
                                                    <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-700 mb-4 overflow-hidden shadow-inner group-hover:scale-110 transition-transform duration-300">
                                                        {partner.logo ? (
                                                            <img src={partner.logo} alt={partner.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-slate-400 dark:text-slate-500">
                                                                {partner.name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{partner.name}</h3>

                                                    {/* Rating Display */}
                                                    <div className="flex items-center gap-1 mb-3">
                                                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                            {partner.average_rating ? Number(partner.average_rating).toFixed(1) : 'New'}
                                                        </span>
                                                        <span className="text-xs text-slate-500">({partner.ratings_count || 0})</span>
                                                    </div>

                                                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 flex-grow">{partner.description}</p>
                                                    <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-medium text-sm mt-auto">
                                                        Visit Community <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-10 text-slate-500 dark:text-slate-400">
                                    No partners found matching your search.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Infinite Scroll Carousel (Visual Only - using duplicates for effect) */}
            {partners.length > 3 && (
                <section className="py-16 overflow-hidden bg-slate-50 dark:bg-slate-900">
                    <div className="flex w-[200%] animate-scroll">
                        {[...partners, ...partners].map((partner, index) => (
                            <div key={`${partner.id}-${index}`} className="w-64 flex-shrink-0 px-4">
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 overflow-hidden flex-shrink-0">
                                        {partner.logo && <img src={partner.logo} alt="" className="h-full w-full object-cover" />}
                                    </div>
                                    <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{partner.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <PartnerApplication isOpen={isApplicationOpen} onClose={() => setIsApplicationOpen(false)} />
        </div>
    );
}
