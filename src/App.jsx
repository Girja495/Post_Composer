import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import PostComposer from "./components/PostComposer";
import DraftList from "./components/DraftList";
import { IntervalCounter } from "./components/IntervalCounter";
import { useForm } from "./hooks/useForm";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { saveDraftMock, deleteDraftMock, retry } from "./api/mockApi";
import { validatePost } from "./strategies/validationStrategies";

export default function App() {
  const [platform, setPlatform] = useState("twitter");
  const { value: content, setValue: setContent, handleChange } = useForm("");
  const [drafts, setDrafts] = useLocalStorage("post-drafts", []); // persisted
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [flaky, setFlaky] = useState(false);
  const [showTimer, setShowTimer] = useState(false);

  const failRate = flaky ? 0.6 : 0;

  const resetComposer = () => {
    setContent("");
    setEditingId(null);
    setError("");
  };

  const handleSave = async () => {
    // Guard: never save an invalid post
    if (!validatePost(platform, content).valid) return;

    setLoading(true);
    setError("");

    const draft = {
      id: editingId ?? crypto.randomUUID(),
      platform,
      content,
      updatedAt: new Date().toISOString(),
    };

    try {
      await retry(() => saveDraftMock(draft, { failRate }), {
        retries: 3,
        delay: 500,
        onRetry: (left) => toast.info(`Save failed — retrying (${left} left)…`),
      });

      setDrafts((prev) =>
        editingId ? prev.map((d) => (d.id === editingId ? draft : d)) : [draft, ...prev]
      );
      toast.success(editingId ? "Draft updated" : "Draft saved successfully!");
      resetComposer();
    } catch {
      setError("Failed to save draft");
      toast.error("Could not save the draft. Try again.");
    }

    setLoading(false);
  };

  const handleEdit = (d) => {
    setPlatform(d.platform);
    setContent(d.content);
    setEditingId(d.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    setBusyId(id);
    try {
      await retry(() => deleteDraftMock(id, { failRate }), { retries: 2, delay: 300 });
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      if (editingId === id) resetComposer();
      toast.success("Draft deleted");
    } catch {
      toast.error("Could not delete the draft.");
    }
    setBusyId(null);
  };

  return (
    <div className="app">
      <header className="top">
        <h1>Post Composer</h1>
        <p>Write once, check it against each platform's rules, keep drafts for later.</p>
      </header>

      <main className="grid">
        <div>
          <PostComposer
            platform={platform}
            onPlatformChange={setPlatform}
            content={content}
            onContentChange={handleChange}
            onSave={handleSave}
            onClear={resetComposer}
            loading={loading}
            editing={Boolean(editingId)}
          />
          {error && <p className="save-error" role="alert">{error}</p>}

          <div className="panel tools">
            <label className="check">
              <input type="checkbox" checked={flaky} onChange={(e) => setFlaky(e.target.checked)} />
              Simulate network failures (to see retry + error toasts)
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={showTimer}
                onChange={(e) => setShowTimer(e.target.checked)}
              />
              Show stale-closure demo (Section 10)
            </label>
            {showTimer && <IntervalCounter />}
          </div>
        </div>

        <DraftList
          drafts={drafts}
          onEdit={handleEdit}
          onDelete={handleDelete}
          editingId={editingId}
          busyId={busyId}
        />
      </main>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}
