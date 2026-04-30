<?php

declare(strict_types=1);

namespace App\Actions\AI;

use App\Actions\BaseAction;
use App\Models\ChatHistory;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class ClearChatHistoryAction extends BaseAction
{
    /**
     * Clear (delete) all chat history for the current user/household.
     */
    public function execute(User $user): bool
    {
        try {
            // Scoped to household automatically via HasHouseholdScope
            $deletedCount = ChatHistory::where('user_id', $user->id)->delete();

            Log::info("Chat history cleared for user {$user->id}. Deleted ".$deletedCount.' records.'); // @phpstan-ignore binaryOp.invalid


            return true;
        } catch (\Exception $e) {
            Log::error('Failed to clear chat history: '.$e->getMessage());

            return false;
        }
    }
}
