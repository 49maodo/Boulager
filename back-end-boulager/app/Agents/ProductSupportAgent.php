<?php

namespace App\Agents;

use App\Tools\OrderLookupTool;
use App\Tools\ProductCompareTool;
use App\Tools\ProductSearchTool;
use Prism\Prism\Text\PendingRequest;
use Vizra\VizraADK\Agents\BaseLlmAgent;
use Vizra\VizraADK\Contracts\ToolInterface;
use Vizra\VizraADK\System\AgentContext;
use Prism\Prism\Enums\Provider;
// use App\Tools\YourTool; // Example: Import your tool

class ProductSupportAgent extends BaseLlmAgent
{
    protected string $name = 'product_support';

    protected string $description = 'Assistant IA spécialisé dans le conseil produit et support client';

    /**
     * Agent instructions hierarchy (first found wins):
     * 1. Runtime: $agent->setPromptOverride('...')
     * 2. Database: agent_prompt_versions table (if enabled)
     * 3. File: resources/prompts/product_support_agent/default.blade.php
     * 4. Fallback: This property
     *
     * The prompt file has been created for you at:
     * resources/prompts/product_support_agent/default.blade.php
     */
    protected string $instructions = "Tu es un assistant IA expert en support client et conseil produit
    Informations sur notre entreprise:
    - Vente de pains, viennoiseries, pâtisseries et formules petit-déjeuner
    - Commande en ligne avec livraison à domicile ou retrait en magasin
    - Livraison gratuite pour toute commande
    - Promotions régulières sur certains produits et packs (ex: formule petit-déjeuner)
    - Service client disponible 7j/7 de 8h à 20h

    Tes responsabilités:
    - Conseiller les clients sur les produits (allergènes, recommandations, packs, promotions)
    - Aider à passer une commande et expliquer les modes de paiement (en ligne ou à la livraison)
    - Informer sur le suivi des commandes et livraisons en temps réel
    - Répondre aux questions sur les factures, retours ou annulations
    - Proposer des produits alternatifs en cas de rupture de stock

    Sois toujours:
    - Amical et professionnel
    - Précis dans tes réponses
    - Proactif pour proposer des solutions
    - Capable de recommander des produits alternatifs";

    protected string $model = 'gemini-1.5-flash';
//    protected string $model = 'gemini-pro';

    protected array $tools = [
        // Example: YourTool::class,
        ProductSearchTool::class,
        OrderLookupTool::class,
        ProductCompareTool::class,
    ];

    /*

    Optional hook methods to override:

    public function beforeLlmCall(array $inputMessages, AgentContext $context): array
    {
        // $context->setState('custom_data_for_llm', 'some_value');
        // $inputMessages[] = ['role' => 'system', 'content' => 'Additional system note for this call.'];
        return parent::beforeLlmCall($inputMessages, $context);
    }

    public function afterLlmResponse(mixed $response, AgentContext $context, ?PendingRequest $request = null): mixed {

         return parent::afterLlmResponse($response, $context, $request);

    }

    public function beforeToolCall(string $toolName, array $arguments, AgentContext $context): array {

        return parent::beforeToolCall($toolName, $arguments, $context);

    }

    public function afterToolResult(string $toolName, string $result, AgentContext $context): string {

        return parent::afterToolResult($toolName, $result, $context);

    } */
}
