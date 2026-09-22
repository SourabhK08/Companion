type PriceRangeFilterProps = {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
};

export function PriceRangeFilter({
  min,
  max,
  value,
  onChange,
}: PriceRangeFilterProps) {
  return (
    <div className="space-y-2">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6d4c56]">
        Price Range
      </div>

      <div className="rounded-xl border border-[#e5dbe0] bg-white p-2.5">
        <div className="mb-3 flex items-center justify-between text-[12px] font-semibold text-[#5a1d2d]">
          <span>₹{min}</span>
          <span>₹{min} - ₹{value}</span>
        </div>

        <div className="relative pt-2">
          <input
            type="range"
            min={min}
            max={max}
            step={50}
            value={value}
            onChange={(event) => onChange(Number(event.target.value))}
            className="h-2 w-full cursor-pointer accent-[#7a1f39]"
            aria-label="Price range"
          />

          <div className="mt-2 flex items-center justify-between text-[10px] font-medium text-[#7a1f39]">
            <span>₹{min}</span>
            <span>₹{max}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
