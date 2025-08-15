<?php

namespace App\Http\Controllers;

use App\Http\Requests\categorieRequest;
use App\Http\Resources\categorieResource;
use App\Models\categorie;

class categorieController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', categorie::class);

        return categorieResource::collection(categorie::all());
    }

    public function store(categorieRequest $request)
    {
        $this->authorize('create', categorie::class);

        return new categorieResource(categorie::create($request->validated()));
    }

    public function show(categorie $categorie)
    {
        $this->authorize('view', $categorie);
        return new categorieResource($categorie);
    }

    public function update(categorieRequest $request, categorie $categorie)
    {
        $this->authorize('update', $categorie);

        $categorie->update($request->validated());

        return new categorieResource($categorie);
    }

    public function destroy(categorie $categorie)
    {
        $this->authorize('delete', $categorie);

        $categorie->delete();

        return response()->json();
    }
}
