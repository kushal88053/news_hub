import React from 'react';
import './SearchBar.css'; // Import CSS file for styling

const SearchBar = ({ query, setQuery }) => {
    const handleChange = (event) => {
        setQuery(event.target.value);
    };

    return (
        <div className="search-bar">
            <input
                type="text"
                value={query}
                onChange={handleChange}
                placeholder="Search news..."
            />
        </div>
    );
};

export default SearchBar;
