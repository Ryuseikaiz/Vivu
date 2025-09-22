import React from 'react';
import './TravelResults.css';

const TravelResults = ({ travelInfo }) => {
  return (
    <div className="travel-results">
      <h2>Thông tin du lịch</h2>
      <div 
        className="travel-content"
        dangerouslySetInnerHTML={{ __html: travelInfo }}
      />
    </div>
  );
};

export default TravelResults;