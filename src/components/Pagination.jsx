export default function Pagination({ current, total, onChange }) {
  const pages = Array.from({ length: total }, (_, index) => index + 1);

  return (
    <div className="pagination">
      {pages.map((page) => (
        <button
          key={page}
          className={page === current ? "page-btn is-active" : "page-btn"}
          onClick={() => onChange(page)}
          type="button"
        >
          {page}
        </button>
      ))}
    </div>
  );
}
