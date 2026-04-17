<?php

declare(strict_types=1);

namespace Barryvdh\LaravelIdeHelper\Parsers;

class PhpDocReturnTypeParser
{
    private string $typeAlias;

    private array $namespaceAliases;

    public function __construct(string $typeAlias, array $namespaceAliases)
    {
        $this->typeAlias = $typeAlias;
        $this->namespaceAliases = $namespaceAliases;
    }

    public function parse(): ?string
    {
        $matches = [];
        preg_match('/(\w+)(<.*>)/', $this->typeAlias, $matches);
        $matchCount = count($matches);

        if ($matchCount === 0 || $matchCount === 1) {
            return null;
        }

        if (empty($this->namespaceAliases[$matches[1]])) {
            return null;
        }

        return $this->namespaceAliases[$matches[1]].$this->parseTemplate($matches[2] ?? null);
    }

    private function parseTemplate(?string $template): string
    {
        if ($template === null || $template === '') {
            return '';
        }

        $type = '';
        $result = '';

        foreach (str_split($template) as $char) {
            $match = preg_match('/[A-z]/', $char);

            if (! $match) {
                $type = $this->namespaceAliases[$type] ?? $type;
                $result .= $type;
                $result .= $char;
                $type = '';

                continue;
            }

            $type .= $char;
        }

        return $result;
    }
}
