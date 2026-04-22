<?php

namespace App\Http\Controllers;

use App\Http\Resources\ScheduledTransactionResource;
use App\Models\ScheduledTransaction;
use App\Models\User;
use App\Services\Cfo\CfoAssistantService;
use App\Traits\HasApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ScheduledTransactionController extends Controller
{
    use HasApiResponses;

    /**
     * List all scheduled transactions for the authenticated user.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        $scheduled = ScheduledTransaction::latest()
            ->get();

        return ScheduledTransactionResource::collection($scheduled);
    }

    /**
     * Store a new scheduled transaction.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'type' => 'required|in:income,expense',
            'category' => 'nullable|string|max:100',
            'recurrence' => 'required|in:daily,weekly,monthly,yearly',
            'next_due_date' => 'required|date',
            'is_auto_execute' => 'boolean',
        ]);

        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        $validated['status'] = 'active';

        $scheduled = ScheduledTransaction::create($validated);

        return $this->success(
            new ScheduledTransactionResource($scheduled),
            'Jadwal transaksi rutin baru sudah aku catat ya Sayang! ✨',
            201
        );
    }

    /**
     * Show a specific scheduled transaction.
     */
    public function show(ScheduledTransaction $scheduledTransaction): JsonResponse
    {
        $this->authorize('view', $scheduledTransaction);

        return $this->success(new ScheduledTransactionResource($scheduledTransaction));
    }

    /**
     * Update an existing scheduled transaction.
     */
    public function update(Request $request, ScheduledTransaction $scheduledTransaction): JsonResponse
    {
        $this->authorize('update', $scheduledTransaction);

        $validated = $request->validate([
            'description' => 'sometimes|string|max:255',
            'amount' => 'sometimes|numeric|min:0',
            'type' => 'sometimes|in:income,expense',
            'category' => 'sometimes|string|max:100',
            'recurrence' => 'sometimes|in:daily,weekly,monthly,yearly',
            'next_due_date' => 'sometimes|date',
            'status' => 'sometimes|in:active,paused,finished',
            'is_auto_execute' => 'sometimes|boolean',
        ]);

        $scheduledTransaction->update($validated);

        return $this->success(new ScheduledTransactionResource($scheduledTransaction), 'Jadwal transaksinya sudah diperbarui! 👍');
    }

    /**
     * Delete a scheduled transaction.
     */
    public function destroy(ScheduledTransaction $scheduledTransaction): JsonResponse
    {
        $this->authorize('delete', $scheduledTransaction);

        $scheduledTransaction->delete();

        return $this->success(null, 'Jadwal transaksi rutin sudah dihapus. 👋', 204);
    }

    /**
     * Execute a scheduled transaction manually.
     */
    public function execute(ScheduledTransaction $scheduledTransaction, CfoAssistantService $cfo): JsonResponse
    {
        $this->authorize('update', $scheduledTransaction);

        $cfo->executeTransactionManually($scheduledTransaction);

        return $this->success(
            new ScheduledTransactionResource($scheduledTransaction),
            'Yeay! Tagihan sudah dilunasi dan dicatat ya Sayang! 💖'
        );
    }
}
