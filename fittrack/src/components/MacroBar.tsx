interface MacroBarProps {
  label: string
  consumed: number
  target: number
  color: string
}

export function MacroBar({ label, consumed, target, color }: MacroBarProps) {
  const pct = Math.min((consumed / target) * 100, 100)
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">{Math.round(consumed)}g / {target}g</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
