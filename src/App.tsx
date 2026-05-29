import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Chatbot from './components/Chatbot';
import Dashboard from './components/Dashboard';
import { auth, googleProvider, db } from './firebase';
import { signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';
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
  const [authLoading, setAuthLoading] = useState(true); // NAYA

  useEffect(() => {
    const checkRedirect = async () => {
      try {
        // 1. Pehle redirect result check karo
        const result = await getRedirectResult(auth);
        if (result) {
          console.log("Login success:", result.user.email);
        }
      } catch (error) {
        console.error("Redirect error:", error);
      } finally {
        // 2. Uske baad auth state suno
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setAuthLoading(false);
        });
        return unsubscribe;
      }
    };

    checkRedirect();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
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

  // Loading screen dikhao jab tak auth check ho raha
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="bg-purple-500 text-white p-3 rounded-xl inline-block mb-4">
            <Smile className="w-8 h-8 animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

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

          {/* Baaki sections same rehne de... */}
          {/* Features, Services, Gallery, Reviews, About, Contact - sab same */}

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

      {/* Booking Modal */}
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
                  {isSubmitting? 'Booking...' : 'Confirm Appointment'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}