<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Partner;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\News>
 */
class NewsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'admin_id' => User::factory(),
            'partner_id' => Partner::factory(),
            'title' => $this->faker->sentence,
            'content' => $this->faker->paragraph,
            'published_at' => now(),
        ];
    }
}
