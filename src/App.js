import React from 'react';
import Header from './components/Header'
import Viewer from './components/Viewer'
import ImportModal from './components/ImportModal';
import ExportModal from './components/ExportModal';
import OptionChoiceModal from './components/OptionChoiceModal';
import ControlMenu from './components/ControlMenu';
import './App.css';
import './globals';

function App() {

  return (
    <div className="App">
      <Header />
      <div className="body">
        <Viewer />
        <ControlMenu />
        <ImportModal />
        <ExportModal />
        <OptionChoiceModal />
      </div>
    </div>
  );
}

export default App;
