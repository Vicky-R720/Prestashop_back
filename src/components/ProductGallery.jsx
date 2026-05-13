import { useState } from "react";

export default function ProductGallery({ images, name }) {
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="gallery">
      <div className="gallery__main">
        <img src={activeImage} alt={name} />
      </div>
      <div className="gallery__thumbs">
        {images.map((image) => (
          <button
            key={image}
            className={
              image === activeImage ? "thumb is-active" : "thumb"
            }
            onClick={() => setActiveImage(image)}
            type="button"
          >
            <img src={image} alt={name} />
          </button>
        ))}
      </div>
    </div>
  );
}
