<?php

namespace App\Http\Controllers;

use App\Http\Requests\produitRequest;
use App\Http\Resources\produitResource;
use App\Models\produit;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class produitController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', produit::class);

        return produitResource::collection(produit::all());
    }

    public function store(produitRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('produits', 'public');
        }

        $produit = produit::create($data);
        return new produitResource($produit);
    }

    public function show(produit $produit)
    {
        $this->authorize('view', $produit);

        return new produitResource($produit);
    }

    public function update(produitRequest $request, produit $produit)
    {
        $this->authorize('update', $produit);

//        $produit->update($request->validated());
//
//        return new produitResource($produit);
        $data = $request->validated();

        if ($request->hasFile('image')) {
            // 1) Supprimer l'ancienne image si elle existe
            if ($produit->image) {
                $old = ltrim($produit->image, '/');
                $old = Str::of($old)->replaceFirst('storage/', '');
                if ($old && Storage::disk('public')->exists($old)) {
                    Storage::disk('public')->delete($old);
                }
            }
            $data['image'] = $request->file('image')->store('produits', 'public');
        }

        $produit->update($data);
        return new produitResource($produit);
    }

    public function destroy(produit $produit)
    {
        $this->authorize('delete', $produit);

        $produit->delete();

        return response()->json();
    }
}
