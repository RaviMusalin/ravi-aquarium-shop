import type { ProductFilters } from "../types";

type Props = {
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
};

export default function FilterBar({ filters, onChange }: Props) {
  return (
    <div className="filter-bar">
      <input
        type="search"
        placeholder="Search products…"
        value={filters.q ?? ""}
        onChange={(e) => onChange({ ...filters, q: e.target.value })}
      />

      <select
        value={filters.category ?? ""}
        onChange={(e) =>
          onChange({ ...filters, category: e.target.value || undefined })
        }
      >
        <option value="">All categories</option>
        <option value="fish">Fish</option>
        <option value="tank">Tanks</option>
        <option value="filter">Filters</option>
        <option value="plant">Plants</option>
        <option value="food">Food</option>
        <option value="treatment">Treatments</option>
      </select>

      <select
        value={filters.waterType ?? ""}
        onChange={(e) =>
          onChange({ ...filters, waterType: e.target.value || undefined })
        }
      >
        <option value="">Any water type</option>
        <option value="freshwater">Freshwater</option>
        <option value="saltwater">Saltwater</option>
      </select>

      <label>
        <input
          type="checkbox"
          checked={filters.inStock ?? false}
          onChange={(e) => onChange({ ...filters, inStock: e.target.checked })}
        />{" "}
        In stock only
      </label>

      <button onClick={() => onChange({})}>Clear</button>
    </div>
  );
}