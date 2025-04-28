import React, { useEffect, useState } from "react";
import { CCarousel, CCarouselItem, CImage } from "@coreui/react";
import c1 from "../../Asset/Image/card.jpg";
import c2 from "../../Asset/Image/c2.jpg";
import { axiosInstancemain, baseURL } from "../../Functions/axios";
import "@coreui/coreui/dist/css/coreui.min.css";
import style from "../../Main.module.css";
const Carousel = () => {
  const [img, setimg] = useState([]);
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axiosInstancemain.get("carousel");
        console.log(data);

        setimg(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetch();
  }, []);

  return (
    <CCarousel controls interval={3000}>
      {img.map((i) => (
        <CCarouselItem interval={3000}>
          <CImage
            className={`${style.carouselimg} d-block w-100`}
            src={baseURL + i?.image}
            alt="slide 2"
          />
        </CCarouselItem>
      ))}
    </CCarousel>
  );
};

export default Carousel;
