import { motion } from 'framer-motion';

const Stats = () => {
  const stats = [
    { label: 'Network Accuracy', value: '99.9%' },
    { label: 'Active Users', value: '1.2M+' },
    { label: 'Data Points', value: '500TB+' },
    { label: 'Certifications', value: '15+' },
  ];

  return (
    <section className="py-20 bg-brand-primary overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 border-2 border-white rounded-full animate-ping" />
        <div className="absolute bottom-10 right-10 w-96 h-96 border-2 border-white rounded-full animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
            >
              <div className="text-4xl md:text-6xl font-extrabold text-white mb-2 tracking-tighter">
                {stat.value}
              </div>
              <div className="text-blue-100 text-xs md:text-sm font-bold uppercase tracking-widest opacity-80">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
