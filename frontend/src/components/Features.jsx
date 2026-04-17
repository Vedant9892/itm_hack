import { motion } from 'framer-motion';
import { HiLightningBolt, HiFingerPrint, HiCube, HiShieldCheck } from 'react-icons/hi';
import { FaMicrochip, FaHeadset } from 'react-icons/fa6';

const Features = () => {
  const features = [
    {
      title: "AI Diagnostics",
      desc: "Advanced neural networks analyzing your vitals for early detection.",
      icon: <FaMicrochip />,
      color: "bg-blue-50 text-brand-primary"
    },
    {
      title: "Secure Data",
      desc: "Military-grade encryption for all your medical records and biometrics.",
      icon: <HiShieldCheck />,
      color: "bg-emerald-50 text-brand-secondary"
    },
    {
      title: "24/7 Support",
      desc: "Real-time assistance from our medical team and AI concierge.",
      icon: <FaHeadset />,
      color: "bg-rose-50 text-brand-accent"
    },
    {
      title: "Bento Analytics",
      desc: "Clean, high-density visualization of your health progression.",
      icon: <HiCube />,
      color: "bg-slate-50 text-slate-600"
    }
  ];

  return (
    <section id="services" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-sm font-bold text-brand-primary uppercase tracking-[0.2em] mb-4">Core Ecosystem</h2>
          <h3 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Designed for Reliability.</h3>
          <p className="text-slate-500 leading-relaxed">
            Our platform integrates the latest in biotech and artificial intelligence to deliver a seamless healthcare experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, idx) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="p-8 rounded-3xl border border-slate-100 bg-white hover:shadow-2xl hover:shadow-blue-500/10 transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 transition-transform group-hover:scale-110 ${f.color}`}>
                {f.icon}
              </div>
              <h4 className="text-xl font-bold mb-3">{f.title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
