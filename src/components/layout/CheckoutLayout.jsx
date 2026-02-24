import { useNavigate, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../ui/Button";
import { ChevronLeft, Home } from "lucide-react";
import { Logo } from "../ui/Logo";
import { Header } from "../header/Header";

const CheckoutLayout = () => {
  return (
    <div className="w-full h-dvh flex flex-col overflow-hidden">
      <Header loading={true} />
      <Outlet />
    </div>
  );
};
export default CheckoutLayout;
