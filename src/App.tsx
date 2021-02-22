import React from 'react';
import styled from 'styled-components';
import './App.css';

import Split, {SplitDirection} from './Split';
// const PanelGroup = require('react-panelgroup').default;

const Container = styled.div`
  width: 100%;
  height: 100%;
  min-width: 800px;
  height: 300px;
  height: 100%;
  display: flex;
  justify-content: center;
  overflow: auto;
`;

const TextDiv = styled.div`
  height: 100%;
  width: 100%;
  overflow: auto;
`;

function App() {
  return (
    <Container>
        <Split>
          <Split direction={SplitDirection.Vertical}>
            <TextDiv>
              {[...Array(30)].map(i => (
                <div key={Math.random()}>
                  This is a left text
                  <br/>
                </div>
              ))}
            </TextDiv>
            <TextDiv>
              {[...Array(30)].map(i => (
                <div key={Math.random()}>
                  This is a left text
                  <br/>
                </div>
              ))}
            </TextDiv>
            <div>Text 1</div>
          </Split>
          <div>Text 2</div>
          <div>Text 3</div>
          <div>Text 4</div>
        </Split>
    </Container>
  );
}

export default App;
