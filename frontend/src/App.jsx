import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

export default function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <div className="max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-indigo-400">
          Neural-Fit AI v3
        </h1>
        <p className="mt-4 text-slate-400">
          Architecture Layer: **Presentation** <br />
          Status: **Tailwind v3 Active**
        </p>
        <button className="mt-6 w-full text-red-500 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500 transition-colors">
          Start Training
        </button>
      </div>
    </main>
  )
}