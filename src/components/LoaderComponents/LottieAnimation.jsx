import Lottie from "lottie-react";
import cartaAnimation from "../../data/carne.json";

export const LottieAnimation = ({ className = "" }) => {
  return (
    <div className={`w-260 h-auto ${className}`}>
      <Lottie
        animationData={cartaAnimation}
        loop={true}
        autoplay={true}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};
