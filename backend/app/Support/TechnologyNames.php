<?php

namespace App\Support;

class TechnologyNames
{
    private const NAMES = [
        'react' => 'React', 'reactjs' => 'React',
        'typescript' => 'TypeScript', 'javascript' => 'JavaScript',
        'tailwind' => 'Tailwind CSS', 'tailwindcss' => 'Tailwind CSS',
        'vue' => 'Vue', 'vuejs' => 'Vue', 'nextjs' => 'Next.js',
        'nodejs' => 'Node.js', 'express' => 'Express', 'expressjs' => 'Express',
        'laravel' => 'Laravel', 'sanctum' => 'Laravel Sanctum', 'laravelsanctum' => 'Laravel Sanctum',
        'restapi' => 'REST APIs', 'restapis' => 'REST APIs',
        'python' => 'Python', 'fastapi' => 'FastAPI', 'php' => 'PHP', 'java' => 'Java',
        'django' => 'Django', 'vite' => 'Vite', 'html' => 'HTML', 'css' => 'CSS',
        'mysql' => 'MySQL', 'sqlite' => 'SQLite', 'postgres' => 'PostgreSQL',
        'postgresql' => 'PostgreSQL', 'mongodb' => 'MongoDB', 'redis' => 'Redis',
        'docker' => 'Docker', 'githubactions' => 'GitHub Actions',
        'linux' => 'Linux', 'azure' => 'Azure', 'aws' => 'AWS', 'nginx' => 'Nginx',
        'terraform' => 'Terraform', 'ansible' => 'Ansible',
        'langgraph' => 'LangGraph', 'ollama' => 'Ollama', 'openaiapi' => 'OpenAI API',
        'groq' => 'Groq', 'tensorflow' => 'TensorFlow',
    ];

    private static function known(string $name): ?string
    {
        // Only discard a version suffix if the remaining name is recognized.
        $base = preg_replace('/\s*v?\d+(?:\.\d+)*(?:\.x|\.\*)?\+?$/i', '', trim($name));
        $key = strtolower(preg_replace('/[\s.\-_]+/', '', $base));
        return self::NAMES[$key] ?? null;
    }

    public static function expand(string $name): array
    {
        $name = preg_replace('/\s+/', ' ', trim($name));
        if ($name === '') return [];

        // Split recognized combinations, but preserve labels such as CI/CD,
        // AI/ML and unknown product names containing a slash.
        $parts = preg_split('/\s*\/\s*/', $name);
        if (count($parts) > 1) {
            $canonical = array_map(fn ($part) => self::known($part), $parts);
            if (!in_array(null, $canonical, true)) return array_values(array_unique($canonical));
        }

        return [self::known($name) ?? $name];
    }
}
