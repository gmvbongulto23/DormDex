import { Routes, Route, Link, NavLink } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ListingPage from "./pages/ListingPage";
import SubmitPage from "./pages/SubmitPage";
import LeaseCheckPage from "./pages/LeaseCheckPage";
import { USING_MOCK } from "./api";

export default function App() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="site-container nav-inner">
          <Link to="/" className="wordmark" aria-label="DormDex home">
            <span className="brand-icon" aria-hidden="true">
              d
            </span>
            dormdex<span className="brand-dot">.</span>
          </Link>
          <nav aria-label="Main navigation">
            <NavLink to="/" end>
              Find a home
            </NavLink>
            <NavLink to="/lease">Lease checker</NavLink>
          </nav>
          <Link to="/submit" className="button button-dark nav-cta">
            Write a review <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>
      <main id="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/listing/:id" element={<ListingPage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/lease" element={<LeaseCheckPage />} />
        </Routes>
      </main>
      <footer className="site-footer site-container">
        <Link to="/" className="wordmark">
          dormdex.
        </Link>
        <p>Built for students. Made for the next chapter.</p>
        <span>
          Fictional demo listings{USING_MOCK ? " · Mock mode" : ""} · MESA U
          Hacks 3.0
        </span>
      </footer>
    </div>
  );
}
