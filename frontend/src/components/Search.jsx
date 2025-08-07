import { useState } from "react";

function Search() {
  const [query, setQuery] = useState("");
  
  return (
    <div className="searchbar-container">
      <form className="searchbar-form" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
        />
        <button type="submit" title="Search">
          <img
            src="https://img.icons8.com/?size=100&id=7695&format=png&color=FFFFFF"
            alt="search-icon"
          />
        </button>
      </form>
    </div>
  );
}

export default Search;