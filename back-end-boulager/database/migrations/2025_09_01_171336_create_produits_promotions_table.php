<?php

use App\Models\Produit;
use App\Models\Promotion;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('produits_promotions', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Produit::class)->constrained('produits')->onDelete('cascade');
            $table->foreignIdFor(Promotion::class)->constrained('promotions')->onDelete('cascade');;
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('produits_promotions');
    }
};
