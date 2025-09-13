<?php

namespace App\Http\Controllers;

use App\Http\Requests\PromotionRequest;
use App\Http\Requests\UpdatePromotionRequest;
use App\Http\Resources\PromotionResource;
use App\Models\Promotion;

class PromotionController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Promotion::class);

        return PromotionResource::collection(Promotion::all());
    }

    public function store(PromotionRequest $request)
    {
        $this->authorize('create', Promotion::class);

        $data = $request->validated();

        // On retire les produits_ids pour d'abord créer la promotion
        $produitsIds = $data['produits_ids'] ?? [];
        unset($data['produits_ids']);

        // Créer la promotion
        $promotion = Promotion::create($data);

        // Attacher les produits sélectionnés
        if (!empty($produitsIds)) {
            $promotion->produits()->attach($produitsIds);
        }

        return new PromotionResource($promotion->load('produits'));
    }

    public function show(Promotion $promotion)
    {
        $this->authorize('view', $promotion);

        return new PromotionResource($promotion);
    }

//    public function update(PromotionRequest $request, Promotion $promotion)
//    {
//        $this->authorize('update', $promotion);
//
//        $promotion->update($request->validated());
//
//        return new PromotionResource($promotion);
//    }
    public function update(UpdatePromotionRequest $request, Promotion $promotion)
    {
        $this->authorize('update', $promotion);

        $data = $request->validated();

        $produitsIds = $data['produits_ids'] ?? [];
        unset($data['produits_ids']);

        $promotion->update($data);

        // Mettre à jour les produits associés
        $promotion->produits()->sync($produitsIds);

        return new PromotionResource($promotion->load('produits'));
    }

    public function destroy(Promotion $promotion)
    {
        $this->authorize('delete', $promotion);

        $promotion->delete();

        return response()->json();
    }
}
