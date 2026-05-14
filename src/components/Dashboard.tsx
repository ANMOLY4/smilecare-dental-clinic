import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, getDocs, where, updateDoc, doc } from 'firebase/firestore';
import { Calendar, Phone, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface Booking {
  id: string;
  patientName: string;
  phoneNumber: string;
  preferredDate: string;
  status: string;
  userId: string;
  createdAt: any;
}

export default function Dashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = auth.currentUser;
  const isAdmin = user?.email === 'anmlzgaming@gmail.com';

  useEffect(() => {
    if (!user) return;
    
    const fetchBookings = async () => {
      try {
        const bookingsRef = collection(db, 'bookings');
        
        let q;
        if (isAdmin) {
          q = query(bookingsRef);
        } else {
          q = query(bookingsRef, where('userId', '==', user.uid));
        }
        
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => {
          const data = doc.data() as Record<string, any>;
          return {
            id: doc.id,
            ...data
          };
        }) as Booking[];
        
        const sorted = fetched.sort((a,b) => new Date(b.createdAt?.toDate?.() || 0).getTime() - new Date(a.createdAt?.toDate?.() || 0).getTime());
        
        setBookings(sorted);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [user, isAdmin]);

  // Line 57 ke aas paas - updateStatus delete karke ye daal
  const handleConfirm = async (booking: Booking) => {
    try {
      // 1. Firestore update
      await updateDoc(doc(db, "bookings", booking.id), { status: "confirmed" });
      setBookings(bookings.map(b => b.id === booking.id ? {...b, status: "confirmed"} : b));

      // 2. WhatsApp open karo
      const msg = `Hi ${booking.patientName} 👋%0A%0ASmileCare Dental Point se appointment confirm ho gayi hai.%0A%0A📅 Date: ${new Date(booking.preferredDate).toLocaleDateString('en-IN')}%0A📍 Address: Shankar Nagar, Raipur%0A%0ATime ke liye hum call karenge. Koi doubt ho to +91 9874512301 pe call karein.%0A%0A- Dr. Neha Sahu`;
      
      const phoneNumber = booking.phoneNumber.replace(/\s+/g, '').replace('+', '').replace(/^91/, '');
      window.open(`https://wa.me/91${phoneNumber}?text=${msg}`, '_blank');
      
    } catch (err: any) {
      alert("Update failed: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 m-4 max-w-2xl mx-auto">
        <AlertCircle className="w-5 h-5" />
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-32 min-h-screen relative z-10">
      <div className="mb-8 border-b border-gray-100 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isAdmin ? "Admin Dashboard" : "My Appointments"}
          </h2>
          <p className="text-gray-500 mt-2">
            {isAdmin ? "Manage all patient bookings" : "Track your upcoming dental visits"}
          </p>
        </div>
        
        <div className="bg-purple-50 px-4 py-3 rounded-xl border border-purple-100 flex items-center gap-3">
           <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Calendar className="w-5 h-5" /></div>
           <div>
             <p className="text-sm text-purple-600 font-medium">Total Appointments</p>
             <p className="text-2xl font-bold text-purple-700 leading-none">{bookings.length}</p>
           </div>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No appointments found</h3>
          <p className="text-gray-500 mt-1">You haven't booked any appointments yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking, idx) => (
            <motion.div 
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-bold text-gray-900 text-lg">{booking.patientName}</h4>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize
                  ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : ''}
                  ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                  ${booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
                `}>
                  {booking.status}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  <span>{new Date(booking.preferredDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'})}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-purple-500" />
                  <span className="font-mono">{booking.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span>Requested on {new Date(booking.createdAt?.toDate?.() || 0).toLocaleDateString()}</span>
                </div>
              </div>
              
              {/* Line 147 ke aas paas - Button change kiya */}
              {isAdmin && booking.status === 'pending' && (
                <button 
                  onClick={() => handleConfirm(booking)}
                  className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl text-sm font-medium"
                >
                  Confirm Appointment
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}