import React, { useState } from "react";
import CitySearch from "./CitySearch";

export default function RealTimeMap({ onCitySelect }) {
  const [selectedCity, setSelectedCity] = useState(null);

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    onCitySelect(city); // Pass city object to parent (Dashboard)
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Search Any City</h2>
      <CitySearch onCitySelect={handleCitySelect} />
      {selectedCity && (
        <div className="mt-2 text-gray-700">
          Selected: <b>{selectedCity.name}, {selectedCity.country}</b>
        </div>
      )}
    </div>
  );
}