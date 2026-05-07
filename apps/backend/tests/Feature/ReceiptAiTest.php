<?php

namespace Tests\Feature;

use App\Actions\AI\AnalyzeReceiptAction;
use App\Services\AI\AiProviderManager;
use Tests\TestCase;

class ReceiptAiTest extends TestCase
{
    /**
     * Test that the receipt analyzer can handle a real (or mocked) AI response.
     */
    public function test_receipt_analyzer_works_with_current_config(): void
    {
        $mockManager = $this->mock(AiProviderManager::class);
        $mockManager->shouldReceive('generateFromImage')
            /** @phpstan-ignore-next-line */
            ->once()
            ->andReturn(json_encode([
                'amount' => 150000,
                'merchant' => 'Indomaret',
                'date' => '2024-05-01',
                'category' => 'Belanja',
                'currency' => 'IDR',
                'items' => [
                    ['name' => 'Susu', 'qty' => 1, 'price' => 25000],
                    ['name' => 'Roti', 'qty' => 1, 'price' => 15000],
                ],
            ]));

        $action = new AnalyzeReceiptAction($mockManager);

        // Dummy base64 1x1 white pixel
        $dummyImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';

        try {
            /** @var array<string, mixed> $result */
            $result = $action->execute((string) $dummyImage, 'image/png');

            $this->assertArrayHasKey('amount', $result);
            $this->assertArrayHasKey('merchant', $result);
            $this->assertArrayHasKey('category', $result);
            $this->assertEquals(150000, $result['amount']);
            $this->assertEquals('Indomaret', $result['merchant']);

            echo "Receipt AI Analysis Result (Mocked):\n";
            print_r($result);
        } catch (\Exception $e) {
            $this->fail('Receipt analysis failed: '.$e->getMessage());
        }
    }
}
