import React from 'react';
import { Container } from 'react-bootstrap';
import Header from './components/Header';
import SearchSection from './components/SearchSection';
import UploadSection from './components/UploadSection';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <div className="App">
      <Container className="main-container">
        <div className="content-wrapper">
          <Header />
          <main className="main-content">
            <SearchSection />
            <UploadSection />
          </main>
          <Footer />
        </div>
      </Container>
    </div>
  );
}

export default App;

