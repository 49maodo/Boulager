<?php

use App\Models\Commande;
use App\Models\Produit;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('commande_produits', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Commande::class)->constrained('commandes')->onDelete('cascade');
            $table->foreignIdFor(Produit::class)->constrained('produits')->nullOnDelete();
            $table->integer('quantite')->default(1)->nullable();
            $table->decimal('prix_unitaire', 10, 2);
            $table->decimal('sous_total',10,2)->computed('quantite * prix_unitaire')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commande_produits');
    }
};
