import { Link } from "react-router-dom";
import { money } from "./ui";

export default function ListingCard({ listing, active, onHover }) {
  if (!listing) return null;
  const reviews = listing.review_count || 0;
  return (
    <li
      className={"home-card " + (active ? "is-active" : "")}
      onMouseEnter={() => onHover?.(listing.id)}
      onMouseLeave={() => onHover?.(null)}
      onFocus={() => onHover?.(listing.id)}
      onBlur={() => onHover?.(null)}
    >
      <Link to={"/listing/" + listing.id} className="home-card-link">
        <div className="home-photo">
          <img
            src={"/photos/" + listing.id + ".jpg"}
            alt={"Sample photo for " + listing.name}
            loading="lazy"
          />
          <span className="bedroom-badge">
            {listing.bedrooms === 0 ? "Studio" : listing.bedrooms + " bed"}
          </span>
          <span className="photo-caption">Sample photo</span>
          <span className="photo-arrow" aria-hidden="true">
            ↗
          </span>
        </div>
        <div className="home-card-body">
          <div className="card-meta">
            <span>{listing.distance_miles} mi to campus</span>
            <span className="card-rating">
              ★{" "}
              {listing.avg_rating
                ? Number(listing.avg_rating).toFixed(1)
                : "New"}
            </span>
          </div>
          <h3>{listing.name}</h3>
          <p className="card-address">{listing.address || "Hayward, CA"}</p>
          <div className="card-cost">
            <div>
              <strong>{money(listing.true_cost)}</strong>
              <span> / mo</span>
            </div>
            <span className="true-cost-label">
              True cost <span aria-hidden="true">↗</span>
            </span>
          </div>
          <div className="card-bottom">
            <span>
              {reviews > 0
                ? "✓ " + reviews + " verified reviews"
                : "Be the first to review"}
            </span>
            <span>
              Safety {listing.safety_score}/10 <small>(demo)</small>
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}
