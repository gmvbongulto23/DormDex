import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getListings } from "../api";
import { money } from "../components/ui";
import ListingCard from "../components/ListingCard";
import FilterBar from "../components/FilterBar";
import MapView from "../components/MapView";

const initialFilters = {
  max_cost: "",
  min_safety: "",
  bedrooms: "",
  sort: "true_cost",
};

export default function HomePage() {
  const [listings, setListings] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredId, setHoveredId] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [view, setView] = useState("split");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getListings(filters)
      .then((data) => {
        if (!active) return;
        setListings(data);
        setFeatured(
          (previous) =>
            previous || data.find((item) => item.review_count > 0) || data[0],
        );
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filters, retry]);

  return (
    <>
      <section className="hero">
        <div className="hero-gradient" aria-hidden="true" />
        <div className="site-container hero-grid">
          <div className="hero-copy">
            <a className="announcement" href="#homes">
              <span className="status-dot" /> Starting at CSU East Bay{" "}
              <span aria-hidden="true">→</span>
            </a>
            <h1>
              Your next place.
              <br />A clearer
              <br />
              <span>picture.</span>
            </h1>
            <p>
              More than a rent price. Discover the real costs, the student
              stories, and the details that make a place feel like home.
            </p>
            <div className="hero-actions">
              <a href="#homes" className="button button-dark">
                Explore homes <span aria-hidden="true">→</span>
              </a>
              <Link to="/lease" className="text-link">
                Check your lease <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <div className="hero-note">
              <span aria-hidden="true">✓</span> Student perspectives. More
              confident decisions.
            </div>
          </div>
          <div className="hero-preview">
            <div className="preview-label">
              <span /> A little clarity goes a long way
            </div>
            {featured ? (
              <>
                <Link
                  className="preview-card"
                  to={"/listing/" + featured.id}
                  aria-label={"Explore " + featured.name}
                >
                  <div className="preview-photo">
                    <img
                      src={"/photos/" + featured.id + ".jpg"}
                      alt={"Sample housing photo for " + featured.name}
                    />
                    <span>Discover your neighborhood ↗</span>
                    <small>Sample photo</small>
                  </div>
                  <div className="preview-body">
                    <div className="preview-location">
                      HAYWARD, CALIFORNIA <span>↗</span>
                    </div>
                    <h2>{featured.name}</h2>
                    <p>
                      {featured.bedrooms === 0
                        ? "Studio"
                        : featured.bedrooms + " bedrooms"}{" "}
                      · {featured.distance_miles} miles to campus
                    </p>
                    <div className="cost-heading">
                      <span>Your true monthly cost</span>
                      <span className="tiny-tag">The full picture</span>
                    </div>
                    <div className="preview-price">
                      {money(featured.true_cost)}
                      <span> / month</span>
                    </div>
                    <div className="cost-bar">
                      <span
                        style={{
                          width:
                            Math.min(
                              100,
                              (featured.rent / featured.true_cost) * 100,
                            ) + "%",
                        }}
                      />
                    </div>
                    <div className="cost-legend">
                      <span>
                        <i /> Rent {money(featured.rent)}
                      </span>
                      <span>
                        <i /> Utilities {money(featured.avg_utilities)}
                      </span>
                    </div>
                    <small className="preview-disclaimer">
                      Fictional demo listing · Utilities from student reports
                    </small>
                  </div>
                </Link>
                <div className="floating-insight">
                  <span className="insight-icon" aria-hidden="true">
                    ✓
                  </span>
                  <div>
                    <strong>A little more peace of mind</strong>
                    <p>{featured.review_count} school-email verified reviews</p>
                  </div>
                  <span className="insight-spark" aria-hidden="true">
                    ✦
                  </span>
                </div>
              </>
            ) : (
              <div className="preview-card preview-placeholder">
                <span className="eyebrow">THE FULL PICTURE</span>
                <h2>
                  Rent is just
                  <br />
                  the beginning.
                </h2>
                <p>
                  Understand monthly costs, hear from students, and explore your
                  neighborhood.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="site-container value-strip" aria-label="Why DormDex">
        <div>
          <span className="feature-number">01 /</span>
          <h2>Know the real cost</h2>
          <p>Rent + reported utilities. Fewer surprises.</p>
        </div>
        <div>
          <span className="feature-number">02 /</span>
          <h2>Hear from students</h2>
          <p>Reviews verified with a school email.</p>
        </div>
        <div>
          <span className="feature-number">03 /</span>
          <h2>Arrive prepared</h2>
          <p>Explore commutes and check your lease.</p>
        </div>
      </section>
      <section id="homes" className="explore-section">
        <div className="site-container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">FIND YOUR EVERYDAY</span>
              <h2>A home for your next chapter.</h2>
              <p>Explore off-campus living around CSU East Bay.</p>
            </div>
            <span className="campus-chip">
              <span className="status-dot" /> Hayward, CA
            </span>
          </div>
          <div className="filter-panel">
            <FilterBar filters={filters} onFilterChange={setFilters} />
          </div>
          <div className="results-toolbar">
            <p aria-live="polite">
              {loading ? (
                "Finding your options…"
              ) : error ? (
                "Listings unavailable"
              ) : (
                <>
                  <strong>{listings.length} homes</strong> to explore{" "}
                  <span>· Fictional demo data</span>
                </>
              )}
            </p>
            <div className="view-switch" aria-label="Results layout">
              <button
                aria-pressed={view === "split"}
                onClick={() => setView("split")}
              >
                Map + homes
              </button>
              <button
                aria-pressed={view === "grid"}
                onClick={() => setView("grid")}
              >
                All homes
              </button>
            </div>
          </div>
          {error ? (
            <div className="empty-state" role="alert">
              <h3>We couldn’t load the homes.</h3>
              <p>{error}</p>
              <button
                className="button button-dark"
                onClick={() => setRetry((value) => value + 1)}
              >
                Try again
              </button>
            </div>
          ) : loading ? (
            <div className="loading-grid" role="status">
              <span>Loading homes…</span>
              {[1, 2, 3].map((id) => (
                <div key={id} className="loading-card" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="empty-state">
              <h3>A fresh start for your search.</h3>
              <p>No homes match these filters. Try widening your options.</p>
              <button
                className="button button-dark"
                onClick={() => setFilters(initialFilters)}
              >
                Reset filters →
              </button>
            </div>
          ) : (
            <div
              className={
                "browse-layout " + (view === "grid" ? "grid-only" : "")
              }
            >
              <ul className="home-cards">
                {listings.map((item) => (
                  <ListingCard
                    key={item.id}
                    listing={item}
                    active={hoveredId === item.id}
                    onHover={setHoveredId}
                  />
                ))}
              </ul>
              {view === "split" && (
                <aside className="map-panel" aria-label="Housing map">
                  <div className="map-heading">
                    <span>Get to know the neighborhood</span>
                    <span className="status-dot" />
                  </div>
                  <MapView
                    listings={listings}
                    hoveredId={hoveredId}
                    onHover={setHoveredId}
                  />
                  <div className="map-caption">
                    CSU East Bay · Hayward campus{" "}
                    <span>Explore the pins ↗</span>
                  </div>
                </aside>
              )}
            </div>
          )}
        </div>
      </section>
      <section className="lease-banner">
        <div className="site-container lease-banner-inner">
          <div>
            <span className="eyebrow">BEFORE YOU MAKE IT OFFICIAL</span>
            <h2>Small print. Big decisions.</h2>
            <p>
              Get a plain-language look at fees, clauses, and questions to ask
              before you sign.
            </p>
            <Link to="/lease" className="button button-light">
              Meet your lease checker <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="lease-illustration" aria-hidden="true">
            <span>YOUR NEXT CHAPTER</span>
            <div />
            <div />
            <div />
            <p>
              Clarity, before commitment. <b>↗</b>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
