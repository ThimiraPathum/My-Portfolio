<?php

namespace Tests\Support;

use App\Services\BlogAgent\Schemas;

/** Synthetic evidence and articles. These are test data, NOT live research. */
class BlogAgentFixtures
{
    public static function example(string $category = 'ai_ml'): array
    {
        $data = match ($category) {
            'film_tv' => [
                'Past Lives: reading distance as a dramatic choice',
                'A spoiler-free interpretation of distance and memory, based on a simulated research packet.',
                ['https://a24films.com/films/past-lives', 'https://a24films.com/notes/2023/06/a-note-from-celine-song'],
                ['Past Lives is written and directed by Celine Song. The cinematographer is Shabier Kirchner. Nora and Hae Sung are childhood friends who reconnect after years apart. This source packet is a synthetic fixture for checking credits, and does not represent a retrieved film review.',
                    'The story follows Nora and Hae Sung across separation and reunion. Their relationship provides a frame for considering memory and the alternatives a person imagines for a life. This is a synthetic synopsis for tests; it is not a transcript, interview or independent production report.'],
                [
                    ['The premise', 'fact', 'The supplied synopsis places Nora and Hae Sung at the centre of a story about separation and reunion. This is enough to introduce their relationship without revealing its resolution. A review can begin with that premise and resist turning the introduction into a list of plot events.', 'S2', 'The story follows Nora and Hae Sung across separation and reunion.'],
                    ['Credits before interpretation', 'fact', 'The simulated credits identify Celine Song as writer and director and Shabier Kirchner as cinematographer. Keeping those roles distinct matters: an interpretation of a film does not justify attributing every visual decision to the director or inventing a production interview.', 'S1', 'Past Lives is written and directed by Celine Song. The cinematographer is Shabier Kirchner.'],
                    ['Distance as a reading', 'interpretation', 'One possible reading of this premise is that distance represents the lives the characters can imagine but cannot share. That is an interpretation of the setup, not a claim about a specific scene or an assertion of the filmmaker’s intentions. A fuller review would need more material about the film’s execution.', null, null],
                ],
            ],
            'cybersecurity' => [
                'SSH changes: validation before closing the working session',
                'A cautious configuration workflow that keeps validation and recovery separate from activation.',
                ['https://man.openbsd.org/sshd', 'https://man.openbsd.org/sshd_config'],
                ['The sshd -t option checks the validity of the configuration file and sanity of the keys. It does not start a new listening service. This synthetic manual excerpt exists for automated testing, and should not be used as a replacement for the manual installed with a particular OpenSSH version.',
                    'The sshd_config file controls the SSH daemon configuration. A Match block can apply conditional settings for particular connections. These sentences are synthetic evidence for tests, not fetched documentation or proof that a proposed configuration works on every operating system.'],
                [
                    ['Check before activation', 'guidance', 'A configuration change creates a lockout risk. In this illustrative workflow, keep an existing session open and validate the candidate configuration before activation. The syntax check is a prerequisite, not proof that a fresh login will succeed. Verify the command against the manual for the installed version.', 'S1', 'The sshd -t option checks the validity of the configuration file and sanity of the keys.'],
                    ['Account for scope', 'fact', 'The configuration file can contain conditional Match settings. A rule that appears appropriate globally may therefore be insufficient to explain the configuration for a particular connection. Record the account and connection conditions under review instead of assuming that one reading covers every user.', 'S2', 'A Match block can apply conditional settings for particular connections.'],
                    ['Recovery is part of the plan', 'interpretation', 'For operational use, this example still needs a human review of the actual server and a recovery path. A prudent review would ask how to restore the previous configuration, how to test a separate connection and how to retain access if that test fails. It should not be treated as a universal copy-paste hardening script.', null, null],
                ],
            ],
            default => [
                'Cross-validation: keep preprocessing inside the training fold',
                'How data leakage can distort evaluation, and why the separation between fitting and testing matters.',
                ['https://scikit-learn.org/stable/common_pitfalls.html', 'https://scikit-learn.org/stable/modules/cross_validation.html'],
                ['Data leakage occurs when information that would not be available at prediction time is used when building the model. Preprocessing must be learned only from the training subset. A pipeline helps keep transformations and the estimator together. This is synthetic fixture evidence, not a live copy of documentation.',
                    'Cross-validation splits data repeatedly into training and validation subsets. The test set should remain separate from model selection. Grouped or time-ordered observations need splitting strategies that respect their structure. This is a synthetic source excerpt used to exercise the research pipeline in tests.'],
                [
                    ['Where leakage begins', 'fact', 'Data leakage means that information unavailable at prediction time has influenced model building. In preprocessing, the key question is which observations were used to learn a transformation. A reported validation result becomes difficult to interpret when the held-out observations have already informed those fitted choices.', 'S1', 'Data leakage occurs when information that would not be available at prediction time is used when building the model.'],
                    ['Separate the evaluation stages', 'fact', 'Cross-validation repeatedly creates training and validation subsets. Keep the final test set separate from model selection so that choosing a configuration does not also consume the evidence intended for final evaluation. The two stages answer different questions about the development process.', 'S2', 'Cross-validation splits data repeatedly into training and validation subsets. The test set should remain separate from model selection.'],
                    ['Respect the observations', 'guidance', 'Choose a splitting strategy that respects grouped or time-ordered observations. A pipeline can help organise fitted transformations, but it does not decide which observations should be held out. Document the intended prediction setting and justify why the evaluation split resembles that setting.', 'S2', 'Grouped or time-ordered observations need splitting strategies that respect their structure.'],
                ],
            ],
        };
        [$title, $excerpt, $urls, $texts, $blocks] = $data;
        $draft = ['title' => $title, 'excerpt' => $excerpt, 'blocks' => array_map(fn ($b) => [
            'heading' => $b[0], 'kind' => $b[1], 'text' => $b[2], 'evidence' => $b[3] ? [['source_id' => $b[3], 'quote' => $b[4]]] : [],
        ], $blocks)];
        $sources = [];
        foreach ($urls as $i => $url) {
            $sources[] = ['id' => 'S'.($i + 1), 'url' => $url, 'title' => 'SIMULATED source '.($i + 1), 'text' => $texts[$i],
                'published_at' => null, 'retrieved_at' => '2026-10-28T00:00:00+00:00', 'sha256' => hash('sha256', $texts[$i])];
        }

        return ['draft' => $draft, 'sources' => $sources, 'topic' => ['category' => $category, 'title' => $title]];
    }

    public static function plan(): array
    {
        return ['angle' => 'A specific evidence-led explanation', 'headings' => ['Concept', 'Implications'],
            'source_ids' => ['S1', 'S2'], 'uncertainties' => [], 'can_write' => true];
    }

    public static function review(int $count = 3): array
    {
        return ['checks' => array_fill_keys(Schemas::DIMENSIONS, true), 'blocks' => array_map(fn ($i) => [
            'index' => $i, 'supported' => true, 'safe' => true,
        ], range(0, $count - 1)), 'issues' => []];
    }

    public static function response(array $data): array
    {
        return ['choices' => [['finish_reason' => 'stop', 'message' => ['content' => json_encode($data)]]]];
    }
}
