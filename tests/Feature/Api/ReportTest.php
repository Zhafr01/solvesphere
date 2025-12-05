<?php

namespace Tests\Feature\Api;

use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_list_reports()
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;
        
        Report::factory()->count(3)->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/reports');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'current_page',
                'last_page',
                'total',
            ]);
    }

    public function test_user_can_create_report()
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/reports', [
            'title' => 'Test Report',
            'category' => 'Infrastructure',
            'urgency' => 'High',
            'content' => 'This is a test report content.',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'report',
            ]);

        $this->assertDatabaseHas('reports', ['title' => 'Test Report']);
    }

    public function test_user_can_update_own_report()
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;
        $report = Report::factory()->create(['user_id' => $user->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson("/api/reports/{$report->id}", [
            'title' => 'Updated Title',
            'category' => 'Infrastructure',
            'urgency' => 'Medium',
            'content' => 'Updated content.',
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Report updated successfully']);

        $this->assertDatabaseHas('reports', ['title' => 'Updated Title']);
    }

    public function test_user_can_delete_own_report()
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;
        $report = Report::factory()->create(['user_id' => $user->id]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->deleteJson("/api/reports/{$report->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Report deleted successfully']);

        $this->assertDatabaseMissing('reports', ['id' => $report->id]);
    }
}
