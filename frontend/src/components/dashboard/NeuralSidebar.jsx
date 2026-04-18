import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { 
  HiOutlineHome, 
  HiOutlineClipboardDocumentList, 
  HiOutlineCpuChip, 
  HiOutlineCog6Tooth,
  HiOutlineArrowLeftOnRectangle,
  HiChevronDoubleLeft,
  HiChevronDoubleRight,
  HiOutlineDevicePhoneMobile,
  HiOutlineFire,
} from 'react-icons/hi2';

const NeuralSidebar = ({ isCollapsed, setCollapsed }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const menuItems = [
    { name: 'Dashboard', icon: <HiOutlineCpuChip />, path: '/dashboard' },
    { name: 'Fix Soreness', icon: <HiOutlineFire />, path: '/soreness' },
    { name: 'Smart Devices', icon: <HiOutlineDevicePhoneMobile />, path: '/smart-devices' },
    { name: 'Reports', icon: <HiOutlineClipboardDocumentList />, path: null },
    { name: 'Anatomy', icon: <HiOutlineHome />, path: null },
    { name: 'Settings', icon: <HiOutlineCog6Tooth />, path: null },
  ];

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 100 : 280 }}
      className="hidden lg:flex flex-col bg-white border-r border-slate-100 relative z-50 transition-all duration-500 overflow-hidden"
    >
      
      {/* Brand Section */}
      <div className="p-8 flex items-center gap-4">
        <div className="w-10 h-10 bg-brand-primary rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg shadow-blue-500/20 group hover:rotate-12 transition-transform">
          <HiOutlineCpuChip className="text-white text-2xl" />
        </div>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="font-bold text-lg tracking-tight text-slate-900 leading-none">PrecisionAI</span>
            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mt-1">Version 1.0</span>
          </motion.div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 mt-10 px-6 space-y-4">
        {menuItems.map((item) => {
          const isActive = item.path ? location.pathname === item.path : false;
          return (
            <motion.div 
              key={item.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => item.path && navigate(item.path)}
              className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 group ${
                isActive
                  ? 'bg-brand-primary/5 text-brand-primary border border-brand-primary/10'
                  : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className={`text-2xl transition-colors ${isActive ? 'text-brand-primary' : 'group-hover:text-brand-primary'}`}>
                {item.icon}
              </span>
              {!isCollapsed && <span className="text-sm font-bold whitespace-nowrap">{item.name}</span>}
              
              {/* Active Indicator Dot */}
              {isActive && !isCollapsed && (
                <div className="ml-auto w-1.5 h-1.5 bg-brand-primary rounded-full" />
              )}
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-6 space-y-4">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 p-4 w-full text-slate-400 hover:text-rose-500 transition-all duration-300 group"
        >
          <HiOutlineArrowLeftOnRectangle className="text-2xl group-hover:-translate-x-1 transition-transform" />
          {!isCollapsed && <span className="text-[10px] font-bold uppercase tracking-widest">Logout</span>}
        </button>

        <button 
          onClick={() => setCollapsed(!isCollapsed)}
          className="hidden md:flex items-center justify-center p-3 w-full bg-slate-50 rounded-xl border border-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
        >
          {isCollapsed ? <HiChevronDoubleRight /> : <HiChevronDoubleLeft />}
        </button>
      </div>

    </motion.aside>
  );
};

export default NeuralSidebar;
