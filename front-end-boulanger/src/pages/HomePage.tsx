import { useOutletContext } from "react-router-dom";
import { PublicProductGrid } from "@/components/Products/PublicProductGrid";
import { useAppSelector } from "@/hooks/redux";
import { Navigate } from "react-router-dom";

interface OutletContext {
  onLoginRequired: () => void;
}

export default function HomePage() {
  const { onLoginRequired } = useOutletContext<OutletContext>();
  const { user } = useAppSelector((state) => state.auth);

  if (user?.role !== "client" && user) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl font-bold tracking-tight">
          Nos Produits Artisanaux
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Découvrez notre sélection de pains, viennoiseries et pâtisseries
          préparés avec amour selon nos recettes traditionnelles
        </p>
      </div>
      <PublicProductGrid onLoginRequired={onLoginRequired} />
    </div>
  );
}
