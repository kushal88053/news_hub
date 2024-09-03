import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NewsSourceTabs from '../components/NewsSourceTabs';
import NewsTable from '../components/NewsTable';
import SearchBar from '../components/SearchBar';
import './NewsPage.css'; // Import CSS file for styling

const NewsPage = () => {
    const [activeSource, setActiveSource] = useState('The Hindu');
    const [newsItems, setNewsItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredNews, setFilteredNews] = useState([]);
    const [loading, setLoading] = useState(false); // Add loading state
    const [error, setError] = useState(null); // Add error state

    const newsSources = ['The Hindu', 'Times of India', 'New York Times'];

    // Fetch news whenever the activeSource or searchQuery changes
    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            setError(null); // Clear previous errors
            try {
                // Construct the query params based on the search query and selected source
                const response = await axios.get(`/api/latest-news`, {
                    params: {
                        source: activeSource,
                        query: searchQuery, // Assuming your API accepts a 'query' parameter
                    },
                });
                setNewsItems(response.data);
            } catch (error) {
                setError("Error fetching news. Please try again later.");
                console.error("Error fetching news:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [activeSource, searchQuery]); // Run effect whenever source or search query changes

    // Filter news items based on search query
    useEffect(() => {
        const results = newsItems.filter(item =>
            item.headline.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredNews(results);
    }, [newsItems, searchQuery]);

    return (
        <div className="news-page">
            <NewsSourceTabs
                sources={newsSources}
                activeSource={activeSource}
                setActiveSource={setActiveSource}
            />
            <SearchBar
                query={searchQuery}
                setQuery={setSearchQuery}
            />
            {loading && <p>Loading news...</p>}
            {error && <p className="error-message">{error}</p>}
            {filteredNews.length > 0 ? (
                <NewsTable newsItems={filteredNews} />
            ) : (
                !loading && <p>No news items found.</p>
            )}
        </div>
    );
};

export default NewsPage;
