import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DemoPage from './pages/DemoPage';
import TestAudioPage from './pages/TestAudioPage';

function App() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/demo" element={<DemoPage />} />
                <Route path="/test-audio" element={<TestAudioPage />} />
            </Routes>
        </div>
    );
}

export default App;
