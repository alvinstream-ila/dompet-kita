<?php

namespace Illuminate\Console\Concerns;

use Illuminate\Support\Collection;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\NullOutput;
use Symfony\Component\Console\Output\OutputInterface;

trait CallsCommands
{
    /**
     * Resolve the console command instance for the given command.
     *
     * @param  Command|string  $command
     * @return Command
     */
    abstract protected function resolveCommand($command);

    /**
     * Call another console command.
     *
     * @param  Command|string  $command
     * @return int
     */
    public function call($command, array $arguments = [])
    {
        return $this->runCommand($command, $arguments, $this->output);
    }

    /**
     * Call another console command without output.
     *
     * @param  Command|string  $command
     * @return int
     */
    public function callSilent($command, array $arguments = [])
    {
        return $this->runCommand($command, $arguments, new NullOutput);
    }

    /**
     * Call another console command without output.
     *
     * @param  Command|string  $command
     * @return int
     */
    public function callSilently($command, array $arguments = [])
    {
        return $this->callSilent($command, $arguments);
    }

    /**
     * Run the given console command.
     *
     * @param  Command|string  $command
     * @return int
     */
    protected function runCommand($command, array $arguments, OutputInterface $output)
    {
        $arguments['command'] = $command;

        $result = $this->resolveCommand($command)->run(
            $this->createInputFromArguments($arguments), $output
        );

        $this->restorePrompts();

        return $result;
    }

    /**
     * Create an input instance from the given arguments.
     *
     * @return ArrayInput
     */
    protected function createInputFromArguments(array $arguments)
    {
        return tap(new ArrayInput(array_merge($this->context(), $arguments)), function ($input) {
            if ($input->getParameterOption('--no-interaction')) {
                $input->setInteractive(false);
            }
        });
    }

    /**
     * Get all of the context passed to the command.
     *
     * @return array{'--ansi'?: bool, '--no-ansi'?: bool, '--no-interaction'?: bool, '--quiet'?: bool, '--verbose'?: bool}
     */
    protected function context()
    {
        return (new Collection($this->option()))
            ->only([
                'ansi',
                'no-ansi',
                'no-interaction',
                'quiet',
                'verbose',
            ])
            ->filter()
            ->mapWithKeys(fn ($value, $key) => ["--{$key}" => $value])
            ->all();
    }
}
