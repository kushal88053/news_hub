import React from 'react';


const NewsSourceTabs = ({ sources, activeSource, setActiveSource }) => {
    return (
        <div>
            {
                sources.map(source => (
                    <button
                        key={source}
                        onclick={() => setActiveSource(source)}
                        className={source === activeSource ? 'active' : ''}

                    >
                        {source}
                    </button>
                ))
            }
        </div>
    );
} ;

export default  NewsSourceTabs ;   