"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { allHealthcareCentres, HealthcareCentre } from '@/data/healthcare-centres';
import { useMemo } from 'react';

const countries = [
  { code: 'NG', name: 'Nigeria', states: [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ]}
  // Add more countries here in the future
];

const categoryOptions = [
  { value: 'all', label: 'All' },
  { value: 'Federal Medical Centre', label: 'Federal Medical Centres' },
  { value: 'Specialty Hospital', label: 'Specialty Hospitals' },
  { value: 'Teaching Hospital', label: 'Teaching Hospitals' },
  { value: 'NHIA Practitioner', label: 'NHIA Practitioners' },
];

export default function CentresPage() {
  const [selectedCountry, setSelectedCountry] = useState('NG');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 30;

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(e.target.value);
    setSelectedState('');
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(e.target.value);
  };

  const countryObj = countries.find(c => c.code === selectedCountry);
  const stateOptions = countryObj ? countryObj.states : [];

  const filteredCentres = useMemo(() => {
    return allHealthcareCentres.filter((centre: HealthcareCentre) => {
      const matchesCategory = selectedCategory === 'All' || centre.category === selectedCategory;
      const matchesSearch = centre.name.toLowerCase().includes(search.toLowerCase()) || centre.address.toLowerCase().includes(search.toLowerCase());
      const matchesState = !selectedState || centre.address.toLowerCase().includes(selectedState.toLowerCase());
      return matchesCategory && matchesSearch && matchesState;
    });
  }, [search, selectedCategory, selectedState]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCentres.length / resultsPerPage);
  const paginatedCentres = filteredCentres.slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage);

  return (
    <div className="w-full max-w-3xl mx-auto py-10">
      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-blue-700 mb-2 text-center w-full">HealthCare Directory</CardTitle>
          <div className="flex flex-row flex-wrap gap-2 items-center bg-blue-50/50 p-3 rounded-xl shadow-sm">
            <select
              value={selectedCountry}
              onChange={handleCountryChange}
              className="text-sm px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition w-32"
              aria-label="Country"
            >
              {countries.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
            <select
              value={selectedState}
              onChange={handleStateChange}
              className="text-sm px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition w-32"
              aria-label="State"
            >
              <option value="">State...</option>
              {stateOptions.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <Input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or location..."
              className="text-sm px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition w-64"
              aria-label="Search by name or location"
            />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="text-sm px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition w-32"
              aria-label="Filter by hospital category"
            >
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-4">
            {paginatedCentres.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No results found.</div>
            ) : (
              <ul className="space-y-4">
                {paginatedCentres.map((centre: HealthcareCentre) => (
                  <li key={centre.id} className="border rounded-lg p-4 shadow-sm bg-white">
                    <div className="font-semibold text-lg text-primary">{centre.name}</div>
                    <div className="text-sm text-muted-foreground">{centre.address}</div>
                    {centre.website && (
                      <a
                        href={centre.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                      >
                        Visit Website
                      </a>
                    )}
                    <div className="text-xs mt-1">Services: {centre.services.join(', ')}</div>
                    <div className="text-xs mt-1">Category: {centre.category}</div>
                    <div className="text-xs mt-1">Walk-ins: {centre.acceptsWalkIn ? <span className="text-green-600 font-medium">Accepted</span> : <span className="text-red-600 font-medium">Not accepted / By appointment</span>}</div>
                  </li>
                ))}
              </ul>
            )}
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded bg-blue-100 text-blue-700 disabled:opacity-50">Prev</button>
                <span className="text-sm">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 rounded bg-blue-100 text-blue-700 disabled:opacity-50">Next</button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 