<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string $name
 * @property AssetType $type
 * @property float $quantity
 * @property string|null $unit
 * @property bool $is_market_synced
 * @property float $value
 * @property float $invested_capital
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activitiesAsSubject
 * @property-read int|null $activities_as_subject_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\AssetTransaction> $transactions
 * @property-read int|null $transactions_count
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Asset marketSynced()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Asset newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Asset newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Asset query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Asset whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Asset whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Asset whereInvestedCapital($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Asset whereIsMarketSynced($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Asset whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Asset whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Asset whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Asset whereUnit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Asset whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Asset whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Asset whereValue($value)
 */
	class Asset extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property int $asset_id
 * @property int|null $source_asset_id
 * @property float $amount
 * @property string $type
 * @property string|null $description
 * @property \Illuminate\Support\Carbon $transaction_date
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Asset $asset
 * @property-read \App\Models\Asset|null $sourceAsset
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssetTransaction newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssetTransaction newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssetTransaction query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssetTransaction whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssetTransaction whereAssetId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssetTransaction whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssetTransaction whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssetTransaction whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssetTransaction whereSourceAssetId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssetTransaction whereTransactionDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssetTransaction whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssetTransaction whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssetTransaction whereUserId($value)
 */
	class AssetTransaction extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string $category
 * @property float $limit
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Budget newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Budget newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Budget query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Budget whereCategory($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Budget whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Budget whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Budget whereLimit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Budget whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Budget whereUserId($value)
 */
	class Budget extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string $role
 * @property string $content
 * @property array<array-key, mixed>|null $metadata
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChatHistory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChatHistory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChatHistory query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChatHistory whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChatHistory whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChatHistory whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChatHistory whereMetadata($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChatHistory whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChatHistory whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChatHistory whereUserId($value)
 */
	class ChatHistory extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string $type
 * @property string $content
 * @property array<array-key, mixed>|null $metadata
 * @property \Illuminate\Support\Carbon|null $read_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialWisdom newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialWisdom newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialWisdom query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialWisdom whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialWisdom whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialWisdom whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialWisdom whereMetadata($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialWisdom whereReadAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialWisdom whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialWisdom whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialWisdom whereUserId($value)
 */
	class FinancialWisdom extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $user_id
 * @property string $name
 * @property float $target_amount
 * @property float $current_amount
 * @property Carbon|null $deadline
 * @property string $category
 * @property string $status
 * @property string|null $icon
 * @property int $id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\GoalTransaction> $transactions
 * @property-read int|null $transactions_count
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Goal newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Goal newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Goal query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Goal whereCategory($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Goal whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Goal whereCurrentAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Goal whereDeadline($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Goal whereIcon($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Goal whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Goal whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Goal whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Goal whereTargetAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Goal whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Goal whereUserId($value)
 */
	class Goal extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property int $goal_id
 * @property int|null $asset_id
 * @property float $amount
 * @property string $type
 * @property string|null $description
 * @property \Illuminate\Support\Carbon $date
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 * @property-read \App\Models\Asset|null $asset
 * @property-read \App\Models\Goal $goal
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoalTransaction newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoalTransaction newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoalTransaction query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoalTransaction whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoalTransaction whereAssetId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoalTransaction whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoalTransaction whereDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoalTransaction whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoalTransaction whereGoalId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoalTransaction whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoalTransaction whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoalTransaction whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoalTransaction whereUserId($value)
 */
	class GoalTransaction extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string $destination
 * @property numeric $budget
 * @property \Illuminate\Support\Carbon|null $start_date
 * @property \Illuminate\Support\Carbon|null $end_date
 * @property string $status
 * @property string|null $itinerary
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property numeric $spent
 * @property string|null $image_url
 * @property numeric $funded_amount
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\HolidayTransaction> $transactions
 * @property-read int|null $transactions_count
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday whereBudget($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday whereDestination($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday whereEndDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday whereFundedAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday whereImageUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday whereItinerary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday whereSpent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday whereStartDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday whereUserId($value)
 */
	class Holiday extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property int $holiday_id
 * @property int|null $asset_id
 * @property float $amount
 * @property string $type
 * @property string|null $description
 * @property \Illuminate\Support\Carbon $transaction_date
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 * @property-read \App\Models\Asset|null $asset
 * @property-read \App\Models\Holiday $holiday
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HolidayTransaction newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HolidayTransaction newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HolidayTransaction query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HolidayTransaction whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HolidayTransaction whereAssetId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HolidayTransaction whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HolidayTransaction whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HolidayTransaction whereHolidayId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HolidayTransaction whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HolidayTransaction whereTransactionDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HolidayTransaction whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HolidayTransaction whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|HolidayTransaction whereUserId($value)
 */
	class HolidayTransaction extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string $type
 * @property float $amount
 * @property float $remaining_amount
 * @property string|null $description
 * @property string $contact_name
 * @property Carbon|null $due_date
 * @property string $status
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 * @property float $total // Dynamic field
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activitiesAsSubject
 * @property-read int|null $activities_as_subject_count
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereContactName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereDueDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereRemainingAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereUserId($value)
 */
	class Loan extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property \Illuminate\Support\Carbon|null $login_at
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property array<array-key, mixed>|null $metadata
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoginHistory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoginHistory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoginHistory query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoginHistory whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoginHistory whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoginHistory whereIpAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoginHistory whereLoginAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoginHistory whereMetadata($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoginHistory whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoginHistory whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoginHistory whereUserAgent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoginHistory whereUserId($value)
 */
	class LoginHistory extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $inviter_id
 * @property string $email
 * @property string $token
 * @property string $status
 * @property \Illuminate\Support\Carbon $expires_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $inviter
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PartnerInvitation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PartnerInvitation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PartnerInvitation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PartnerInvitation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PartnerInvitation whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PartnerInvitation whereExpiresAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PartnerInvitation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PartnerInvitation whereInviterId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PartnerInvitation whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PartnerInvitation whereToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PartnerInvitation whereUpdatedAt($value)
 */
	class PartnerInvitation extends \Eloquent {}
}

namespace App\Models{
/**
 * @property string $id
 * @property int $user_id
 * @property string $description
 * @property float $amount
 * @property TransactionType $type
 * @property string $category
 * @property RecurrenceFrequency $recurrence
 * @property \Illuminate\Support\Carbon $next_due_date
 * @property ScheduleStatus $status
 * @property bool $is_auto_execute
 * @property Carbon|null $last_executed_at
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ScheduledTransaction active()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ScheduledTransaction due()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ScheduledTransaction newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ScheduledTransaction newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ScheduledTransaction query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ScheduledTransaction whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ScheduledTransaction whereCategory($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ScheduledTransaction whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ScheduledTransaction whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ScheduledTransaction whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ScheduledTransaction whereIsAutoExecute($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ScheduledTransaction whereLastExecutedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ScheduledTransaction whereNextDueDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ScheduledTransaction whereRecurrence($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ScheduledTransaction whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ScheduledTransaction whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ScheduledTransaction whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ScheduledTransaction whereUserId($value)
 */
	class ScheduledTransaction extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property \Illuminate\Support\Carbon $date
 * @property float $amount
 * @property string $category
 * @property string|null $sub_category
 * @property TransactionType $type
 * @property string|null $description
 * @property string|null $note
 * @property string|null $receipt_url
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 * @property float $total // Dynamic field for aggregate queries
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Activitylog\Models\Activity> $activitiesAsSubject
 * @property-read int|null $activities_as_subject_count
 * @property-read \App\Models\Asset|null $asset
 * @property-read \App\Models\User $user
 * @method static \Database\Factories\TransactionFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction filterByPeriod(?int $month, ?int $year, int $startDay = 1)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereCategory($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereReceiptUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereSubCategory($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Transaction whereUserId($value)
 */
	class Transaction extends \Eloquent {}
}

namespace App\Models{
/**
 * @property string $id
 * @property int $user_id
 * @property string $type
 * @property string $title
 * @property string $content
 * @property numeric $impact_value
 * @property string $status
 * @property string|null $action_url
 * @property array<array-key, mixed>|null $metadata
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionInsight newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionInsight newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionInsight query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionInsight whereActionUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionInsight whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionInsight whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionInsight whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionInsight whereImpactValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionInsight whereMetadata($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionInsight whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionInsight whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionInsight whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionInsight whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TransactionInsight whereUserId($value)
 */
	class TransactionInsight extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $full_name
 * @property string|null $avatar_url
 * @property string|null $partner_name
 * @property Carbon|null $anniversary_date
 * @property string $timezone
 * @property int $budget_cycle_start
 * @property bool $is_privacy_mode
 * @property bool $is_eco_mode
 * @property string $currency_format
 * @property float $exchange_rate
 * @property float $monthly_budget_limit
 * @property int $legacy_threshold_months
 * @property bool $is_legacy_triggered
 * @property int|null $partner_id
 * @property float|null $large_expense_threshold
 * @property User|null $partner
 * @property Carbon|null $last_active_at
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 * @method static \Database\Factories\UserFactory factory(...$parameters)
 * @method static \Illuminate\Database\Eloquent\Builder|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|User query()
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string|null $password
 * @property string|null $remember_token
 * @property string|null $social_id
 * @property string|null $social_type
 * @property bool $two_factor_enabled
 * @property string|null $two_factor_code
 * @property string|null $two_factor_expires_at
 * @property string|null $email_verification_code
 * @property string|null $email_verification_expires_at
 * @property string|null $otp_reset_code
 * @property string|null $otp_reset_expires_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Asset> $assets
 * @property-read int|null $assets_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ChatHistory> $chatHistories
 * @property-read int|null $chat_histories_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\FinancialWisdom> $financialWisdoms
 * @property-read int|null $financial_wisdoms_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Goal> $goals
 * @property-read int|null $goals_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Loan> $loans
 * @property-read int|null $loans_count
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ScheduledTransaction> $scheduledTransactions
 * @property-read int|null $scheduled_transactions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Transaction> $transactions
 * @property-read int|null $transactions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\WealthHistory> $wealthHistories
 * @property-read int|null $wealth_histories_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereAnniversaryDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereAvatarUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereBudgetCycleStart($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCurrencyFormat($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerificationCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerificationExpiresAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereExchangeRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereFullName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereIsEcoMode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereIsLegacyTriggered($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereIsPrivacyMode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereLargeExpenseThreshold($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereLastActiveAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereLegacyThresholdMonths($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereMonthlyBudgetLimit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereOtpResetCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereOtpResetExpiresAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePartnerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePartnerName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereSocialId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereSocialType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTimezone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTwoFactorCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTwoFactorEnabled($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTwoFactorExpiresAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 */
	class User extends \Eloquent implements \Illuminate\Contracts\Auth\MustVerifyEmail {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property int $month
 * @property int $year
 * @property numeric $total_value
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WealthHistory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WealthHistory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WealthHistory query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WealthHistory whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WealthHistory whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WealthHistory whereMonth($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WealthHistory whereTotalValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WealthHistory whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WealthHistory whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WealthHistory whereYear($value)
 */
	class WealthHistory extends \Eloquent {}
}

