import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import EditorRoom from './EditorRoom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/room/:roomId" element={<EditorRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
