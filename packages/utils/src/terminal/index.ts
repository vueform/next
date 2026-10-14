/**
 * The shared terminal-runner toolkit: display-mode decision, colors and
 * links, the live repaint frame, child/signal cleanup, run logs, the two
 * display formats (list rows, matrix) and the convenience row runner.
 *
 * Deliberately NOT re-exported from the package index: this subpath stays
 * free of import-time side effects (the main index carries the orchestrator,
 * which anchors paths at import).
 */
export * from './cleanup'
export * from './frame'
export * from './logs'
export * from './matrix'
export * from './mode'
export * from './paint'
export * from './parsers'
export * from './rows'
export * from './run'
