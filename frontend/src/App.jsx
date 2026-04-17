import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

export default function App() {
  const colors = [
    { name: 'Foundation', class: 'bg-brand-bg', hex: '#f8fafc', text: 'text-slate-900' },
    { name: 'Surface', class: 'bg-brand-surface', hex: '#ffffff', text: 'text-slate-900' },
    { name: 'Trust (Primary)', class: 'bg-brand-primary', hex: '#2563eb', text: 'text-white' },
    { name: 'Vitality (Health)', class: 'bg-brand-secondary', hex: '#10b981', text: 'text-white' },
    { name: 'Alert (Accent)', class: 'bg-brand-accent', hex: '#f43f5e', text: 'text-white' },
    { name: 'Muted', class: 'bg-brand-muted', hex: '#64748b', text: 'text-white' },
  ]

  return (
    <main className="min-h-screen bg-brand-bg p-8 md:p-24 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        <header className="mb-16">
          <h1 className="text-4xl font-bold tracking-tighter text-brand-primary">Precision Health v1.0</h1>
          <p className="mt-2 text-brand-muted uppercase tracking-widest text-xs font-bold">Health-Tech Color System</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {colors.map((color) => (
            <div 
              key={color.name} 
              className={`${color.class} ${color.text} aspect-video rounded-3xl p-8 flex flex-col justify-between shadow-sm border border-slate-200 transition-all hover:shadow-xl hover:-translate-y-1`}
            >
              <span className="font-bold tracking-tight text-lg">{color.name}</span>
              <span className="font-mono text-sm opacity-60">{color.hex}</span>
            </div>
          ))}
        </div>

        <div className="mt-24 p-12 bg-brand-surface rounded-[3rem] shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold mb-4 text-brand-primary">Clinical Reasoning</h2>
          <p className="text-brand-muted leading-relaxed max-w-2xl">
            This palette is optimized for medical-grade reliability. The **Trust Blue** reinforces authority and safety, 
            while the **Vitality Teal** provides a calming biological signal. The high-contrast **Slate Foundation** 
            ensures maximum readability for complex biometric data.
          </p>
        </div>
      </div>
    </main>
  )
}