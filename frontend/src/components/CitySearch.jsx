import React, { useState } from "react";
import axios from "axios";

export default function CitySearch({ onCitySelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchCity = async (q) => {
    setQuery(q);
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`/api/search_city?city=${encodeURIComponent(q)}`);
      setResults(res.data);
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  return (
    <div className="mb-4">
      <input
        className="input-field w-full"
        value={query}
        onChange={e => searchCity(e.target.value)}
        placeholder="Search any city worldwide..."
      />
      {loading && <div className="text-sm text-gray-500 mt-2">Searching...</div>}
      <ul className="bg-white rounded-xl shadow mt-2">
        {results.map(city => (
          <li key={city.lat + city.lon} className="border-b last:border-b-0">
            <button
              className="w-full text-left px-4 py-2 hover:bg-blue-50"
              onClick={() => {
                setQuery(`${city.name}, ${city.country}`);
                setResults([]);
                onCitySelect(city);
              }}
            >
              {city.name}
              {city.state ? `, ${city.state}` : ""}
              , {city.country}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}