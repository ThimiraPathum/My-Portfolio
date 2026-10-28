<?php

namespace App\Services\BlogAgent;

/** Application-owned verbatim passages; the model selects IDs, never writes quotes. */
class EvidenceCatalog
{
    public function build(array $sources): array
    {
        $catalog = [];
        foreach ($sources as $source) {
            $text = $source['text'];
            $offset = 0;
            $index = 0;
            while ($offset < mb_strlen($text)) {
                $remaining = mb_substr($text, $offset);
                if (mb_strlen(trim($remaining)) < 20) {
                    if ($index > 0) {
                        $catalog[$source['id'].':P'.$index]['quote'] .= $remaining;
                    }
                    break;
                }
                // Prefer a whitespace boundary without altering any source bytes.
                preg_match('/^(.{20,1000})(?=\s|$)/us', $remaining, $match);
                $piece = $match[1] ?? mb_substr($remaining, 0, 1000);
                $index++;
                $catalog[$source['id'].':P'.$index] = ['source_id' => $source['id'], 'quote' => $piece];
                $offset += mb_strlen($piece);
            }
        }

        return $catalog;
    }

    public function context(array $sources, array $catalog): array
    {
        return array_map(function ($source) use ($catalog) {
            $passages = [];
            foreach ($catalog as $id => $passage) {
                if ($passage['source_id'] === $source['id']) {
                    $passages[] = ['id' => $id, 'text' => $passage['quote']];
                }
            }

            unset($source['text']);
            $source['passages'] = $passages;

            return $source;
        }, $sources);
    }

    /** Avoid duplicating long evidence passages in reviews and revision requests. */
    public function references(array $draft, array $catalog): array
    {
        foreach ($draft['blocks'] as &$block) {
            foreach ($block['evidence'] as &$evidence) {
                foreach ($catalog as $id => $passage) {
                    if ($evidence === $passage) {
                        $evidence = ['excerpt_id' => $id];
                        break;
                    }
                }
            }
            unset($evidence);
        }
        unset($block);

        return $draft;
    }

    public function resolve(array $draft, array $catalog): array
    {
        foreach ($draft['blocks'] as &$block) {
            $block['evidence'] = array_map(fn ($reference) => $catalog[$reference['excerpt_id']] ?? [
                // An unknown reference remains invalid for the bounded repair gate.
                'source_id' => 'unknown_excerpt:'.$reference['excerpt_id'], 'quote' => '',
            ], $block['evidence']);
        }
        unset($block);

        return $draft;
    }
}
