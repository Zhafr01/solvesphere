<?php

namespace Tests\Feature\Api;

use App\Models\ForumTopic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ForumTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_list_topics()
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;
        
        ForumTopic::factory()->count(3)->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/forum-topics');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'current_page',
            ]);
    }

    public function test_user_can_create_topic()
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/forum-topics', [
            'title' => 'Test Topic',
            'content' => 'This is a test topic content.',
            'category' => 'General',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'topic',
            ]);

        $this->assertDatabaseHas('forum_topics', ['title' => 'Test Topic']);
    }

    public function test_user_can_comment_on_topic()
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;
        $topic = ForumTopic::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson("/api/forum-topics/{$topic->id}/comments", [
            'content' => 'This is a comment.',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'comment',
            ]);

        $this->assertDatabaseHas('forum_comments', ['content' => 'This is a comment.']);
    }
}
