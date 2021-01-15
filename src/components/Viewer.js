import React from 'react';

const Viewer = () => {

    return (        
        <div class="viewer">
            <iframe 
                src="" 
                id="api-frame" 
                title="sketchfab-viewer"
                allowfullscreen mozallowfullscreen="true" 
                webkitallowfullscreen="true"
            ></iframe>
            <div id="animationControls"></div>
        </div>
    )
}

export default Viewer;
