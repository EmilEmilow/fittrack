interface CalorieRingProps {
  consumed: number
  target: number
}

export function CalorieRing({ consumed, target }: CalorieRingProps) {
  const pct = target > 0 ? Math.min((consumed / target) * 100, 100) : 0
  const r = 54
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const over = consumed > target

  return (
    <div className="flex flex-col items-center">
      <svg width="150" height="150" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke={over ? '#ef4444' : '#22c55e'}
          strokeWidth="12"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
        <text x="60" y="53" textAnchor="middle" fontSize="17" fontWeight="700" fill="#111">
          {Math.round(consumed)}
        </text>
        <text x="60" y="68" textAnchor="middle" fontSize="10" fill="#6b7280">
          of {target} kcal
        </text>
      </svg>
      <p className={`text-sm mt-1 ${over ? 'text-red-500' : 'text-gray-500'}`}>
        {over
          ? `${Math.round(consumed - target)} kcal over goal`
          : `${Math.round(target - consumed)} kcal remaining`}
      </p>
    </div>
  )
}
