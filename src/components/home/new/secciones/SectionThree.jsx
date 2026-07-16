import { ChevronRight } from "lucide-react";
import { Button } from "../../../ui/Button";
import { useNavigate } from "react-router-dom";

export const SectionThree = () => {
  const navigate = useNavigate();
  const handleLinkClick = (href) => {
    navigate(href);
  };
  return (
    <div className="size-full flex justify-center items-center text-secondary">
      <div className="size-full pb-8 flex flex-col items-center justify-end">
        <Button
          title={
            <span className="flex justify-center items-center gap-3 transition-all ease-in-out duration-300">
              <span>Iniciar</span>
              <ChevronRight className="border border-brown rounded-full size-5" />
            </span>
          }
          type="newAnclaActive"
          fontSize="base"
          customClass="min-h-12 min-w-60!"
          onClick={() => handleLinkClick("/descubrenos")}
        />
      </div>
    </div>
  );
};
