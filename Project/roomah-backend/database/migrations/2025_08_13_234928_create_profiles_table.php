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
    Schema::create('profiles', function (Blueprint $table) {
        $table->id();
        
        // Kolom untuk menghubungkan ke tabel 'users'
        $table->foreignId('user_id')->constrained()->onDelete('cascade');

        // Data Pribadi (dari form CV)
        $table->string('gender'); // 'Ikhwan' atau 'Akhwat'
        $table->date('dob'); // Date of Birth / Tanggal Lahir
        $table->string('job'); // Pekerjaan
        $table->string('education'); // Pendidikan
        $table->string('city'); // Kota Domisili
        $table->text('short_bio');
        $table->text('vision');

        // Data Tambahan untuk Tampilan di Kartu Profil
        $table->string('status')->default('ready'); // 'ready', 'process', 'khitbah'
        $table->string('candidate_code')->unique()->nullable(); // e.g., IKHWAN-001

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
