<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Report>
 */
class ReportFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => $this->faker->sentence,
            'category' => $this->faker->randomElement(['Infrastructure', 'Academic', 'Facility']),
            'urgency' => $this->faker->randomElement(['Low', 'Medium', 'High', 'Critical']),
            'content' => $this->faker->paragraph,
            'status' => $this->faker->randomElement(['pending', 'in_progress', 'resolved']),
        ];
    }
}
