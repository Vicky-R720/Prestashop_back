import { Link } from "react-router-dom";

import { categories } from "../services/mockData";

export default function CategoryChips() {
  return (
    <div className="category-chips">
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/category/${category.slug}`}
          className="chip"
        >
          <span>{category.name}</span>
          <em>{category.count}</em>
        </Link>
      ))}
    </div>
  );
}
