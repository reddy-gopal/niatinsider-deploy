"use client";

import { useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CampusCard from '@/components/CampusCard';
import { useCampuses } from '@/hooks/useCampuses';
import { apiCampusToCampus, stateCountsFromCampuses } from '@/lib/campusUtils';

export default function CampusDirectory() {
  const { campuses: apiCampuses, isLoading, isError } = useCampuses();
  const [activeState, setActiveState] = useState('All');

  const campuses = useMemo(() => apiCampuses.map(apiCampusToCampus), [apiCampuses]);
  const stateCounts = useMemo(() => stateCountsFromCampuses(campuses), [campuses]);
  const filteredCampuses = activeState === 'All'
    ? campuses
    : campuses.filter(c => c.state === activeState);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* Page Header */}
      <section className="bg-section py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-black mb-3">
            15+ Universities Offer the NIAT Program
          </h1>
          <p className="text-black text-base md:text-lg max-w-2xl mx-auto">
            NIAT is offered at 15+ universities across India. Explore the universities where students are currently pursuing their degrees while being part of the NIAT ecosystem.
          </p>
        </div>
      </section>

      {isLoading && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
            <div className="animate-spin rounded-full border-2 border-[#fbf2f3] size-10 border-t-[#991b1b]" role="status" aria-label="Loading" />
          </div>
        </section>
      )}

      {isError && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-red-600 mb-4">Unable to load campuses. Please try again later.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-[#991b1b] text-white text-sm font-medium hover:bg-[#7f1d1d]"
            >
              Retry
            </button>
          </div>
        </section>
      )}

      {!isLoading && !isError && (
        <>
          {/* State Filter Tabs */}
          {stateCounts.length > 1 && (
            <section className="py-6 bg-white border-b border-[rgba(30,41,59,0.1)]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2">
                  {stateCounts.map((state) => (
                    <button
                      key={state.name}
                      onClick={() => setActiveState(state.name)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        activeState === state.name
                          ? 'bg-[#991b1b] text-white'
                          : 'bg-section text-black hover:text-black'
                      }`}
                    >
                      {state.name} ({state.count})
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Campus Grid */}
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {filteredCampuses.length === 0 ? (
                <p className="text-center text-[#64748b]">No campuses to show.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCampuses.map((campus) => (
                    <CampusCard key={campus.id} campus={campus} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      <Footer />
    </div>
  );
}
