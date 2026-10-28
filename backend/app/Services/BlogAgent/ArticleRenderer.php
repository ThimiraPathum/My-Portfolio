<?php

namespace App\Services\BlogAgent;

class ArticleRenderer
{
    public function markdown(array $draft, array $sources): string
    {
        $text = [];
        $used = [];
        foreach ($draft['blocks'] as $block) {
            if ($block['heading'] !== '') {
                $text[] = '### '.$block['heading'];
            }
            $text[] = $block['text'];
            $citations = [];
            foreach ($block['evidence'] as $evidence) {
                $id = $evidence['source_id'];
                $source = collect($sources)->firstWhere('id', $id);
                if ($source) {
                    $citations[$id] = '['.$id.']('.$source['url'].')';
                    $used[$id] = $source;
                }
            }
            if ($citations) {
                $text[] = 'Sources: '.implode(', ', $citations).'.';
            }
        }
        $text[] = '### Sources';
        foreach ($used as $id => $source) {
            $label = preg_replace('/[\[\]<>`*_\r\n]/', '', $source['title']);
            $text[] = '- ['.$id.' — '.$label.']('.$source['url'].') (accessed '.substr($source['retrieved_at'], 0, 10).').';
        }

        return implode("\n\n", $text);
    }

    public function cover(string $category): string
    {
        $known = ['ai_ml', 'software', 'devops', 'cybersecurity', 'web_mobile', 'games', 'film_tv', 'science', 'databases_tools'];

        return '/images/blog-categories/'.(in_array($category, $known, true) ? $category : 'software').'.svg';
    }
}
