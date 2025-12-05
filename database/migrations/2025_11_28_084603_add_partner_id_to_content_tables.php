<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('news', 'partner_id')) {
            Schema::table('news', function (Blueprint $table) {
                $table->foreignId('partner_id')->nullable()->constrained()->onDelete('cascade');
            });
        }

        if (!Schema::hasColumn('forum_topics', 'partner_id')) {
            Schema::table('forum_topics', function (Blueprint $table) {
                $table->foreignId('partner_id')->nullable()->constrained()->onDelete('cascade');
            });
        }

        if (!Schema::hasColumn('reports', 'partner_id')) {
            Schema::table('reports', function (Blueprint $table) {
                $table->foreignId('partner_id')->nullable()->constrained()->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('news', function (Blueprint $table) {
            $table->dropForeign(['partner_id']);
            $table->dropColumn('partner_id');
        });

        Schema::table('forum_topics', function (Blueprint $table) {
            $table->dropForeign(['partner_id']);
            $table->dropColumn('partner_id');
        });

        Schema::table('reports', function (Blueprint $table) {
            $table->dropForeign(['partner_id']);
            $table->dropColumn('partner_id');
        });
    }
};
