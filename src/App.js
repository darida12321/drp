import React from 'react';
import gearImg from './images/gear-icon.svg'
import houseImg from './images/house-icon.svg'
import keyboardImg from './images/keyboard-icon.svg'
import moonImg from './images/moon-icon.svg'
import userImg from './images/user-icon.svg'

function App() {
  return (
    <div class="container">
      <nav>
        <div>
          <img src={houseImg} class="icon" alt="" />
        </div>
        <div>
          <img src={keyboardImg} class="icon" alt="" />
          <h1>Website name</h1>
        </div>
        <div>
          <img src={moonImg} class="icon" alt="" />
          <img src={gearImg} class="icon" alt="" />
          <img src={userImg} class="icon" alt="" />
        </div>
      </nav>
      <div className="content">
        <div className="chapter">
          <h1>Chapter 1:</h1>
          <h3>Basic motions</h3>

          <div>
            <div className="lesson-marker"></div>
            <p>Introduction to vim</p>
          </div>
          <div>
            <div className="lesson-marker"></div>
            <p>Moving a word forward</p>
          </div>
          <div>
            <div className="lesson-marker"></div>
            <p>Moving a word backward</p>
          </div>
          <div>
            <div className="lesson-marker"></div>
            <p>WORD vs. word</p>
          </div>
          <div>
            <div className="lesson-marker"></div>
            <p>Move to end of word</p>
          </div>
          <div>
            <div className="lesson-marker"></div>
            <p>Final test</p>
          </div>

        </div>
        <div className="tutorial">
          <div className="textbox">
            <div>
              <h1>Lesson 3: Moving a word back.</h1>
              <p>Use b to go back an entire word.</p>
            </div>
            <div className="marker">1/5</div>
          </div>
          <div className="editor"></div>
        </div>
      </div>
    </div>
  );
}

export default App;
