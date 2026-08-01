<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $fillable = ['key', 'value'];

    public static function defaultSettings(): array
    {
        return [
            'home_name'        => 'Thimira Pathum',
            'home_greeting'    => 'Portfolio Journey',
            'home_roles'       => 'DevOps, MLOps, AI Integration, Linux Systems, Cloud Architecture',
            'home_tag'         => 'Evolving from basic scripting to designing robust orchestration architectures.',
            'home_description' => 'Building modern digital solutions through software engineering, networking, and innovation. Passionate about systems that are purposeful, efficient, and future-ready.',
            'profile_photo'    => '',
            'about_bio'        => "I'm Thimira Pathum, an ICT undergraduate at the University of Colombo with a strong focus on DevOps, backend development, Linux system administration, and AI/ML. I enjoy turning ideas into practical solutions by building software systems, automating workflows, and exploring modern technologies that solve real-world problems.\n\nI use Arch Linux as my daily development environment and work mainly with Python, FastAPI, Docker, GitHub Actions, and Azure to build backend services, containerized applications, and CI/CD pipelines. I'm also expanding my knowledge in Artificial Intelligence and Machine Learning, developing skills to create intelligent, data-driven applications.\n\nThis portfolio represents my journey of continuous learning and hands-on development. Through projects, experiments, and real-world implementations, I aim to grow as a software engineer while exploring the fields of DevOps, cloud infrastructure, and MLOps.",
            'social_email'     => 'pathumt675@gmail.com',
            'social_github'    => 'https://github.com/THIMIRAPATHUM',
            'social_linkedin'  => 'https://linkedin.com/in/thimira-pathum',
        ];
    }

    public static function get(string $key, string $default = ''): string
    {
        $value = static::where('key', $key)->value('value');
        if ($value !== null) {
            return $value;
        }

        $defaults = static::defaultSettings();
        return $defaults[$key] ?? $default;
    }

    public static function setMany(array $data): void
    {
        foreach ($data as $key => $value) {
            // firstOrCreate — only inserts if key doesn't exist
            // NEVER overwrites values the user has changed via admin
            static::firstOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }
    }

    public static function allAsMap(): array
    {
        $dbSettings = static::pluck('value', 'key')->toArray();
        return array_merge(static::defaultSettings(), $dbSettings);
    }
}
