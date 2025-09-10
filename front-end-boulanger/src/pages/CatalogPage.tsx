import { useOutletContext } from "react-router-dom";
import { PublicProductGrid } from "@/components/Products/PublicProductGrid";

interface OutletContext {
  onLoginRequired: () => void;
}

export default function CatalogPage() {
  const { onLoginRequired } = useOutletContext<OutletContext>();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Catalogue des Produits
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Parcourez notre sélection complète de produits artisanaux
        </p>
      </div>
      <PublicProductGrid onLoginRequired={onLoginRequired} />
    </div>
  );
}
