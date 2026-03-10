import React, { useState } from "react";
import axios from "axios";
import "./App.css";
import { jsPDF } from "jspdf";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

function App() {

  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState("");

  const analyzeResume = async () => {

    if (!file) {
      alert("Please upload a resume first");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("job_description", jobDescription);

    try {

      setLoading(true);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/analyze/",
        formData
      );

      setResult(response.data);
      setLoading(false);

    } catch (error) {

      console.error(error);
      alert("Error analyzing resume");
      setLoading(false);

    }
  };

  const downloadPDF = () => {

    if (!result) return;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("AI Resume Analysis Report", 20, 20);

    doc.setFontSize(12);

    doc.text(`Resume Score: ${result.score}`, 20, 40);
    doc.text(`Job Match Score: ${result.match_score}%`, 20, 50);

    doc.text("Skills Detected:", 20, 70);
    doc.text(result.skills_detected?.join(", ") || "None", 20, 80);

    doc.text("Missing Skills:", 20, 100);
    doc.text(result.missing_skills?.join(", ") || "None", 20, 110);

    doc.text("AI Feedback:", 20, 130);

    const feedbackLines = doc.splitTextToSize(result.ai_feedback || "", 170);
    doc.text(feedbackLines, 20, 140);

    doc.save("resume-analysis-report.pdf");
  };

  return (
    <div className="container">

      <h1>AI Resume Analyzer</h1>

      <input
        type="file"
        onChange={(e)=>setFile(e.target.files[0])}
      />

      <br/><br/>

      <h3>Paste Job Description</h3>

      <textarea
        rows="6"
        cols="60"
        placeholder="Paste job description here..."
        value={jobDescription}
        onChange={(e)=>setJobDescription(e.target.value)}
      />

      <br/><br/>

      <button className="button" onClick={analyzeResume}>
        Upload & Analyze Resume
      </button>

      {loading && <p>Analyzing resume...</p>}

      {result && (

        <div>

          <h2>Resume Score</h2>

          <div style={{ width: "150px", margin: "20px auto" }}>
            <CircularProgressbar
              value={result.score}
              text={`${result.score}%`}
            />
          </div>

          <h3>Skills Detected</h3>

          <div>
            {result.skills_detected?.map((skill,i)=>(
              <span key={i} className="badge">
                {skill}
              </span>
            ))}
          </div>

          <h3>Job Match Score: {result.match_score}%</h3>

          <h3>Missing Skills (Recommended to Add)</h3>

          <div>
            {result.missing_skills?.length > 0 ? (
              result.missing_skills.map((skill,i)=>(
                <span key={i} className="missing-badge">
                  {skill}
                </span>
              ))
            ) : (
              <p>No missing skills 🎉 Your resume matches well!</p>
            )}
          </div>

          <div className="card">

            <h3>AI Feedback</h3>
            <p>{result.ai_feedback}</p>

          </div>

          <br/>

          <button className="button" onClick={downloadPDF}>
            Download Report as PDF
          </button>

        </div>

      )}

    </div>
  );
}

export default App;