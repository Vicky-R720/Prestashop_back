export default function QuantityStepper({ value, onChange }) {
  return (
    <div className="stepper">
      <button
        className="stepper__btn"
        onClick={() => onChange(Math.max(1, value - 1))}
        type="button"
      >
        -
      </button>
      <span>{value}</span>
      <button
        className="stepper__btn"
        onClick={() => onChange(value + 1)}
        type="button"
      >
        +
      </button>
    </div>
  );
}
