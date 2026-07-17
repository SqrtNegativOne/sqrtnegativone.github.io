import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Questions.css';

export default function Questions() {
  const [questions, setQuestions] = useState([]);


  useEffect(() => {
    // We try fetching JSON first, based on "solved field in that json"
    fetch('/questions.json')
      .then(res => res.json())
      .then(data => {
        setQuestions(data.filter(q => !q.solved));
      })
      .catch(err => console.error("Error fetching questions:", err));
  }, []);

  return (
    <div className="questions-page">
      <h1 className="questions-title">questions։։</h1>
      <ul className="questions-list">
        {questions.map(q => (
          <li key={q.id} className="question-item">
            {q.text}
          </li>
        ))}
      </ul>
      <Link to="/" className="back-link">&lt; back to main</Link>
    </div>
  );
}
