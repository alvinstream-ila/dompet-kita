<?php

namespace App\Models;

use Database\Factories\HouseholdFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property string $id (UUID)
 * @property string $name
 * @property int $owner_id
 * @property-read Collection<int, User> $users
 */
class Household extends Model
{
    /** @use HasFactory<HouseholdFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Disable auto-incrementing since we use UUIDs.
     */
    public $incrementing = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'id',
        'name',
        'owner_id',
    ];

    /**
     * The data type of the primary key.
     */
    protected $keyType = 'string';

    /**
     * @return HasMany<User, $this>
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
