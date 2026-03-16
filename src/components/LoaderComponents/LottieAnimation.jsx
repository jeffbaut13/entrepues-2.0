import Lottie from "lottie-react";
import cartaAnimation from "../../data/carne.json";
import { useIsMobile } from "../../hooks/useIsMobile";

export const LottieAnimation = ({ className = "" }) => {
  const isMobile = useIsMobile();
  return (
    <div className={`lg:w-260 h-auto ${className}`}>
      <Lottie
        animationData={cartaAnimation}
        loop={true}
        autoplay={true}
        style={{
          width: isMobile ? "600px" : "100%",
          height: "100%",
        }}
      />
    </div>
  );
} ;
