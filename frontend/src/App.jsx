import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const handleResumeUpload = async (event, user, setUploadStatus) => {
  const file = event.target.files[0];
  if (!file) return;

  if (file.type !== "application/pdf") {
    alert("Please select a PDF file.");
    return;
  }

  const filePath = `${user.id}/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("resumes")
    .upload(filePath, file);

  if (error) {
    console.error("Resume upload error:", error);
    alert("Upload failed: " + error.message);
    return;
  }

  setUploadStatus("Resume uploaded successfully!");
};
console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("Test message");
  const [loading, setLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [matchScore, setMatchScore] = useState(null);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleAuth(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Account created successfully!");
        setShowAuth(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Signed in successfully!");
        setShowAuth(false);
      }
    }

    setLoading(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setMessage("Signed out successfully.");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="flex items-center justify-between px-8 py-6 border-b border-slate-800">
        <div className="text-2xl font-bold">
          Career<span className="text-blue-500">Match</span> AI
        </div>

        {user ? (
          <button
            onClick={handleSignOut}
            className="rounded-lg border border-slate-700 px-5 py-2 text-sm hover:bg-slate-800"
          >
            Sign Out
          </button>
        ) : (
          <button
            onClick={() => {
              setShowAuth(true);
              setIsSignUp(false);
              setMessage("");
            }}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold hover:bg-blue-700"
          >
            Sign In
          </button>
        )}
      </nav>

      <main className="mx-auto max-w-6xl px-8 py-24">
  {user ? (
    <div>
      <div className="mb-10">
        <div className="mb-4 inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-400">
          You're signed in
        </div>

        <h1 className="text-4xl font-bold md:text-5xl">
          Welcome to <span className="text-blue-500">CareerMatch AI</span>
        </h1>

        <p className="mt-4 text-lg text-slate-400">
          Upload your resume and add a job description to see how well you
          match the role.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <div className="mb-4 text-4xl">📄</div>

          <h2 className="text-2xl font-semibold">
            Resume Analysis
          </h2>

          <p className="mt-3 text-slate-400">
            Upload your resume PDF and let CareerMatch AI understand your
            skills, education, and experience.
          </p>

          <button className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700">
          <label className="mt-6 inline-block cursor-pointer rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700">
  Upload Resume
  <input
    type="file"
    accept=".pdf"
    className="hidden"
    onChange={(event) => {
      console.log("PDF selected:", event.target.files[0]);
      handleResumeUpload(event, user, setUploadStatus);
    }}
    />
    </label>
    
    {uploadStatus && (
      <p className="mt-3 text-green-400">{uploadStatus}</p>
    )}
    
    </button>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <div className="mb-4 text-4xl">💼</div>

          <h2 className="text-2xl font-semibold">
            Job Description
          </h2>

          <p className="mt-3 text-slate-400">
            Paste the job description you want to compare against your resume.
          </p>

          <button className="mt-6 rounded-lg border border-slate-700 px-6 py-3 font-semibold hover:bg-slate-800">
          <textarea
  className="mt-6 w-full rounded-lg border border-slate-700 bg-slate-950 p-4 text-white outline-none focus:border-blue-500"
  rows="6"
  placeholder="Paste the job description here..."
  value={jobDescription}
  onChange={(event) => setJobDescription(event.target.value)}
/>
          </button>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8">
  <div className="mb-4 text-4xl">🎯</div>

  <h2 className="text-2xl font-semibold">
    Your Match Score
  </h2>

  <p className="mt-3 text-slate-400">
  Your AI-generated match score will appear here after you analyze
  your resume against a job description.
</p>

{message && (
  <p className="mt-4 font-semibold text-green-400">
    {message}
  </p>
)}

{matchScore !== null && (
  <div className="mt-8 space-y-6">

    <div>
      <p className="text-sm text-slate-400">
        Resume Match Score
      </p>

      <p className="mt-2 text-5xl font-bold text-blue-400">
        {matchScore}%
      </p>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-green-400">
        Matched Skills
      </h3>

      {matchedSkills.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {matchedSkills.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-400"
            >
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-slate-400">
          No matching skills found.
        </p>
      )}
    </div>

    <div>
      <h3 className="text-lg font-semibold text-red-400">
        Missing Skills
      </h3>

      {missingSkills.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {missingSkills.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-red-500/10 px-3 py-1 text-sm text-red-400"
            >
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-slate-400">
          No major missing skills detected.
        </p>
      )}
    </div>

  </div>
)}

  <button
  className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700"
  onClick={async () => {
    if (!user) {
      alert("Please sign in first.");
      return;
    }
  
    if (!jobDescription.trim()) {
      alert("Please paste a job description first.");
      return;
    }
  
    const { data, error } = await supabase.storage
      .from("resumes")
      .list(user.id);
  
    if (error) {
      console.error("Resume fetch error:", error);
      setMessage("Could not find your uploaded resume.");
      return;
    }
  
    if (!data || data.length === 0) {
      setMessage("No uploaded resume found.");
      return;
    }
  
    const filePath = `${user.id}/${data[0].name}`;

const { data: fileData, error: downloadError } =
  await supabase.storage.from("resumes").download(filePath);

if (downloadError) {
  console.error("Resume download error:", downloadError);
  setMessage("Could not download your resume.");
  return;
}

const arrayBuffer = await fileData.arrayBuffer();

const pdf = await pdfjsLib.getDocument({
  data: arrayBuffer,
}).promise;

let extractedText = "";

for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
  const page = await pdf.getPage(pageNumber);
  const textContent = await page.getTextContent();

  const pageText = textContent.items
    .map((item) => item.str)
    .join(" ");

  extractedText += pageText + "\n";
}

const cleanResumeText = extractedText
  .replace(/\s+/g, " ")
  .trim();

const cleanJobDescription = jobDescription
  .replace(/\s+/g, " ")
  .trim();

setResumeText(cleanResumeText);

console.info("[CareerMatch] Input diagnostics:", {
  pdfPages: pdf.numPages,
  resumeCharacters: cleanResumeText.length,
  jobDescriptionCharacters: cleanJobDescription.length,
});

if (!cleanResumeText) {
  setMessage(
    "No readable text was found in your PDF. Please upload a text-based PDF instead of a scanned image PDF."
  );
  return;
}

if (!cleanJobDescription) {
  setMessage("Please enter a job description.");
  return;
}


const {
  data: { session },
  error: sessionError,
} = await supabase.auth.getSession();

if (sessionError || !session?.access_token) {
  setMessage("Your session has expired. Please sign in again.");
  return;
}

try {
  const response = await fetch(
    "https://careermatch-ai-qqwj.onrender.com/analyze",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        resume_text: extractedText,
        job_description: jobDescription,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    console.error("Backend analysis error:", result);
    setMessage(
      result.detail || "Resume analysis failed. Please try again."
    );
    return;
  }

  setMatchScore(result.score);
  setMatchedSkills(result.matched_skills || []);
  setMissingSkills(result.missing_skills || []);
  setMessage(result.message);

} catch (apiError) {
  console.error("Backend connection error:", apiError);

  setMessage(
    "Could not connect to the analysis server. Please try again."
  );
}


  }}
>
  Analyze Resume
</button>
</div>
    </div>
  ) : (
    <div className="max-w-3xl">
      <div className="mb-6 inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-400">
        AI-Powered Career Analysis
      </div>

      <h1 className="text-5xl font-bold leading-tight md:text-6xl">
        Know how well your resume
        <span className="text-blue-500"> matches the job.</span>
      </h1>

      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
        Upload your resume, add a job description, and let AI analyze your
        skills, strengths, gaps, and overall job match.
      </p>

      <div className="mt-10 flex gap-4">
        <button
          onClick={() => {
            setShowAuth(true);
            setIsSignUp(false);
            setMessage("");
          }}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700"
        >
          Analyze My Resume →
        </button>

        <button className="rounded-lg border border-slate-700 px-6 py-3 font-semibold hover:bg-slate-800">
          View Demo
        </button>
      </div>
    </div>
  )}
</main>

      {showAuth && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-8">
            <h2 className="text-2xl font-bold">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h2>

            <p className="mt-2 text-slate-400">
              {isSignUp
                ? "Create an account to use CareerMatch AI."
                : "Sign in to continue to CareerMatch AI."}
            </p>

            <form onSubmit={handleAuth} className="mt-6 space-y-4">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 py-3 font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading
                  ? "Please wait..."
                  : isSignUp
                  ? "Create Account"
                  : "Sign In"}
              </button>
            </form>

            {message && (
              <p className="mt-4 text-sm text-blue-400">{message}</p>
            )}

            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setMessage("");
              }}
              className="mt-5 text-sm text-slate-400 hover:text-white"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Create one"}
            </button>

            <button
              onClick={() => setShowAuth(false)}
              className="mt-5 block w-full text-sm text-slate-500 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;