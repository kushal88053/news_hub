import React from 'react';
import './NewsTable.css'; // Import CSS file for styling

const NewsTable = ({ newsItems }) => {
    return (
        <table className="news-table">
            <thead>
                <tr>
                    <th>Location</th>
                    <th>News</th>
                    <th>Published Date</th>
                </tr>
            </thead>
            <tbody>
                {newsItems.map((item, index) => (
                    <tr key={index}>
                        <td>{item.location}</td>
                        <td className="news-item">
                            <img src={item.imageLink} alt="news" className="news-image" />
                            <a href={item.articleLink} target="_blank" rel="noopener noreferrer" className="news-headline">
                                {item.headline}
                            </a>
                        </td>
                        <td>{item.publishedDate}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default NewsTable;
