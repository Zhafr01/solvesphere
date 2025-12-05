<?php

namespace Tests\Feature\Api;

use App\Models\Partner;
use App\Models\User;
use App\Models\News;
use App\Models\ForumTopic;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PartnerSiteTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_partner_site_data()
    {
        $partner = Partner::factory()->create([
            'status' => 'active',
            'slug' => 'test-partner',
        ]);

        $admin = User::factory()->create(['partner_id' => $partner->id]);

        News::factory()->count(3)->create(['partner_id' => $partner->id, 'admin_id' => $admin->id]);
        ForumTopic::factory()->count(5)->create(['partner_id' => $partner->id, 'user_id' => $admin->id]);

        $response = $this->getJson('/api/partners/test-partner');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'partner',
                'news',
                'topics',
            ]);
    }

    public function test_cannot_get_inactive_partner_site_data()
    {
        $partner = Partner::factory()->create([
            'status' => 'pending',
            'slug' => 'inactive-partner',
        ]);

        $response = $this->getJson('/api/partners/inactive-partner');

        $response->assertStatus(404);
    }

    public function test_cannot_get_non_existent_partner_site_data()
    {
        $response = $this->getJson('/api/partners/non-existent');

        $response->assertStatus(404);
    }
}
