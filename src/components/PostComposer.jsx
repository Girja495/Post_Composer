import { useMemo } from "react";
import { platformList, validatePost } from "../strategies/validationStrategies";

export default function PostComposer({
  platform,
  onPlatformChange,
  content,
  onContentChange,
  onSave,
  onClear,
  loading,
  editing,
}) {
  // Synchronous, real-time validation: recomputed on every keystroke.
  const { valid, errors, limit } = useMemo(
    () => validatePost(platform, content),
    [platform, content]
  );

  const count = content.length;
  const ratio = Math.min(count / limit, 1);
  const state = count > limit ? "over" : ratio > 0.9 ? "near" : "ok";
  const showErrors = content.length > 0 && errors.length > 0;

  return (
    <section className="panel composer">
      <h2>{editing ? "Edit draft" : "New post"}</h2>

      <label className="field">
        <span>Platform</span>
        <select value={platform} onChange={(e) => onPlatformChange(e.target.value)}>
          {platformList.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label} — {p.limit.toLocaleString()} chars
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Content</span>
        {/* Controlled component: value comes from state, onChange updates it */}
        <textarea
          value={content}
          onChange={onContentChange}
          placeholder="Write your post..."
          rows={8}
          aria-invalid={showErrors}
        />
      </label>

      <div className="meter" aria-hidden="true">
        <div className={`meter-bar ${state}`} style={{ width: `${ratio * 100}%` }} />
      </div>
      <p className={`counter ${state}`}>
        {count.toLocaleString()} / {limit.toLocaleString()}
      </p>

      {showErrors && (
        <ul className="errors" role="alert">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      <div className="actions">
        <button className="primary" onClick={onSave} disabled={!valid || loading}>
          {loading ? "Saving…" : editing ? "Update draft" : "Save draft"}
        </button>
        <button className="ghost" onClick={onClear} disabled={loading}>
          {editing ? "Cancel edit" : "Clear"}
        </button>
      </div>
    </section>
  );
}
