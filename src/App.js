import React from 'react';
import Header from './components/Header'
import Viewer from './components/Viewer'
import OptionPanel from './components/OptionPanel';
import ExportModal from './components/ExportModal';
import OptionChoiceModal from './components/OptionChoiceModal';
import Preview from './components/Preview';
import './App.css';
import './globals';

import { useSelector } from 'react-redux';
import { selectIsPreviewMode } from './components/viewerSlice';

function App() {

  const isPreviewMode = useSelector(selectIsPreviewMode);

  return (
    <div className="App">
      <Header />
      {renderBody(isPreviewMode)}
    </div>
  );
}

export default App;

const renderBody = (isPreviewMode) => {
  if (isPreviewMode) {
    return (<Preview />)
  } else {
    return (      
      <div className="body">
        <Viewer />
        <OptionPanel />
        <ExportModal />
        <OptionChoiceModal />
      </div>
    )
  }
}