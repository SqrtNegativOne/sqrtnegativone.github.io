import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found">
      <h2 className="not-found-code">404</h2>
      <p className="not-found-message">
        The page you have requested for exists only in your mind.
      </p>
      <button className="not-found-back" onClick={() => navigate("/")}>
        &lt; return to the phenomenal world
      </button>
    </div>
  );
}
