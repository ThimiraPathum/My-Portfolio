<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Project;
use App\Models\Skill;
use App\Models\Experience;
use App\Models\SiteSetting;
use App\Models\Blog;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user - Thimira Pathum
        User::create([
            'name'         => 'Thimira Pathum',
            'email'        => 'kasthuriarachchipathum@gmail.com',
            'password'     => bcrypt('password'),
            'role'         => 'admin',
            'title'        => 'ICT Undergraduate | University of Colombo',
            'bio'          => 'An undergraduate at the University of Colombo passionate about software engineering, networking, web development, and building modern digital solutions.',
            'github_url'   => 'https://github.com/thimira-pathum',
            'linkedin_url' => 'https://linkedin.com/in/thimira-pathum',
        ]);

        // Projects
        $projects = [
            [
                'title'       => 'GoviMart',
                'description' => 'A digital marketplace platform designed to connect farmers and resellers in the fruit and vegetable trade. Focuses on improving visibility, communication, and transaction flow in the agricultural supply chain. Features include product listings, cart and checkout, multiple payment methods, order tracking, customer reviews, chat, featured ads, multilingual support, and third-party delivery integration.',
                'tech_stack'  => ['System Analysis', 'SRS Documentation', 'Marketplace Design', 'Project Planning'],
                'github_url'  => null,
                'live_url'    => null,
                'category'    => 'web',
                'featured'    => true,
                'order'       => 1,
            ],
            [
                'title'       => 'Gaming Community Platform',
                'description' => 'A web-based social platform for gamers focused on player interaction, community engagement, and event management. The goal is to create a digital space where gamers can connect, participate, and build active communities through social interaction and gamer-focused platform design.',
                'tech_stack'  => ['Web Design', 'Platform Architecture', 'UI Concepts', 'Community Systems'],
                'github_url'  => null,
                'live_url'    => null,
                'category'    => 'web',
                'featured'    => true,
                'order'       => 2,
            ],
            [
                'title'       => 'Greenhouse Monitoring Rover',
                'description' => 'A rover-based system created to monitor greenhouse environmental conditions using Arduino and ESP8266. Monitors temperature, humidity, and light intensity in real-time, expanding exposure to embedded systems, sensor-based monitoring, and practical IoT applications.',
                'tech_stack'  => ['Arduino', 'ESP8266', 'Embedded Systems', 'IoT', 'Sensor Networks'],
                'github_url'  => null,
                'live_url'    => null,
                'category'    => 'iot',
                'featured'    => false,
                'order'       => 3,
            ],
            [
                'title'       => 'Airline Reservation System — UML Design',
                'description' => 'A complete UML-based design project for an Airline Reservation System. Includes use case diagrams, use case descriptions, class diagrams, activity diagrams, and sequence diagrams — enabling structured software modeling before implementation.',
                'tech_stack'  => ['UML', 'System Analysis', 'Software Modeling', 'Use Case Design', 'Class Diagrams'],
                'github_url'  => null,
                'live_url'    => null,
                'category'    => 'design',
                'featured'    => false,
                'order'       => 4,
            ],
            [
                'title'       => 'Water Management & Irrigation Systems in Sri Lanka',
                'description' => 'A detailed research report covering ancient and modern water management and irrigation systems in Sri Lanka. Topics include historical irrigation infrastructure, modern water management, institutional governance, climate and environmental challenges, and future improvement strategies.',
                'tech_stack'  => ['Technical Writing', 'Research', 'Documentation', 'Academic Reporting'],
                'github_url'  => null,
                'live_url'    => null,
                'category'    => 'research',
                'featured'    => false,
                'order'       => 5,
            ],
        ];

        foreach ($projects as $project) {
            Project::create($project);
        }

        // Skills - Technical
        $skills = [
            ['name' => 'HTML5',                          'category' => 'Frontend',           'level' => 80, 'order' => 1],
            ['name' => 'CSS3',                           'category' => 'Frontend',           'level' => 78, 'order' => 2],
            ['name' => 'JavaScript',                     'category' => 'Frontend',           'level' => 72, 'order' => 3],
            ['name' => 'React',                          'category' => 'Frontend',           'level' => 68, 'order' => 4],
            ['name' => 'PHP',                            'category' => 'Backend',            'level' => 65, 'order' => 5],
            ['name' => 'XML / DOM',                      'category' => 'Backend',            'level' => 65, 'order' => 6],
            ['name' => 'C Programming',                  'category' => 'Backend',            'level' => 70, 'order' => 7],
            ['name' => 'SQL',                            'category' => 'Database',           'level' => 75, 'order' => 8],
            ['name' => 'Database Design',                'category' => 'Database',           'level' => 72, 'order' => 9],
            ['name' => 'UML Modeling',                   'category' => 'System Design',      'level' => 78, 'order' => 10],
            ['name' => 'Software Requirements Spec.',    'category' => 'System Design',      'level' => 75, 'order' => 11],
            ['name' => 'System Analysis & Design',       'category' => 'System Design',      'level' => 73, 'order' => 12],
            ['name' => 'Networking Fundamentals',        'category' => 'Networking',         'level' => 70, 'order' => 13],
            ['name' => 'Problem Solving',                'category' => 'Professional',       'level' => 85, 'order' => 14],
            ['name' => 'Technical Documentation',        'category' => 'Professional',       'level' => 82, 'order' => 15],
            ['name' => 'Project Planning',               'category' => 'Professional',       'level' => 78, 'order' => 16],
            ['name' => 'Team Collaboration',             'category' => 'Professional',       'level' => 85, 'order' => 17],
        ];

        foreach ($skills as $skill) {
            Skill::create($skill);
        }

        // Experience / Education
        $experiences = [
            [
                'company'     => 'University of Colombo',
                'role'        => 'Undergraduate — Information and Communication Technology',
                'description' => 'Currently pursuing undergraduate studies in ICT, developing knowledge and practical skills in Software Engineering, Web Application Development, Database Management, Networking, System Analysis and Design, and Technical Documentation.',
                'location'    => 'Colombo, Sri Lanka',
                'start_date'  => '2023-01-01',
                'end_date'    => null,
                'current'     => true,
                'tech_stack'  => ['Software Engineering', 'Web Development', 'Databases', 'Networking', 'System Analysis'],
                'order'       => 1,
            ],
        ];

        foreach ($experiences as $exp) {
            Experience::create($exp);
        }

        // Site Settings (editable from admin)
        SiteSetting::setMany([
            'home_greeting'    => 'Hello, I am',
            'home_name'        => 'Thimira Pathum',
            'home_tag'         => 'Building beyond limits with code and creativity.',
            'home_description' => 'Building modern digital solutions through software engineering, networking, and innovation. Passionate about systems that are purposeful, efficient, and future-ready.',
            'home_roles'       => 'Software Engineering,Web Development,Networking,System Design,ICT Undergraduate',
            'about_bio'        => "I'm Thimira Pathum, an undergraduate at the University of Colombo with a strong interest in software engineering, networking, web development, and system design. I enjoy building digital solutions that solve real problems and create meaningful user experiences.\n\nThrough academic and project-based work, I have developed skills in web technologies, software modeling, database concepts, technical documentation, and structured problem solving. I am passionate about continuous learning and building modern, purposeful technology.",
            'about_career'     => 'To become a skilled technology professional with strong capabilities in software engineering, networking, and modern digital system development. I want to contribute to projects that are innovative, efficient, scalable, and capable of solving meaningful real-world problems.',
            'contact_blurb'    => 'Interested in collaboration, project ideas, or technology conversations? Let\'s connect and build something meaningful.',
            'social_github'    => 'https://github.com/thimira-pathum',
            'social_linkedin'  => 'https://linkedin.com/in/thimira-pathum',
            'social_email'     => 'kasthuriarachchipathum@gmail.com',
        ]);

        // Sample blog post
        Blog::create([
            'title'       => 'My Journey into Software Engineering',
            'slug'        => 'my-journey-into-software-engineering',
            'excerpt'     => 'How I found my passion for software engineering as an ICT undergraduate at the University of Colombo.',
            'content'     => "## Introduction\n\nStarting university felt both exciting and overwhelming. As a new ICT undergraduate at the University of Colombo, I was stepping into a world of algorithms, databases, and systems I had only heard about.\n\n## What Sparked My Interest\n\nIt was during my first web development module that I realized how powerful code could be. Building a simple HTML page felt like creating something out of nothing — and that feeling was addictive.\n\n## What I've Learned\n\nThrough academic work and personal projects, I've gained experience in:\n- Web technologies (HTML, CSS, JavaScript, React)\n- System analysis and UML design\n- Database concepts and SQL\n- Software documentation\n\n## Looking Forward\n\nI'm excited to keep learning, building, and eventually contributing to systems that make a real difference. This blog is where I'll share that journey.",
            'status'      => 'published',
            'coming_soon' => false,
        ]);

        Blog::create([
            'title'       => 'Understanding UML — A Beginner\'s Guide',
            'slug'        => 'understanding-uml-beginners-guide',
            'excerpt'     => 'UML diagrams can seem complex at first. Here is how I approached learning them.',
            'content'     => '## Coming soon — full post in progress.',
            'status'      => 'draft',
            'coming_soon' => true,
        ]);
    }
}
