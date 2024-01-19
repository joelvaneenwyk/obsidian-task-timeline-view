# Obsidian Task Timeline View Component

This is a rewrite of [Obsidian Tasks Timeline](https://github.com/702573N/Obsidian-Tasks-Timeline) in TypeScript.

In this repo, the `view.js` which originally handles:

1. Task item parsing
2. Rendering
3. Filtering according to user options

is re-implemented with typescript and React. The functions are split into multiple modularized scripts.

The purposes are:

1. Making the origin view designed by [@702573N](https://github.com/702573N) an interface, so that task item from any sources (e.g., normal task items, [the Tasks plugin](https://github.com/obsidian-tasks-group/obsidian-tasks), dataview format tasks) could be rendered and managed with this view.
2. Make the view a component, so that it can be used in other projects.

## License

MIT.
