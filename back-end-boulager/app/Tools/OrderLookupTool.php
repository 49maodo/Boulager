<?php

namespace App\Tools;

use App\Http\Resources\CommandeResource;
use App\Models\Commande;
use Vizra\VizraADK\Contracts\ToolInterface;
use Vizra\VizraADK\Memory\AgentMemory;
use Vizra\VizraADK\System\AgentContext;

class OrderLookupTool implements ToolInterface
{
    /**
     * Get the tool's definition for the LLM.
     * This structure should be JSON schema compatible.
     */
    public function definition(): array
    {
        return [
            'name' => 'order_lookup',
            'description' => 'Recherche une commande par numéro',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'order_id' => [
                        'type' => 'string',
                        'description' => 'Numéro de commande',
                    ],
                ],
                'required' => ['order_id'],
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
        $order = Commande::with(['commandeProduits.produit', 'client'])
            ->where('id', $arguments['order_id'])->first();

        if (!$order) {
            return json_encode(['error' => 'Commande non trouvée']);
        }

        $memory->addFact("Consultation commande #{$order->id}", 1.0);

        // Implement tool logic here...
        $result = [
            'status' => 'success',
            'message' => 'Tool order_lookup executed with arguments: ' . json_encode($arguments),
            'data' => CommandeResource::make($order),
            // Add relevant data to the result
        ];

        // The result MUST be a JSON encoded string.
        return json_encode($result);
    }
}
