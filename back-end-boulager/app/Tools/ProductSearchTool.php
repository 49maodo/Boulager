<?php

namespace App\Tools;

use App\Models\Produit;
use Vizra\VizraADK\Contracts\ToolInterface;
use Vizra\VizraADK\Memory\AgentMemory;
use Vizra\VizraADK\System\AgentContext;

class ProductSearchTool implements ToolInterface
{
    /**
     * Get the tool's definition for the LLM.
     * This structure should be JSON schema compatible.
     */
    public function definition(): array
    {
        return [
            'name' => 'product_search',
            'description' => 'Recherche des produits par nom, catégorie ou caractéristiques',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'query' => [
                        'type' => 'string',
                        'description' => 'Terme de recherche pour trouver des produits pertinents',
                    ],
                    'category' => [
                        'type' => 'string',
                        'description' => 'Catégorie de produits à filtrer (optionnel)',
                    ],
                    'min_price' => [
                        'type' => 'number',
                        'description' => 'Prix minimum pour filtrer les produits (optionnel)',
                    ],
                    'max_price' => [
                        'type' => 'number',
                        'description' => 'Prix maximum pour filtrer les produits (optionnel)',
                    ],
                    'in_stock' => [
                        'type' => 'boolean',
                        'description' => 'Filtrer uniquement les produits en stock (optionnel)',
                    ],
                ],
                'required' => ['query'],
            ],
        ];
    }

    /**
     * Execute the tool's logic.
     *
     * @param array $arguments Arguments provided by the LLM, matching the parameters defined above.
     * @param AgentContext $context The current agent context, providing access to session state etc.
     * @return string JSON string representation of the tool's result.
     */
    public function execute(array $arguments, AgentContext $context, AgentMemory $memory): string
    {
        $query = Produit::query();
        if (!empty($arguments['query'])) {
            $query->where('nom', 'like', '%' . $arguments['query'] . '%')
                ->orWhere('description', 'like', '%' . $arguments['query'] . '%');
        }
        if (!empty($arguments['category'])) {
            $query->whereHas('categorie', function ($q) use ($arguments) {
                $q->where('nom', $arguments['category']);
            });
        }
        if (isset($arguments['min_price'])) {
            $query->where('prix', '>=', $arguments['min_price']);
        }
        if (isset($arguments['max_price'])) {
            $query->where('prix', '<=', $arguments['max_price']);
        }
        $products = $query->limit(10)->get();

        $memory->addFact("Recherche produit: {$arguments['query']}", 0.8);
        $result = [
            'status' => 'success',
            'message' => 'Tool product_search executed with arguments: ' . json_encode($arguments),
            'data' => $products->map(function ($product) {
                return [
                    'id' => $product->id,
                    'nom' => $product->nom,
                    'description' => $product->description,
                    'prix' => $product->prix,
                    'quantite_stock' => $product->quantite_stock,
                ];
            }),
            'count' => $products->count(),
            // Add relevant data to the result
        ];

        // The result MUST be a JSON encoded string.
        return json_encode($result);
    }
}
