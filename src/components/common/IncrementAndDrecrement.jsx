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
    <div className="flex items-center gap-2 rounded-full">
      <Button
        type="button-thirty"
        Icon={Minus}
        iconSize="small"
        onClick={decreaseQuantity}
        props={{ "aria-label": "Disminuir cantidad" }}
        customClass={`opacity-40 hover:opacity-100 !p-1 !rounded-md border-none ${errorAsistentes ? "border-red-500 text-red-500" : ""} ${colorItems}/60`}
      />

      <span
        className={`w-6 text-center ${errorAsistentes ? "text-red-500" : ""}`}
      >
        {item}
      </span>
      <Button
        type="button-thirty"
        Icon={Plus}
        iconSize="small"
        onClick={increaseQuantity}
        props={{ "aria-label": "Aumentar cantidad" }}
        customClass={`opacity-40 hover:opacity-100 !p-1 !rounded-md border-none ${errorAsistentes ? "border-red-500 text-red-500" : ""} ${colorItems}/60`}
      />
    </div>
  );
};
