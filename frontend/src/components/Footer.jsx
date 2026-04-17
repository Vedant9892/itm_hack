import { FaStethoscope, FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa6';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center gap-2 text-white mb-6">
              <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                <FaStethoscope className="text-lg" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Precision<span className="text-brand-primary">Health</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Next-generation healthcare intelligence platform. Empowering practitioners and patients with AI-driven diagnostics.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors text-xl"><FaTwitter /></a>
              <a href="#" className="hover:text-white transition-colors text-xl"><FaLinkedin /></a>
              <a href="#" className="hover:text-white transition-colors text-xl"><FaGithub /></a>
            </div>
          </div>

          <div>
            <h5 className="text-white font-bold mb-6">Company</h5>
            <ul className="space-y-4 text-sm font-medium">
              <li><a href="#" className="hover:text-brand-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold mb-6">Resources</h5>
            <ul className="space-y-4 text-sm font-medium">
              <li><a href="#" className="hover:text-brand-primary transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">API Status</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Whitepapers</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Help Center</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold mb-6">Newsletter</h5>
            <p className="text-sm mb-4">Get the latest updates in your inbox.</p>
            <form className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="bg-slate-800 border-none rounded-lg px-4 py-2 text-sm w-full focus:ring-2 focus:ring-brand-primary outline-none"
              />
              <button className="bg-brand-primary text-white p-2 rounded-lg hover:bg-blue-600 transition-colors">
                Go
              </button>
            </form>
          </div>

        </div>
        
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-widest">
          <p>© 2026 PRECISION HEALTH INC. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Sitemap</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
