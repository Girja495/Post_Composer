import { strategies } from "../strategies/validationStrategies";

const fmt = (iso) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export default function DraftList({ drafts, onEdit, onDelete, editingId, busyId }) {
  return (
    <section className="panel">
      <h2>Drafts ({drafts.length})</h2>

      {drafts.length === 0 ? (
        <p className="empty">No drafts yet. Write a post and choose “Save draft”.</p>
      ) : (
        <ul className="drafts">
          {drafts.map((d) => (
            <li key={d.id} className={d.id === editingId ? "draft editing" : "draft"}>
              <div className="draft-head">
                <span className={`badge ${d.platform}`}>{strategies[d.platform]?.label}</span>
                <time>{fmt(d.updatedAt)}</time>
              </div>
              <p className="draft-text">{d.content}</p>
              <div className="actions">
                <button className="small" onClick={() => onEdit(d)} disabled={busyId === d.id}>
                  Edit
                </button>
                <button
                  className="small danger"
                  onClick={() => onDelete(d.id)}
                  disabled={busyId === d.id}
                >
                  {busyId === d.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
