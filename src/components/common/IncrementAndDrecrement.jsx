import { Minus, Plus } from "lucide-react";
import { Button } from "../ui/Button";

export const IncremenAndDecrementComponent = ({
  item,
  increaseQuantity,
  decreaseQuantity,
  colorItems = "text-dark",
  errorAsistentes,
}) => {
  return (
    <div className="w-full min-h-12 bg-amber-opacity shadow-glow backdrop-blur-4xl flex justify-between rounded-full">
      <Button
        type="button-thirty"
        Icon={Minus}
        iconSize="small"
        onClick={decreaseQuantity}
        props={{ "aria-label": "Disminuir cantidad" }}
        customClass={`!p-0 min-w-12! !rounded-md border-none outline-none focus:outline-none focus:ring-0 focus:border-transparent ${errorAsistentes ? "border-red-500 text-red-500" : "text-secondary"} ${colorItems}/60`}
      />

      <span
        className={`flex-1 bg-secondary rounded-lg flex items-center justify-center text-dark text-center ${errorAsistentes ? "text-red-500" : ""}`}
      >
        {item}
      </span>
      <Button
        type="button-thirty"
        Icon={Plus}
        iconSize="small"
        onClick={increaseQuantity}
        props={{ "aria-label": "Aumentar cantidad" }}
        customClass={`!p-0 min-w-12! !rounded-md border-none outline-none focus:outline-none focus:ring-0 focus:border-transparent ${errorAsistentes ? "border-red-500 text-red-500" : "text-secondary"} ${colorItems}/60`}
      />
    </div>
  );
};
