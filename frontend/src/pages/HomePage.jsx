import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, setLoading, setError } from '../store/slices/authSlice';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Stats from '../components/Stats';
import Footer from '../components/Footer';
import userService from '../services/userService';
import { motion } from 'framer-motion';

const HomePage = () => {
  const dispatch = useDispatch();
  const { user: userProfile, loading, error } = useSelector((state) => state.auth);

  // Example of API integration with Redux
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(setLoading(true));
        
        // This is now a real Axios call via userService
        const data = await userService.getProfile();
        dispatch(setUser(data));
      } catch (err) {
        console.error('Error fetching profile:', err);
        dispatch(setError(err.message));
        
        // OPTIONAL: Fallback to mock data if you want to keep the UX perfect for demoing
        /*
        dispatch(setUser({
          name: 'Demo User',
          age: 28,
          bloodGroup: 'O+',
          healthScore: 85
        }));
        */
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchData();
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar />
      
      <main>
        <Hero />
        
        {/* Global Error Alert */}
        {error && (
          <div className="max-w-7xl mx-auto px-6 mt-4">
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center justify-between text-rose-600 text-sm">
              <p><strong>Note:</strong> API Connection failed. Ensure your backend is running at http://localhost:5000</p>
            </div>
          </div>
        )}

        {/* API Demonstration Section (Conditional Rendering from Redux) */}
        {!loading && userProfile && (
          <section className="py-12 bg-white/50 border-y border-slate-100">
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
                  {userProfile.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global State (Redux)</p>
                  <p className="text-sm font-semibold text-slate-800">Welcome, {userProfile.name}</p>
                </div>
              </div>
              <div className="hidden md:flex gap-8">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Health Score</p>
                  <p className="text-sm font-bold text-brand-secondary">{userProfile.healthScore}%</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Blood Group</p>
                  <p className="text-sm font-bold text-slate-800">{userProfile.bloodGroup}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {loading && (
          <div className="py-12 animate-pulse text-center text-slate-400 text-xs font-bold uppercase">
            Fetching Global State...
          </div>
        )}

        <Features />
        <Stats />

        {/* Call to Action Section */}
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-6 md:px-12 text-center bg-slate-900 rounded-[3rem] p-16 relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Ready to optimize your <span className="text-brand-primary">Precision Care?</span>
              </h2>
              <p className="text-slate-400 mb-10 max-w-xl mx-auto">
                Join thousands of healthcare professionals and individuals using our AI ecosystem to drive better outcomes.
              </p>
              <button className="btn-primary mx-auto">
                Start Free Trial
              </button>
            </motion.div>
          </div>
          
          <div className="absolute top-1/2 left-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-secondary/10 rounded-full blur-3xl -z-10" />
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
