# Splitter
Splitter is a React component that allows you to split views into resizable panels. Similar to tabs in Visual Studio Code, for example. It's used in [Devbook](https://usedevbook.com) - A Search Engine for Developers.
Here's a gif of what you can build with Splitter:
![](example.gif)

Splitter is inspired by [Split.js](https://split.js.org/) and written as 100% functional component:
- All size calculation is done through CSS using `calc`
- Fully responsive
- No dependencies beside React and styled-components
- Minimal assumptions about your styling and views

[CodeSandbox project](https://codesandbox.io/s/devbookhqspliiter-example-l23s4)

## Installing
```
npm install @devbookhq/splitter
# or
yarn add @devbookhq/splitter
```

## Usage

### Horizontal split
```tsx
import ReactSplit, { SplitDirection } from '@devbookhq/splitter'

function MyComponent() {
  return (
    <ReactSplit direction={SplitDirection.Horizontal}>
      <div>Tile 1</div>
      <div>Tile 2</div>
    </ReactSplit>
  );
}
```

### Vertical split
```tsx
import ReactSplit, { SplitDirection } from '@devbookhq/splitter'

function MyComponent() {
  return (
    <ReactSplit direction={SplitDirection.Vertical}>
      <div>Tile 1</div>
      <div>Tile 2</div>
    </ReactSplit>
  );
}
```

### Nested split
```tsx
import ReactSplit, { SplitDirection } from '@devbookhq/splitter'

function MyComponent() {
  return (
    <ReactSplit direction={SplitDirection.Vertical}>
      <div>Tile 1</div>
      <ReactSplit direction={SplitDirection.Horizontal}>
        <div>Tile 2</div>
        <ReactSplit direction={SplitDirection.Vertical}>
          <div>Tile 3</div>
          <div>Tile 4</div>
        </ReactSplit>
      </ReactSplit>
    </ReactSplit>
  );
}
```


To see more examples check out the [examples](#Example) section.

## Examples
Check the [`example`](./example/src/App.tsx) folder or the [CodeSandbox project](https://codesandbox.io/s/devbookhqspliiter-example-l23s4).
- [Horizontal](./example/src/HorizontalSplit/index.tsx)
- [Vertical](./example/src/VerticalSplit/index.tsx)
- [Nested](./example/src/NestedSplit/index.tsx)
- [Styled gutter](./example/src/StyledGutter/index.tsx)
- [Minimal tile size](./example/src/MinSize/index.tsx)
- [Initial tile sizes](./example/src/InitialSizes/index.tsx)
- [Scrollable tiles](./example/src/ScrollableChildren/index.tsx)

