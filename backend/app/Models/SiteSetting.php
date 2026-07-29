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
            'profile_photo'    => '/profile.jpg',
            'about_bio'        => "I am Thimira Pathum, an Information and Communication Technology undergraduate at the University of Colombo whose career is defined by optimizing complex systems.\n\nMy professional roots as an award-winning industrial mechanic instilled a rigorous, hands-on approach to preventive maintenance and troubleshooting. I brought that analytical mindset into software engineering, and it now drives my journey into DevOps and MLOps.\n\nI thrive at the intersection of infrastructure and development — combining my expertise in custom Linux architectures, backend development (Java, Laravel), and networking to automate workflows, streamline deployments, and operationalize machine learning models.\n\nI am passionate about building resilient systems that bridge the gap between clean code and reliable production environments.",
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
            static::updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }

    public static function allAsMap(): array
    {
        $dbSettings = static::pluck('value', 'key')->toArray();
        return array_merge(static::defaultSettings(), $dbSettings);
    }
}
