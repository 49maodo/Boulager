import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAppDispatch } from '@/hooks/redux';
import { useGetCartQuery } from '@/store/api/cartApi';
import { setCartItems } from '@/store/slices/cartSlice';
import { Toaster } from '@/components/ui/sonner';

export function AuthenticatedLayout() {
  const dispatch = useAppDispatch();

  // Load cart data
  const { data: cartResponse } = useGetCartQuery();

  useEffect(() => {
    if (cartResponse?.data) {
      dispatch(setCartItems(cartResponse.data));
    }
  }, [cartResponse, dispatch]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
}