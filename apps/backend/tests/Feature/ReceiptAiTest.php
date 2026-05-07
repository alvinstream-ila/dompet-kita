<?php

namespace Tests\Feature;

use App\Actions\AI\AnalyzeReceiptAction;
use App\Services\AI\AiProviderManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReceiptAiTest extends TestCase
{
    /**
     * Test that the receipt analyzer can handle a real (or mocked) AI response.
     */
    public function test_receipt_analyzer_works_with_current_config()
    {
        /** @var AiProviderManager $manager */
        $manager = app(AiProviderManager::class);
        $action = new AnalyzeReceiptAction($manager);

        // Dummy base64 1x1 white pixel
        $dummyImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';
        
        try {
            $result = $action->execute($dummyImage, 'image/png');
            
            $this->assertIsArray($result);
            $this->assertArrayHasKey('amount', $result);
            $this->assertArrayHasKey('merchant', $result);
            $this->assertArrayHasKey('category', $result);
            
            echo "Receipt AI Analysis Result:\n";
            print_r($result);
        } catch (\Exception $e) {
            $this->fail("Receipt analysis failed: " . $e->getMessage());
        }
    }
}
