import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { PublicNavbar } from "./PublicNavbar";
import { LoginDialog } from "@/components/Auth/LoginDialog";
import { RegisterDialog } from "@/components/Auth/RegisterDialog";
import { CartSidebar } from "@/components/Cart/CartSidebar";
import { CheckoutDialog } from "@/components/Checkout/CheckoutDialog";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { useGetCartQuery } from "@/store/api/cartApi";
import { setCartItems } from "@/store/slices/cartSlice";
import { Toaster } from "@/components/ui/sonner";

export function PublicLayout() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Load cart data if authenticated
  const { data: cartResponse } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    if (cartResponse?.data) {
      dispatch(setCartItems(cartResponse.data));
    }
  }, [cartResponse, dispatch]);

  const handleLoginRequired = () => {
    setIsLoginOpen(true);
  };

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar
        onLoginClick={() => setIsLoginOpen(true)}
        onRegisterClick={() => setIsRegisterOpen(true)}
        onLoginRequired={handleLoginRequired}
      />

      <main>
        <Outlet context={{ onLoginRequired: handleLoginRequired }} />
      </main>

      <CartSidebar onCheckout={handleCheckout} />

      <LoginDialog
        open={isLoginOpen}
        onOpenChange={setIsLoginOpen}
        onRegisterClick={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
      />

      <RegisterDialog
        open={isRegisterOpen}
        onOpenChange={setIsRegisterOpen}
        onLoginClick={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
      />

      <CheckoutDialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen} />

      <Toaster />
    </div>
  );
}
