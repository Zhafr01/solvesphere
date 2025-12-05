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
        Schema::table('forum_topics', function (Blueprint $table) {
            $table->foreignId('best_answer_id')->nullable()->constrained('forum_comments')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('forum_topics', function (Blueprint $table) {
            $table->dropForeign(['best_answer_id']);
            $table->dropColumn('best_answer_id');
        });
    }
};
