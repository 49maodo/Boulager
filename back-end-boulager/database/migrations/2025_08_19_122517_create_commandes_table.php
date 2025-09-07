<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('commandes', function (Blueprint $table) {
            $table->id();
            $table->string('numero_commande');
            $table->foreignIdFor(User::class, 'client_id')
                ->constrained('users')->onDelete('cascade');;
            $table->enum('statut',
                ['en_attente', 'confirmee', 'en_preparation', 'en_livraison','livree','annulee']
            )->default('en_attente')->nullable();
            $table->decimal('montant_total')->default(0.00)->nullable();
            $table->enum('mode_paiement', ['wave', 'om', 'espece'])->default('espece')->nullable();;
            $table->text('adresse_livraison');
            $table->date('date_livraison');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commandes');
    }
};
