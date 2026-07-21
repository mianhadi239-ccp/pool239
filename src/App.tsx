import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Footer, Header, PageNotFound } from './components';
import { Home } from './pages';
import PasswordGate from './components/PasswordGate';

/**
 * Root app wrapped in PasswordGate to enforce password authentication.
 */
function App() {
  return (
    <PasswordGate>
      <main className="">
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </main>
    </PasswordGate>
  );
}

export default App;
