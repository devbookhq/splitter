# Splitter
Splitter is a React component that allows you to split views into resizable panels. Similar to tabs in Visual Studio Code, for example.
Here's a gif of what you can build with Splitter:
![](example.gif)

Splitter is inspired by [Split.js](https://split.js.org/) and written as 100% functional component:
- All size calculation is done through CSS using `calc` with minimal JS. This makes it much faster
- Fully responsive
- No dependencies beside React
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
import Splitter, { SplitDirection } from '@devbookhq/splitter'

function MyComponent() {
  return (
    <Splitter>
      <div>Tile 1</div>
      <div>Tile 2</div>
    </Splitter>
  );
}
```

### Vertical split
```tsx
import Splitter, { SplitDirection } from '@devbookhq/splitter'

function MyComponent() {
  return (
    <Splitter direction={SplitDirection.Vertical}>
      <div>Tile 1</div>
      <div>Tile 2</div>
    </Splitter>
  );
}
```

### Nested split
```tsx
import Splitter, { SplitDirection } from '@devbookhq/splitter'

function MyComponent() {
  return (
    <Splitter direction={SplitDirection.Vertical}>
      <div>Tile 1</div>
      <Splitter direction={SplitDirection.Horizontal}>
        <div>Tile 2</div>
        <Splitter direction={SplitDirection.Vertical}>
          <div>Tile 3</div>
          <div>Tile 4</div>
        </Splitter>
      </Splitter>
    </Splitter>
  );
}
```

### Get sizes of tiles
```tsx
import Splitter, { SplitDirection } from '@devbookhq/splitter'

function MyComponent() {
  function handleResizeStarted(gutterIdx: number) {
    console.log('Resize started!', gutterIdx);
  }
  function handleResizeFinished(gutterIdx: number, newSizes: number[]) {
    console.log('Resize finished!', gutterIdx, newSizes);
  }

  return (
    <Splitter
      direction={SplitDirection.Vertical}
      onResizeStarted={handleResizeStarted}
      onResizeFinished={handleResizeFinished}
    >
      <div>Tile 1</div>
      <div>Tile 2</div>
    </Splitter>
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
- [Get sizes of tiles](./example/src/OnDidResize/index.tsx)

