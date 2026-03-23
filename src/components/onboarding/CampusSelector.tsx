import { useMemo, useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, MapPin } from 'lucide-react';
import { useCampuses } from '../../hooks/useCampuses';
import type { CampusListItem } from '../../types/campusApi';

export interface CampusSelectorProps {
  value: string | null;
  onChange: (id: string) => void;
}

function filterCampuses(campuses: CampusListItem[], q: string): CampusListItem[] {
  const lower = q.trim().toLowerCase();
  if (!lower) return campuses;
  return campuses.filter(
    (c) =>
      c.name.toLowerCase().includes(lower) ||
      (c.shortName?.toLowerCase().includes(lower) ?? false) ||
      c.location.toLowerCase().includes(lower) ||
      c.state.toLowerCase().includes(lower)
  );
}

export function CampusSelector({ value, onChange }: CampusSelectorProps) {
  const { campuses, isLoading, isError } = useCampuses();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCampus = useMemo(
    () => (value ? campuses.find((c) => String(c.id) === value) : null),
    [campuses, value]
  );
  const filtered = useMemo(() => filterCampuses(campuses, search), [campuses, search]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (idStr: string) => {
    onChange(idStr);
    setIsOpen(false);
    setSearch('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="animate-spin rounded-full border-2 border-[#fbf2f3] size-8 border-t-[#991b1b]" role="status" aria-label="Loading" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-red-600">Unable to load campuses. Please try again.</p>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger: looks like an input, opens list on click */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl border-2 border-[rgba(30,41,59,0.2)] bg-white text-left transition-all hover:border-[#991b1b]/40 focus:outline-none focus:ring-2 focus:ring-[#991b1b] focus:border-[#991b1b]"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={selectedCampus ? `Selected: ${selectedCampus.name}` : 'Select your college'}
      >
        {selectedCampus ? (
          <>
            <img
              src={selectedCampus.imageUrl}
              alt=""
              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="font-medium text-[#1e293b] block truncate">
                {selectedCampus.name}
                {selectedCampus.isDeemed && (
                  <span className="ml-1 text-xs text-[#64748b] font-normal">(Deemed)</span>
                )}
              </span>
              <span className="text-xs text-[#64748b] flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                {selectedCampus.location}, {selectedCampus.state}
              </span>
            </div>
          </>
        ) : (
          <span className="text-[#64748b] flex items-center gap-2">
            <Search className="h-4 w-4 flex-shrink-0 text-[#94a3b8]" />
            Search or select your college…
          </span>
        )}
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 text-[#64748b] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className="absolute z-50 mt-2 w-full rounded-xl border border-[rgba(30,41,59,0.12)] bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          role="listbox"
          aria-label="Campus list"
        >
          {/* Search inside dropdown - filter as you type */}
          <div className="p-2 border-b border-[rgba(30,41,59,0.08)] bg-[#f8fafc]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Filter by name, city, or state…"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-[rgba(30,41,59,0.15)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b] focus:border-[#991b1b]"
                aria-label="Filter campuses"
                autoFocus
              />
            </div>
            <p className="mt-1.5 text-xs text-[#64748b]">
              {filtered.length} {filtered.length === 1 ? 'campus' : 'campuses'}
            </p>
          </div>

          {/* Scrollable list: content-visibility + lazy images + light transitions = smooth scroll */}
          <div className="max-h-72 overflow-y-auto overscroll-contain py-1 [-webkit-overflow-scrolling:touch]">
            {filtered.length === 0 ? (
              <p className="p-4 text-sm text-[#64748b] text-center">No campuses match your search.</p>
            ) : (
              <ul className="space-y-0.5 px-2 pb-2">
                {filtered.map((campus) => {
                  const idStr = String(campus.id);
                  const selected = value === idStr;
                  return (
                    <li
                      key={campus.id}
                      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 72px' }}
                    >
                      <button
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => handleSelect(idStr)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors border-2 ${
                          selected
                            ? 'border-[#991b1b] bg-[#991b1b]/10 ring-2 ring-[#991b1b]/20'
                            : 'border-transparent hover:bg-[#fbf2f3] hover:border-[#991b1b]/20 active:bg-[#991b1b]/5'
                        }`}
                      >
                        <img
                          src={campus.imageUrl}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-[rgba(30,41,59,0.06)]"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-[#1e293b] block">
                            {campus.name}
                            {campus.isDeemed && (
                              <span className="ml-1 text-xs text-[#64748b] font-normal">(Deemed)</span>
                            )}
                          </span>
                          <p className="text-xs text-[#64748b] flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            {campus.location}, {campus.state}
                          </p>
                        </div>
                        {selected && (
                          <span className="text-xs font-medium text-[#991b1b] flex-shrink-0">Selected</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
