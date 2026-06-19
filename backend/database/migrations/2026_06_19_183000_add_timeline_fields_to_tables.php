<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            if (!Schema::hasColumn('projects', 'timeline_order')) {
                $table->integer('timeline_order')->default(0)->nullable()->after('order');
            }
            if (!Schema::hasColumn('projects', 'milestone_year')) {
                $table->string('milestone_year')->nullable()->after('timeline_order');
            }
            if (!Schema::hasColumn('projects', 'visual_layout')) {
                $table->string('visual_layout')->default('auto')->nullable()->after('milestone_year');
            }
        });

        Schema::table('experiences', function (Blueprint $table) {
            if (!Schema::hasColumn('experiences', 'timeline_order')) {
                $table->integer('timeline_order')->default(0)->nullable()->after('order');
            }
            if (!Schema::hasColumn('experiences', 'milestone_year')) {
                $table->string('milestone_year')->nullable()->after('timeline_order');
            }
            if (!Schema::hasColumn('experiences', 'visual_layout')) {
                $table->string('visual_layout')->default('auto')->nullable()->after('milestone_year');
            }
            if (!Schema::hasColumn('experiences', 'featured')) {
                $table->boolean('featured')->default(false)->after('visual_layout');
            }
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['timeline_order', 'milestone_year', 'visual_layout']);
        });

        Schema::table('experiences', function (Blueprint $table) {
            $table->dropColumn(['timeline_order', 'milestone_year', 'visual_layout', 'featured']);
        });
    }
};
