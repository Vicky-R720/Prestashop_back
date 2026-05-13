import { Link } from "react-router-dom";

export default function Breadcrumbs({ items }) {
  return (
    <div className="breadcrumbs">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`}>
          {item.to ? <Link to={item.to}>{item.label}</Link> : item.label}
          {index < items.length - 1 ? <em>/</em> : null}
        </span>
      ))}
    </div>
  );
}
