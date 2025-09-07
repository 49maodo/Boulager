<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('messages_chats', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(User::class, 'expediteur_id')->constrained('users')->onDelete('cascade');
            $table->foreignIdFor(User::class, 'destinataire_id')->constrained('users')->onDelete('cascade');
            $table->string('contenu');
            $table->enum('type_message', ['TEXTE', 'IMAGE', 'SYSTEME'])->default('TEXTE');
            $table->boolean('lu')->default(false);
            $table->boolean('is_ai_response')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages_chats');
    }
};
