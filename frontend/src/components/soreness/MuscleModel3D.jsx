const REGIONS = [
  { id: 'chest', label: 'Chest', side: 'front' },
  { id: 'left_shoulder', label: 'Left Shoulder', side: 'front' },
  { id: 'right_shoulder', label: 'Right Shoulder', side: 'front' },
  { id: 'left_bicep', label: 'Left Bicep', side: 'front' },
  { id: 'right_bicep', label: 'Right Bicep', side: 'front' },
  { id: 'abs', label: 'Abs', side: 'front' },
  { id: 'obliques', label: 'Obliques', side: 'front' },
  { id: 'quadriceps', label: 'Quadriceps', side: 'front' },
  { id: 'left_calf', label: 'Left Calf', side: 'front' },
  { id: 'right_calf', label: 'Right Calf', side: 'front' },
  { id: 'forearms', label: 'Forearms', side: 'front' },

  { id: 'traps', label: 'Traps', side: 'back' },
  { id: 'rear_delts', label: 'Rear Delts', side: 'back' },
  { id: 'lats', label: 'Lats', side: 'back' },
  { id: 'lower_back', label: 'Lower Back', side: 'back' },
  { id: 'triceps', label: 'Triceps', side: 'back' },
  { id: 'glutes', label: 'Glutes', side: 'back' },
  { id: 'hamstrings', label: 'Hamstrings', side: 'back' }
];

export default function MuscleModel3D({ selectedMuscles, onToggle, view }) {
  const regions = REGIONS.filter((r) => r.side === view);

  return (
    <div className="h-full w-full rounded-[2rem] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-3 md:p-4 flex flex-col gap-3">
      <div className="relative rounded-[1.35rem] overflow-hidden border border-white/10 bg-black/50 min-h-[220px] flex-1">
        <iframe
          title="Male Muscle Anatomy 3D"
          src="https://sketchfab.com/models/33162ec759e04d2985dbbdf4ec908d66/embed?autospin=0.25&autostart=1&ui_theme=dark&ui_infos=0&ui_controls=1"
          className="absolute inset-0 h-full w-full"
          allow="autoplay; fullscreen; xr-spatial-tracking"
          allowFullScreen
        />

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-white/70 bg-slate-950/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
          <span>Sketchfab Anatomy Model</span>
          <span>{view === 'front' ? 'Front Selection' : 'Back Selection'}</span>
        </div>
      </div>

      <div className="rounded-[1rem] border border-white/10 bg-white/5 p-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-2">Select Muscle Regions</p>
        <div className="flex flex-wrap gap-2">
          {regions.map((region) => {
            const active = selectedMuscles.includes(region.id);
            return (
              <button
                key={region.id}
                onClick={() => onToggle(region.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors ${
                  active
                    ? 'bg-emerald-400/20 text-emerald-200 border-emerald-300/60'
                    : 'bg-white/5 text-white/70 border-white/20 hover:bg-white/10 hover:text-white'
                }`}
              >
                {region.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
