import React from 'react';
import defaultRestaurantPhoto from './img/default-restaurant.png'

function SearchResults(props) {
    const resultsMarkup = props.results.map((result, i) => {
        let photo_url = result.photos ? result.photos[0].getUrl({maxHeight: 100}) : defaultRestaurantPhoto;

        return (
            <li key={result.id} id={result.id} tabIndex="-1" className="search-result" onClick={() => props.handleResultClick(result)}>
                <div className="search-result_photo" style={{
                    background: "url(" + photo_url + ") 50% 50% no-repeat",
                    width: '100px',
                    height: '100px', 
                }}>
                </div>
                <div className="search-result_text-info">
                    <div className="search-result_name"><b>{result.name}</b></div>
                    <div className="search-result_rating">Rating: {result.rating ? result.rating : '-'}</div>
                    <div className="search-result_price-level">Price Level: {result.price_level ? result.price_level : '-'}</div>
                </div>
            </li>
        );
    });

    return (
        <ul className="route-form_search-results" style={{listStyle: null, padding: 0,}}>
            {resultsMarkup}
        </ul>
    );
}


export default SearchResults