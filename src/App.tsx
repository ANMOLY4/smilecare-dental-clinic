import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Chatbot from './components/Chatbot';
import Dashboard from './components/Dashboard';
import { auth, googleProvider, db } from './firebase';
import { signInWithRedirect, signOut, onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { Auth, User } from 'firebase/auth';
import {
  Phone,
  Mail,
  MapPin,
  CalendarPlus,
  ArrowRight,
  Menu,
  X,
  Stethoscope,
  ShieldCheck,
  Award,
  Clock,
  Smile,
  HeartPulse,
  Star,
  Quote,
  LogOut,
  User as UserIcon,
} from 'lucide-react';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'home' | 'dashboard'>('home');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
  const initAuth = async () => {
    setAuthLoading(true);
    
    try {
      // Google se wapas aane ke baad result pakdo
      const result = await getRedirectResult(auth);
      if (result?.user?.email) {
        console.log("Login success:", result.user.email);
      }
    } catch (error) {
      console.error("Redirect error:", error);
    }
    
    // Fir user state suno
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    
    return unsubscribe;
  };
  
  initAuth();
}, []);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    await signInWithRedirect(auth, googleProvider); // ✅ Sirf button click pe
  };

useEffect(() => {
  const initAuth = async () => {
    await getRedirectResult(auth); // Sirf result pakdo
    onAuthStateChanged(auth, setUser);
  };
  initAuth();
}, []);
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };

  const scrollToSection = (id: string) => {
    setView('home');
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setIsMenuOpen(false);
      }
    }, 100);
  };

  return (
    <div className="font-sans text-gray-900 bg-gray-50 min-h-screen">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="bg-purple-500 text-white p-2 rounded-xl">
                <Smile className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">SmileCare</h1>
                <p className="text-[10px] uppercase font-bold tracking-widest text-purple-600">Dental Point</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => { setView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors">Home</button>
              <button onClick={() => scrollToSection('services')} className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors">Services</button>
              <button onClick={() => scrollToSection('reviews')} className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors">Reviews</button>

              {user? (
                <div className="flex items-center gap-4">
                  <button onClick={() => setView('dashboard')} className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors">Dashboard</button>
                  <div className="flex items-center gap-2">
                    {user.photoURL? (
                      <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"><UserIcon className="w-4 h-4" /></div>
                    )}
                    <span className="text-sm font-medium text-gray-700 hidden lg:block">{user.displayName}</span>
                  </div>
                  <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Sign In
                </button>
              )}

              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all shadow-sm shadow-purple-200"
              >
                Book Appointment
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
            >
              <div className="px-4 py-4 flex flex-col gap-4">
                <button onClick={() => { setView('home'); setIsMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left text-sm font-medium text-gray-600 px-4 py-2 hover:bg-gray-50 rounded-lg">Home</button>
                <button onClick={() => scrollToSection('services')} className="text-left text-sm font-medium text-gray-600 px-4 py-2 hover:bg-gray-50 rounded-lg">Services</button>
                <button onClick={() => scrollToSection('reviews')} className="text-left text-sm font-medium text-gray-600 px-4 py-2 hover:bg-gray-50 rounded-lg">Reviews</button>

                {user? (
                   <div className="border-t border-gray-100 pt-4 flex flex-col gap-2">
                     <button onClick={() => { setView('dashboard'); setIsMenuOpen(false); }} className="text-left text-sm font-medium text-purple-600 px-4 py-2 hover:bg-purple-50 rounded-lg">Dashboard</button>
                     <div className="flex items-center justify-between px-4 py-2">
                       <div className="flex items-center gap-2">
                         {user.photoURL? (
                           <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
                         ) : (
                           <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"><UserIcon className="w-4 h-4" /></div>
                         )}
                         <span className="text-sm font-medium text-gray-700">{user.displayName}</span>
                       </div>
                       <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors">
                         <LogOut className="w-5 h-5" />
                       </button>
                     </div>
                   </div>
                ) : (
                  <button
                    onClick={() => { handleLogin(); setIsMenuOpen(false); }}
                    className="text-left text-sm font-medium text-gray-600 px-4 py-2 hover:bg-gray-50 rounded-lg"
                  >
                    Sign In
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsBookingModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="bg-purple-600 justify-center text-white px-6 py-3 rounded-xl text-sm font-medium mt-2 flex items-center gap-2"
                >
                  <CalendarPlus className="w-4 h-4" /> Book Appointment
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {view === 'dashboard'? (
        <Dashboard />
      ) : (
        <>
          {/* Hero Section */}
          <section className="pt-32 pb-16 md:pt-48 md:pb-32 px-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-purple-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-purple-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-start gap-6"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-xs font-semibold tracking-wide uppercase">
                  <MapPin className="w-3.5 h-3.5" />
                  Trusted Dental Care in Raipur
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1]">
                  A Brighter Smile <br/><span className="text-purple-600">Awaits You.</span>
                </h1>

                <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
                  Experience world-class dental care with Dr. Neha Sahu. We combine advanced technology with a gentle touch to bring you the best smile possible.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-full font-medium transition-all flex items-center justify-center gap-2 text-base group"
                  >
                    Book a Visit
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => scrollToSection('contact')}
                    className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-8 py-4 rounded-full font-medium transition-all flex items-center justify-center gap-2 text-base shadow-sm"
                  >
                    <Phone className="w-4 h-4 text-gray-500" />
                    Call +91 9874512301
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative pb-8"
              >
                 <div className="bg-white p-2 rounded-[2rem] shadow-xl shadow-purple-900/5 relative">
                    <img
                      src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=1200&h=1000"
                      alt="Modern Dental Clinic"
                      className="rounded-[1.5rem] w-full object-cover h-[400px] md:h-[500px]"
                    />

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-4"
                    >
                      <div className="bg-purple-100 text-purple-600 p-3 rounded-full">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium tracking-tight">Led by</p>
                        <p className="text-gray-900 font-bold">Dr. Neha Sahu</p>
                      </div>
                    </motion.div>
                 </div>
              </motion.div>
            </div>
          </section>

          {/* Features/Highlights */}
          <section className="py-12 bg-white border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
              {[
                { icon: <Award className="w-6 h-6"/>, title: 'Expert Team', desc: 'Highly qualified specialists led by Dr. Neha Sahu.' },
                { icon: <HeartPulse className="w-6 h-6"/>, title: 'Painless Treatments', desc: 'Modern equipment ensuring a comfortable experience.' },
                { icon: <Clock className="w-6 h-6"/>, title: 'Flexible Appointments', desc: 'We value your time with prompt scheduling.' },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="bg-purple-50 text-purple-600 p-3 rounded-xl shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Services Section */}
          <section id="services" className="py-24 px-4 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Comprehensive Dental Care</h2>
                <p className="text-gray-600 text-lg">We offer a full range of dental services to ensure your family maintains healthy, beautiful smiles for life.</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { id: 1, title: 'General Dentistry', desc: 'Routine check-ups, cleanings, and preventative care.', img: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=600&h=400' },
                  { id: 2, title: 'Cosmetic Dentistry', desc: 'Teeth whitening, veneers, and smile makeovers.', img: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&q=80&w=600&h=400' },
                  { id: 3, title: 'Orthodontics', desc: 'Traditional Braces and Clear Aligners for perfect alignment.', img: 'https://images.unsplash.com/photo-1493723843671-1d655e66ac1c?auto=format&fit=crop&q=80&w=600&h=400' },
                  { id: 4, title: 'Root Canal Treatment', desc: 'Painless endodontic therapy to save your natural teeth.', img: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600&h=400' },
                  { id: 5, title: 'Dental Implants', desc: 'Permanent and natural-looking tooth replacement solutions.', img: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600&h=400' },
                  { id: 6, title: 'Pediatric Dentistry', desc: 'Specialized, gentle care for your little one\'s oral health.', img: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=600&h=400' },
                ].map((service, idx) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer hover:shadow-xl hover:shadow-purple-900/5 transition-all"
                  >
                    <div className="h-48 overflow-hidden">
                      <img src={service.img} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                      <p className="text-gray-600 mb-4">{service.desc}</p>
                      <button onClick={() => setIsBookingModalOpen(true)} className="text-purple-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        Learn More <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Clinic Gallery Section */}
          <section id="gallery" className="py-24 px-4 bg-white border-y border-gray-100">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Take a Tour of Our Clinic</h2>
                <p className="text-gray-600 text-lg">A clean, modern, and relaxing environment designed for your comfort.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="col-span-2 row-span-2 h-64 md:h-full rounded-2xl overflow-hidden group">
                  <img src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1200" alt="Modern Dental Clinic Interior" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </motion.div>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="h-48 md:h-64 rounded-2xl overflow-hidden group">
                  <img src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=800" alt="Comfortable Reception Area" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </motion.div>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="h-48 md:h-64 rounded-2xl overflow-hidden group">
                  <img src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800" alt="Dental Care in Action" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </motion.div>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="col-span-2 h-48 md:h-64 rounded-2xl overflow-hidden group">
                  <img src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=1200" alt="Advanced Clinic Exterior & Setup" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </motion.div>
              </div>
            </div>
          </section>

          {/* Google Reviews Section */}
          <section id="reviews" className="py-24 px-4 bg-purple-50 border-b border-gray-100">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Loved by Raipur</h2>
                <p className="text-gray-600 text-lg">Don't just take our word for it. Here is what our patients have to say from our Google Reviews.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    name: "Rahul Tiwari",
                    date: "2 months ago",
                    review: "Dr. Neha is amazing! I had a painless root canal. The clinic in Shankar Nagar is very clean and the staff is extremely supportive. Highly recommended for anyone in Raipur.",
                    img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150&h=150",
                  },
                  {
                    name: "Shruti Verma",
                    date: "3 weeks ago",
                    review: "Beautiful clinic with modern facilities. The setup makes you feel relaxed immediately. Took my daughter for a check-up and Dr. Neha's pediatric care is top-notch.",
                    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
                  },
                  {
                    name: "Amit Patel",
                    date: "1 month ago",
                    review: "Best dental experience I've had. They explained the entire implant procedure clearly and the follow-ups were great. Excellent exterior and interior setup too!",
                    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
                  }
                ].map((testimonial, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between"
                  >
                    <div>
                      <Quote className="w-10 h-10 text-purple-100 mb-4" />
                      <p className="text-gray-700 mb-6 italic leading-relaxed">"{testimonial.review}"</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <img src={testimonial.img} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                      <div>
                        <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-500">{testimonial.date}</p>
                          <div className="flex text-yellow-500">
                            {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-500" />)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* About Section */}
          <section id="about" className="py-24 px-4 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-2 md:order-1"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Meet Dr. Neha Sahu</h2>
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  As the lead dentist and owner of SmileCare Dental Point, Dr. Neha Sahu brings years of expertise and a passion for creating beautiful, healthy smiles in Raipur.
                </p>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                  She believes in a patient-first approach, ensuring that every treatment is clearly explained and comfortably executed. Under her leadership, the clinic focuses on offering ethical, advanced, and affordable dental care.
                </p>

                <ul className="space-y-4">
                  {[
                    'Over 10 years of clinical experience',
                    'Advanced training in Cosmetic & Implant Dentistry',
                    'Committed to painless, patient-friendly treatments'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-800 font-medium">
                      <div className="bg-purple-50 text-purple-600 p-1 rounded-full"><Smile className="w-4 h-4"/></div>
                      {item}
                    </li>
                  ))}
                </ul>

              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-1 md:order-2 relative"
              >
                <div className="bg-purple-50 absolute inset-0 -m-6 rounded-[3rem] -rotate-3" />
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800&h=1000"
                  alt="Dr. Neha Sahu"
                  className="relative rounded-[2.5rem] w-full object-cover shadow-2xl h-[500px]"
                />
              </motion.div>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="py-24 px-4 bg-gray-900 text-white relative">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h2>
                  <p className="text-gray-400 text-lg">We're here to help you smile brighter. Visit us in Raipur or drop a message to book your slot.</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-gray-800 p-3 rounded-xl text-purple-400 shrink-0"><MapPin className="w-6 h-6" /></div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Clinic Address</h4>
                      <p className="text-gray-400 leading-relaxed">SmileCare Dental Point<br/>Shankar Nagar, Raipur<br/>Chhattisgarh, India</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-gray-800 p-3 rounded-xl text-purple-400 shrink-0"><Phone className="w-6 h-6" /></div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Phone Number</h4>
                      <p className="text-gray-400 text-lg font-mono tracking-wider">+91 9874512301</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-gray-800 p-3 rounded-xl text-purple-400 shrink-0"><Mail className="w-6 h-6" /></div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Email</h4>
                      <p className="text-gray-400">smilecare.raipur@gmail.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl text-gray-900 shadow-xl">
                <h3 className="text-2xl font-bold mb-6">Send us a message</h3>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Thanks for your message! Our reception will contact you shortly."); e.currentTarget.reset(); }}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Interested In</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all">
                      <option>General Checkup</option>
                      <option>Root Canal</option>
                      <option>Braces / Aligners</option>
                      <option>Teeth Whitening</option>
                      <option>Implants</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none" placeholder="How can we help you?"></textarea>
                  </div>
                  <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-xl transition-colors">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="bg-black text-gray-400 py-8 border-t border-gray-800 text-center">
        <div className="flex flex-col items-center justify-center gap-2">
           <div className="flex items-center gap-2">
              <Smile className="w-5 h-5 text-purple-500" />
              <span className="text-white font-bold text-lg tracking-tight">SmileCare <span className="font-normal text-sm text-gray-400">Dental Point</span></span>
            </div>
          <p>© {new Date().getFullYear()} SmileCare Dental Point. All rights reserved.</p>
        </div>
      </footer>

      {/* Booking Modal - FIXED: Single modal + reset pehle */}
      <AnimatePresence>
        {isBookingModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBookingModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-3xl shadow-2xl z-[70] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-xl font-bold text-gray-900">Request Appointment</h3>
                <button onClick={() => setIsBookingModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                className="p-6 space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!user) {
                    alert("Please sign in to book an appointment.");
                    handleLogin();
                    return;
                  }

                  setIsSubmitting(true);
                  try {
                    const formData = new FormData(e.currentTarget);

                    await addDoc(collection(db, 'bookings'), {
                      userId: user.uid,
                      patientName: formData.get('name'),
                      phoneNumber: formData.get('phone'),
                      service: formData.get('service'),
                      preferredDate: formData.get('date'),
                      timestamp: serverTimestamp(),
                    });

                    alert('Appointment request sent! Our team will contact you soon.');
                    setIsBookingModalOpen(false);
                    e.currentTarget.reset();
                  } catch (error) {
                    console.error('Error booking appointment:', error);
                    alert('Failed to book appointment. Please try again.');
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" name="name" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" name="phone" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" placeholder="+91 XXXXX XXXXX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                  <select name="service" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all">
                    <option>General Checkup</option>
                    <option>Root Canal</option>
                    <option>Braces / Aligners</option>
                    <option>Teeth Whitening</option>
                    <option>Implants</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                  <input type="date" name="date" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-4 rounded-xl transition-colors">
                  {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

async function signInWithGoogle() {
  await signInWithRedirect(auth, googleProvider);
}

function setAuthLoading(_value: boolean) {
  // No-op placeholder for auth loading state handling.
}

