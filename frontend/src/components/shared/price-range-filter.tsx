type PriceRangeFilterProps = {
  min?: number;
  max?: number;
  step?: number;
  value: number | null;
  onChange: (value: number | null) => void;
};

export function PriceRangeFilter({
  min = 300,
  max = 10000,
  step = 100,
  value,
  onChange,
}: PriceRangeFilterProps) {
  const isAny = value === null || value === undefined || value >= max;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#6d4c56]">
          Price Range (per hour)
        </div>
        {!isAny && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[11px] font-semibold text-[#7a1f39] hover:underline cursor-pointer"
          >
            Clear (Any Price)
          </button>
        )}
      </div>

      <div className="rounded-xl border border-[#e5dbe0] bg-white p-3.5 space-y-2.5">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-[#5a1d2d]">
          <span>Starting ₹{min}</span>
          <span className="rounded-full bg-[#fcedf0] px-2.5 py-0.5 text-xs text-[#7a1f39] font-bold">
            {isAny ? "Any Price (No limit)" : `Up to ₹${value.toLocaleString("en-IN")}/hr`}
          </span>
        </div>

        <div className="relative pt-1">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={isAny ? max : value}
            onChange={(event) => {
              const val = Number(event.target.value);
              if (val >= max) {
                onChange(null);
              } else {
                onChange(val);
              }
            }}
            className="h-2 w-full cursor-pointer accent-[#7a1f39]"
            aria-label="Price range"
          />

          <div className="mt-2 flex items-center justify-between text-xs font-medium text-[#7a1f39]">
            <span>₹{min}</span>
            <span>₹{max.toLocaleString("en-IN")}+</span>
          </div>
        </div>
      </div>
    </div>
  );
}
