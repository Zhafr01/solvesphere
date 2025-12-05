<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Partner;
use App\Models\Report;
use App\Models\ForumTopic;
use App\Models\News;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class PlatformSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Super Admin
        User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@solvesphere.com',
            'password' => Hash::make('password'),
            'role' => 'super_admin',
            'status' => 'active',
        ]);

        // 2. Create 2 Partners
        $partner1 = Partner::create([
            'name' => 'PixelForge Games',
            'slug' => 'pixelforge',
            'domain' => 'pixelforge',
            'description' => 'Creators of high-octane action games.',
            'website' => 'https://pixelforge.com',
            'logo' => 'https://ui-avatars.com/api/?name=Pixel+Forge&background=6366f1&color=fff',
            'banner' => 'https://picsum.photos/seed/pixelforge/1200/400',
            'status' => 'approved',
        ]);

        $partner2 = Partner::create([
            'name' => 'Nebula Studios',
            'slug' => 'nebula',
            'domain' => 'nebula',
            'description' => 'Crafting immersive sci-fi experiences.',
            'website' => 'https://nebulastudios.com',
            'logo' => 'https://ui-avatars.com/api/?name=Nebula+Studios&background=8b5cf6&color=fff',
            'banner' => 'https://picsum.photos/seed/nebula/1200/400',
            'status' => 'approved',
        ]);

        // Create Partner Admins
        User::create([
            'name' => 'Pixel Admin',
            'email' => 'admin@pixelforge.com',
            'password' => Hash::make('password'),
            'role' => 'partner_admin',
            'partner_id' => $partner1->id,
            'status' => 'active',
        ]);

        User::create([
            'name' => 'Nebula Admin',
            'email' => 'admin@nebula.com',
            'password' => Hash::make('password'),
            'role' => 'partner_admin',
            'partner_id' => $partner2->id,
            'status' => 'active',
        ]);

        // 3. Create 20 General Users
        $users = User::factory(20)->create([
            'role' => 'general_user',
            'status' => 'active',
        ]);

        $partnerIds = [$partner1->id, $partner2->id, null];

        // 4. Create Dummy Content
        foreach ($users as $user) {
            // Reports (5 per user)
            Report::factory(5)->create([
                'user_id' => $user->id,
                'partner_id' => $partnerIds[array_rand($partnerIds)],
            ]);

            // Forum Topics (5 per user)
            ForumTopic::factory(5)->create([
                'user_id' => $user->id,
                'partner_id' => $partnerIds[array_rand($partnerIds)],
            ]);
        }

        // Create some News (50 items)
        for ($i = 0; $i < 50; $i++) {
            News::create([
                'title' => 'News Update #' . ($i + 1),
                'content' => 'This is a sample news update content for testing purposes. It contains enough text to look like a real article.',
                'partner_id' => $partnerIds[array_rand($partnerIds)],
                'admin_id' => 1, // Assuming Super Admin
                'published_at' => now()->subDays(rand(0, 30)),
            ]);
        }

        // Create Ratings
        foreach ($users as $user) {
            if (rand(0, 1)) {
                \App\Models\PartnerRating::create([
                    'user_id' => $user->id,
                    'partner_id' => $partner1->id,
                    'rating' => rand(3, 5),
                    'comment' => 'Great partner!',
                ]);
            }

            if (rand(0, 1)) {
                \App\Models\PartnerRating::create([
                    'user_id' => $user->id,
                    'partner_id' => $partner2->id,
                    'rating' => rand(4, 5),
                    'comment' => 'Awesome games!',
                ]);
            }
        }
    }
}
