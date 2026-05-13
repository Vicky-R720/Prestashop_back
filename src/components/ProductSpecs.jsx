export default function ProductSpecs({ specs }) {
  return (
    <div className="specs">
      {specs.map((spec) => (
        <div key={spec.label} className="specs__item">
          <span>{spec.label}</span>
          <strong>{spec.value}</strong>
        </div>
      ))}
    </div>
  );
}
