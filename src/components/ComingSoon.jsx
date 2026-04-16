import { useNavigate } from "react-router-dom";

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <div className="not-found">
      <h2 className="not-found-code">Soon</h2>
      <p className="not-found-message">This page is still being assembled.</p>
      <button className="not-found-back" onClick={() => navigate("/")}>
        &lt; go back home
      </button>
    </div>
  );
}
