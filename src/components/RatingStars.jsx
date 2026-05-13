export default function RatingStars({ value, count }) {
  const rounded = Math.round(value);

  return (
    <div className="rating">
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} filled={index < rounded} />
      ))}
      <span>{value.toFixed(1)}</span>
      <small>({count})</small>
    </div>
  );
}

function Star({ filled }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={filled ? "star is-filled" : "star"}
      aria-hidden="true"
    >
      <path d="M12 3l2.9 6.1 6.7.9-4.8 4.6 1.1 6.6L12 18l-5.9 3.2 1.1-6.6L2.4 10l6.7-.9L12 3z" />
    </svg>
  );
}
