import Header from './components/Header/Header';
import HeroSection from './components/Hero/HeroSection';
import ScanSection from './components/Scan/ScanSection';
import AboutSection from './components/About/AboutSection';
import Footer from './components/Footer/Footer';

function App() {
  return (
    <>
      <div className="cover-wrapper">
        <div className="cover-image" />
      </div>
      <Header />
      <HeroSection />
      <ScanSection />
      <AboutSection />
      <Footer />
    </>
  );
}

export default App;
