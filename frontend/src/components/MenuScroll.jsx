import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./MenuScroll.css";

// User's authentic uploaded menu dishes ONLY (9 newly added items)
const userDishes = [
  {
    id: "lollipops",
    name: "Chicken Lollipops",
    image: "/menu/lollipops.png",
  },
  {
    id: "dum-biryani",
    name: "Chicken Dum Biryani",
    image: "/menu/dum-biryani.png",
  },
  {
    id: "fry-piece",
    name: "Chicken Fry Piece Biryani",
    image: "/menu/fry-piece.png",
  },
  {
    id: "mughalai-biryani",
    name: "Mughalai Biryani",
    image: "/menu/mughalai-biryani.png",
  },
  {
    id: "lollipop-biryani",
    name: "Lollipop Biryani",
    image: "/menu/lollipop-biryani.png",
  },
  {
    id: "chicken-fried-rice",
    name: "Chicken Fried Rice",
    image: "/menu/chicken-fried-rice.png",
  },
  {
    id: "veg-fried-rice",
    name: "Veg Fried Rice",
    image: "/menu/veg-fried-rice.png",
  },
  {
    id: "chilli-chicken",
    name: "Chilli Chicken",
    image: "/menu/chilli-chicken.png",
  },
  {
    id: "chilli-paneer",
    name: "Chilli Paneer",
    image: "/menu/chilli-paneer.png",
  },
];

function MenuCard({ item }) {
  return (
    <div className="menu-card">
      <img
        src={item.image}
        alt={item.name}
        draggable="false"
      />

      <div className="menu-card-info">
        <span>{item.name}</span>
      </div>
    </div>
  );
}

export default function MenuScroll() {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tracks = sectionRef.current.querySelectorAll(".menu-track");
      // Ambient, very slow floating pace
      const columnConfigs = [
        { isDown: false, duration: 34.0 }, // Column 1: ambient upward float (34s loop)
        { isDown: true, duration: 40.0 },  // Column 2: ambient downward float (40s loop)
        { isDown: false, duration: 30.0 }, // Column 3: gentle upward float (30s loop)
      ];

      tracks.forEach((track, index) => {
        if (!track) return;
        const config = columnConfigs[index % columnConfigs.length];

        gsap.fromTo(
          track,
          { yPercent: config.isDown ? -50 : 0 },
          {
            yPercent: config.isDown ? 0 : -50,
            duration: config.duration,
            ease: "none",
            repeat: -1,
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Columns staggered with unique distributions of the 9 authentic dishes
  const column1 = [
    userDishes[0], // Chicken Lollipops
    userDishes[3], // Mughalai Biryani
    userDishes[6], // Veg Fried Rice
    userDishes[1], // Chicken Dum Biryani
    userDishes[4], // Lollipop Biryani
    userDishes[7], // Chilli Chicken
  ];

  const column2 = [
    userDishes[1], // Chicken Dum Biryani
    userDishes[4], // Lollipop Biryani
    userDishes[7], // Chilli Chicken
    userDishes[2], // Chicken Fry Piece Biryani
    userDishes[5], // Chicken Fried Rice
    userDishes[8], // Chilli Paneer
  ];

  const column3 = [
    userDishes[2], // Chicken Fry Piece Biryani
    userDishes[5], // Chicken Fried Rice
    userDishes[8], // Chilli Paneer
    userDishes[0], // Chicken Lollipops
    userDishes[3], // Mughalai Biryani
    userDishes[6], // Veg Fried Rice
  ];

  const renderColumn = (items, index) => {
    const repeatedItems = [...items, ...items];

    return (
      <div className={`menu-column column-${index + 1}`}>
        <div className="menu-track">
          {repeatedItems.map((item, i) => (
            <MenuCard
              key={`${item.id}-${index}-${i}`}
              item={item}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <section
      id="menu"
      ref={sectionRef}
      className="menu-scroll-section"
    >
      <div className="menu-scroll-wrapper">
        {renderColumn(column1, 0)}
        {renderColumn(column2, 1)}
        {renderColumn(column3, 2)}
      </div>
    </section>
  );
}
