import React from 'react';
// No special JS logic needed, it's all CSS animation driven.
// Styles are loaded in App.css globally.

const MovingBusBanner = () => {
    return (
        <div className="bus-banner-container">
            {/* The moving road stripes beneath the bus */}
            <div className="road-stripes"></div>

            {/* The bus container itself */}
            <div className="moving-bus-wrapper">
                <div className="yellow-bus-body">
                    
                    {/* Windows Section */}
                    <div className="bus-windows-container">
                        <div className="bus-window"></div>
                        <div className="bus-window"></div>
                        <div className="bus-window"></div>
                        {/* Front curved window */}
                        <div className="bus-window front"></div> 
                    </div>

                    {/* Text on the side */}
                    <div className="bus-side-text">
                        GCET TRANSPORT
                    </div>
                </div>

                {/* Wheels with spinning animation */}
                <div className="bus-wheel back"></div>
                <div className="bus-wheel front"></div>
            </div>
        </div>
    );
};

export default MovingBusBanner;