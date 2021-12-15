import { useState } from 'react';
import './styles.css';
import './App.css';

import SingleHorizontal from './SingleHorizontal';
import SingleVertical from './SingleVertical';
import HorizontalSplit from './HorizontalSplit';
import VerticalSplit from './VerticalSplit';
import NestedSplit from './NestedSplit';
import StyledGutter from './StyledGutter';
import MinSize from './MinSize';
import InitialSizes from './InitialSizes';
import ScrollableChildren from './ScrollableChildren';
import OnDidResizeSplit from './OnDidResize';
import DynamicParentSize from './DynamicParentSize';
import DynamicChildren  from './DynamicChildren';

enum Page {
  SingleHorizontal,
  SingleVertical,
  Horizontal,
  Vertical,
  Nested,
  StyledGutter,
  MinSize,
  InitialSizes,
  ScrollableChildren,
  OnDidResize,
  DynamicParent,
  DynamicChildren,
}

function App() {
  const [page, setPage] = useState(Page.SingleHorizontal);

  return (
    <div className="app">
      <div className="split-selection">
        <button onClick={() => setPage(Page.SingleHorizontal)}>Single horizontal</button>
        <button onClick={() => setPage(Page.SingleVertical)}>Single Vertical</button>
        <button onClick={() => setPage(Page.Horizontal)}>Horizontal</button>
        <button onClick={() => setPage(Page.Vertical)}>Vertical</button>
        <button onClick={() => setPage(Page.Nested)}>Nested</button>
        <button onClick={() => setPage(Page.StyledGutter)}>Styled gutter</button>
        <button onClick={() => setPage(Page.MinSize)}>Minimal tile size</button>
        <button onClick={() => setPage(Page.InitialSizes)}>Initial tile sizes</button>
        <button onClick={() => setPage(Page.ScrollableChildren)}>Scrollable tiles</button>
        <button onClick={() => setPage(Page.OnDidResize)}>On size change</button>
        <button onClick={() => setPage(Page.DynamicParent)}>Dynamic parent size</button>
        <button onClick={() => setPage(Page.DynamicChildren)}>Dynamic children</button>
      </div>

      <div className="splits">
        {page === Page.SingleHorizontal &&
          <SingleHorizontal/>
        }
        {page === Page.SingleVertical &&
          <SingleVertical/>
        }
        {page === Page.Horizontal &&
          <HorizontalSplit/>
        }
        {page === Page.Vertical &&
          <VerticalSplit/>
        }
        {page === Page.Nested &&
          <NestedSplit/>
        }
        {page === Page.StyledGutter &&
          <StyledGutter/>
        }
        {page === Page.MinSize &&
          <MinSize/>
        }
        {page === Page.InitialSizes &&
          <InitialSizes/>
        }
        {page === Page.ScrollableChildren &&
          <>
            <p>Just make sure the parent element ('.splits' in App.css) has set max-height/max-width in px</p>
            <ScrollableChildren/>
          </>
        }
        {page === Page.OnDidResize &&
          <OnDidResizeSplit />
        }
        {page === Page.DynamicParent &&
          <>
            <p>Parent's initial width is 0% and will be set to 100% in 5s. Splitter will correctly re-render. Works also with the height.</p>
            <DynamicParentSize />
          </>
        }
        {
          page === Page.DynamicChildren &&
          <>
            <p>Additional child nodes will be inserted after 5s.</p>
            <DynamicChildren />
          </>
        }
      </div>
    </div>
  );
}

export default App;

