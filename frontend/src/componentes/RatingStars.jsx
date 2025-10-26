import React, { useState } from "react";

const RatingStars = ({ rating = 0, maxStars = 5, onRate }) => {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(rating);

  const handleClick = (e, index) => {
    const { left, width } = e.target.getBoundingClientRect();
    const clickX = e.clientX - left;
    const newRating = clickX < width / 2 ? index + 0.5 : index + 1;
    setSelected(newRating);
    if (onRate) onRate(newRating);
  };

  const handleMouseMove = (e, index) => {
    const { left, width } = e.target.getBoundingClientRect();
    const hoverX = e.clientX - left;
    setHovered(hoverX < width / 2 ? index + 0.5 : index + 1);
  };

  const getStarClass = (i) => {
    const value = i + 1;
    if (hovered >= value || selected >= value) return "bi bi-star-fill text-warning";
    if (hovered >= value - 0.5 || selected >= value - 0.5) return "bi bi-star-half text-warning";
    return "bi bi-star text-secondary";
  };

  return (
    <div className="d-flex align-items-center">
      {Array.from({ length: maxStars }).map((_, i) => (
        <span
          key={i}
          style={{ cursor: "pointer", fontSize: "22px" }}
          onMouseMove={(e) => handleMouseMove(e, i)}
          onMouseLeave={() => setHovered(0)}
          onClick={(e) => handleClick(e, i)}
        >
          <i className={getStarClass(i)}></i>
        </span>
      ))}
    </div>
  );
};

export default RatingStars;