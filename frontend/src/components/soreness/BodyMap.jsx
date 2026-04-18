// BodyMap.jsx — Interactive SVG anatomical diagram (front & back)
const FRONT_MUSCLES = [
  { id: 'chest', label: 'Chest', d: 'M155,120 Q180,110 205,120 Q210,145 205,160 Q180,168 155,160 Q150,145 155,120Z' },
  { id: 'left_shoulder', label: 'Left Shoulder', d: 'M130,115 Q150,105 155,120 Q150,140 140,145 Q125,135 120,120 Q122,112 130,115Z' },
  { id: 'right_shoulder', label: 'Right Shoulder', d: 'M205,120 Q210,105 230,115 Q238,112 240,120 Q235,135 220,145 Q210,140 205,120Z' },
  { id: 'left_bicep', label: 'Left Bicep', d: 'M118,148 Q130,143 138,155 Q135,175 128,185 Q116,180 112,165 Q113,155 118,148Z' },
  { id: 'right_bicep', label: 'Right Bicep', d: 'M222,148 Q230,143 242,148 Q247,155 248,165 Q244,180 232,185 Q225,175 222,155Z' },
  { id: 'abs', label: 'Abs', d: 'M162,168 Q180,162 198,168 Q202,195 198,225 Q180,230 162,225 Q158,195 162,168Z' },
  { id: 'obliques', label: 'Obliques', d: 'M148,168 Q162,165 162,225 Q155,235 145,230 Q138,210 140,185 Q143,172 148,168Z M198,168 Q212,172 220,185 Q222,210 215,230 Q205,235 198,225 Q198,165 198,168Z' },
  { id: 'quadriceps', label: 'Quadriceps', d: 'M158,238 Q175,233 192,238 Q196,265 193,295 Q175,300 157,295 Q154,265 158,238Z' },
  { id: 'left_calf', label: 'Left Calf', d: 'M157,335 Q168,330 175,335 Q177,360 174,385 Q165,390 157,385 Q154,360 157,335Z' },
  { id: 'right_calf', label: 'Right Calf', d: 'M185,335 Q193,330 203,335 Q206,360 203,385 Q194,390 186,385 Q183,360 185,335Z' },
  { id: 'forearms', label: 'Forearms', d: 'M108,188 Q118,183 124,195 Q122,215 116,225 Q106,222 103,208 Q104,196 108,188Z M236,188 Q246,196 247,208 Q244,222 234,225 Q228,215 226,195 Q232,183 236,188Z' },
];

const BACK_MUSCLES = [
  { id: 'traps', label: 'Traps', d: 'M155,110 Q180,100 205,110 Q210,130 205,140 Q180,145 155,140 Q150,130 155,110Z' },
  { id: 'rear_delts', label: 'Rear Delts', d: 'M128,112 Q150,108 155,120 Q150,138 138,142 Q122,132 120,118 Q122,112 128,112Z M205,120 Q210,108 232,112 Q240,118 240,132 Q228,142 216,138 Q210,130 205,120Z' },
  { id: 'lats', label: 'Lats', d: 'M145,145 Q162,138 162,200 Q150,210 138,205 Q128,185 128,165 Q133,148 145,145Z M198,138 Q215,145 232,165 Q232,185 222,205 Q210,210 198,200 Q198,138 198,138Z' },
  { id: 'lower_back', label: 'Lower Back', d: 'M162,200 Q180,195 198,200 Q202,220 198,240 Q180,245 162,240 Q158,220 162,200Z' },
  { id: 'triceps', label: 'Triceps', d: 'M115,148 Q128,143 135,155 Q132,175 124,185 Q112,178 110,165 Q111,155 115,148Z M225,148 Q249,155 250,165 Q248,178 236,185 Q228,175 225,155 Q232,143 225,148Z' },
  { id: 'glutes', label: 'Glutes', d: 'M158,245 Q180,238 202,245 Q208,268 202,285 Q180,292 158,285 Q152,268 158,245Z' },
  { id: 'hamstrings', label: 'Hamstrings', d: 'M158,290 Q175,284 192,290 Q196,318 192,345 Q175,350 158,345 Q154,318 158,290Z' },
];

const BodyMap = ({ selectedMuscles, onToggle, view }) => {
  const muscles = view === 'front' ? FRONT_MUSCLES : BACK_MUSCLES;

  return (
    <svg
      viewBox="0 0 360 420"
      className="w-full h-full select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="bodyGrad" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Body silhouette */}
      <g opacity="0.18">
        {/* Head */}
        <ellipse cx="180" cy="62" rx="30" ry="36" fill="url(#bodyGrad)" />
        {/* Neck */}
        <rect x="168" y="94" width="24" height="18" rx="6" fill="url(#bodyGrad)" />
        {/* Torso */}
        <rect x="135" y="110" width="90" height="135" rx="18" fill="url(#bodyGrad)" />
        {/* Left arm */}
        <rect x="105" y="110" width="32" height="120" rx="14" fill="url(#bodyGrad)" />
        {/* Right arm */}
        <rect x="223" y="110" width="32" height="120" rx="14" fill="url(#bodyGrad)" />
        {/* Legs */}
        <rect x="138" y="242" width="38" height="170" rx="16" fill="url(#bodyGrad)" />
        <rect x="184" y="242" width="38" height="170" rx="16" fill="url(#bodyGrad)" />
      </g>

      {/* Muscle regions */}
      {muscles.map((m) => {
        const active = selectedMuscles.includes(m.id);
        return (
          <path
            key={m.id}
            d={m.d}
            fill={active ? '#2563eb' : '#cbd5e1'}
            fillOpacity={active ? 0.85 : 0.5}
            stroke={active ? '#1d4ed8' : '#94a3b8'}
            strokeWidth={active ? 2 : 1}
            className="cursor-pointer transition-all duration-200 hover:fill-blue-400 hover:fill-opacity-70"
            style={{ filter: active ? 'drop-shadow(0 0 6px #2563eb88)' : 'none' }}
            onClick={() => onToggle(m.id)}
          >
            <title>{m.label}{active ? ' ✓ Selected' : ''}</title>
          </path>
        );
      })}
    </svg>
  );
};

export default BodyMap;
