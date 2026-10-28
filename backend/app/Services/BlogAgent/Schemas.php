<?php

namespace App\Services\BlogAgent;

class Schemas
{
    public const DIMENSIONS = ['factual_support', 'topic_relevance', 'technical_correctness', 'depth', 'readability', 'repetition', 'markdown', 'source_integrity', 'safety', 'editorial_quality'];

    private static function object(array $properties): array
    {
        return ['type' => 'object', 'properties' => $properties, 'required' => array_keys($properties), 'additionalProperties' => false];
    }

    private static function list(array $item): array
    {
        return ['type' => 'array', 'items' => $item];
    }

    public static function get(string $stage): array
    {
        $string = ['type' => 'string'];
        $boolean = ['type' => 'boolean'];

        return match ($stage) {
            'plan' => self::object(['angle' => $string, 'headings' => self::list($string), 'source_ids' => self::list($string), 'uncertainties' => self::list($string), 'can_write' => $boolean]),
            'draft' => self::object([
                'title' => $string, 'excerpt' => $string,
                'blocks' => self::list(self::object([
                    'heading' => $string,
                    'kind' => ['type' => 'string', 'enum' => ['fact', 'interpretation', 'guidance', 'code']],
                    'text' => $string,
                    'evidence' => self::list(self::object(['source_id' => $string, 'quote' => $string])),
                ])),
            ]),
            'review' => self::object([
                'checks' => self::object(array_fill_keys(self::DIMENSIONS, $boolean)),
                'blocks' => self::list(self::object(['index' => ['type' => 'integer'], 'supported' => $boolean, 'safe' => $boolean])),
                'issues' => self::list($string),
            ]),
            default => throw new AgentException('schema_unknown'),
        };
    }

    /** Provider-only shape; persisted drafts retain resolved source IDs and quotes. */
    public static function draftReferences(): array
    {
        $schema = self::get('draft');
        $schema['properties']['blocks']['items']['properties']['evidence'] = self::list(self::object([
            'excerpt_id' => ['type' => 'string'],
        ]));

        return $schema;
    }

    /** Validate again locally even when a provider claims strict schema support. */
    public static function valid(mixed $value, array $schema): bool
    {
        $ok = match ($schema['type']) {
            'object' => is_array($value) && ! array_is_list($value),
            'array' => is_array($value) && array_is_list($value),
            'string' => is_string($value),
            'boolean' => is_bool($value),
            'integer' => is_int($value),
            default => false,
        };
        if (! $ok || (isset($schema['enum']) && ! in_array($value, $schema['enum'], true))) {
            return false;
        }
        if ($schema['type'] === 'object') {
            if (array_diff(array_keys($value), $schema['required']) || array_diff($schema['required'], array_keys($value))) {
                return false;
            }
            foreach ($schema['properties'] as $key => $child) {
                if (! self::valid($value[$key], $child)) {
                    return false;
                }
            }
        }
        if ($schema['type'] === 'array') {
            foreach ($value as $item) {
                if (! self::valid($item, $schema['items'])) {
                    return false;
                }
            }
        }

        return true;
    }
}
