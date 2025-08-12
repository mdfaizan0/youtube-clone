import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Search() {
  // query state and naviagte from rrd
  const [query, setQuery] = useState("");
  const navigate = useNavigate()
  return (
    <div className="searchbar-container">
      <form className="searchbar-form" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
        />
        <button type="submit" title="Search" onClick={() => navigate(`/search?q=${query}`)}>
          <img
            src="https://img.icons8.com/?size=100&id=7695&format=png&color=FFFFFF"
            alt="search-icon"
          />
        </button>
      </form>
    </div>
  );
}

export default Search