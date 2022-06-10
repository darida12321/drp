import React, { useEffect, useRef, useState } from "react";
import { db } from "../firebase.js";
import { doc, collection, getDocs, setDoc } from "firebase/firestore";

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-chaos";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/keybinding-vim";
import ace from "ace-builds/src-noconflict/ace";

import '../styles/TutorialWindow.css'

// TODO fetch data from a backend
async function getLessonData(chapter) {
  const querySnapshot = await getDocs(collection(db, "vim/chapter" + chapter + "/lessons"));
  if (!querySnapshot) return;
  let lessonData = [];
  querySnapshot.forEach((doc) => {
    console.log(doc.data());
    lessonData.push(doc.data());
  });

  // await setDoc(doc(db, "vim/chapter1/lessons", "lesson1"), {
  //   num: 1,
  //   title: "Moving with hjkl",
  //   description: "Use the H, J, K and L keys to move to the target.\n'H' - left, 'J' - down, 'K' - up, 'L' - right",
  //   exampleCount: 3,
  //   examples: [
  //     {
  //       initial: {
  //         code: "                        |\n  Move here: > <  |\n                  |",
  //         cLine: 0,
  //         cPos: 0,
  //       },
  //       expected: {
  //         code: "                        |\n  Move here: > <  |\n                  |",
  //         cLine: 1,
  //         cPos: 14,
  //       },
  //     },
  //     {
  //       initial: {
  //         code: "       Now here: > <   |\n                       |\n                       |",
  //         cLine: 1,
  //         cPos: 14,
  //       },
  //       expected: {
  //         code: "       Now here: > <   |\n                       |\n                       |",
  //         cLine: 0,
  //         cPos: 18,
  //       },
  //     },
  //     {
  //       initial: {
  //         code: "                          |\n                          |\n   > < and finally, there |",
  //         cLine: 0,
  //         cPos: 18,
  //       },
  //       expected: {
  //         code: "                          |\n                          |\n   > < and finally, there |",
  //         cLine: 2,
  //         cPos: 4,
  //       },
  //     },
  //   ],
  // });

  return lessonData;
}

class CodeChecker {
  // Constructor defining the parameters
  // TODO: pass parameters in here (editor, examples, callback)
  // TODO: set the editor to examples[0] setup
  constructor(exampleCount) {
    this.editor = null;

    this.desiredState = null;

    this.examples = [];
    this.exampleNum = 0;
    this.exampleCount = exampleCount;

    this.callback = null;
  }

  setEditor(editor) {
    this.editor = editor;
  }

  // TODO: Use official Lesson json format
  setEditorState(state) {
    this.editor.setValue(state.code);
    this.editor.moveCursorTo(state.cLine, state.cPos);
    this.editor.session.selection.clearSelection();
  }

  setExamples(examples) {
    this.examples = examples;
  }

  setDesiredState(desired) {
    this.desiredState = desired;
  }

  setCallback(f) {
    this.callback = f;
  }

  // TODO use official lessonData Json format
  getEditorState() {
    if (!this.editor) {
      return null;
    }
    const code = this.editor.getValue();
    const cursor = this.editor.getCursorPosition();
    return { code: code, line: cursor.row, pos: cursor.column };
  }

  // Use example instead of desired state
  goalReached() {
    if (this.desiredState === null) {
      return false;
    }
    const state = this.getEditorState();

    return state.line === this.desiredState.line && state.pos === this.desiredState.pos;
  }

  // Use callback for current excersize
  codeUpdated() {
    if (this.callback && this.goalReached()) {
      this.incrementExample();
    }
    return this.exampleNum;
  }

  // Use correct json format
  incrementExample() {
    if (this.exampleNum >= this.exampleCount) {
      return;
    }
    this.exampleNum += 1;
    if (this.exampleNum < this.exampleCount) {
      this.setDesiredState({
        line: this.examples[this.exampleNum].expected.cLine,
        pos: this.examples[this.exampleNum].expected.cPos,
      });
      this.setEditorState({
        code: this.examples[this.exampleNum].initial.code,
        cLine: this.examples[this.exampleNum].initial.cLine,
        cPos: this.examples[this.exampleNum].initial.cPos,
      });
    } else {
      this.callback();
    }
  }
}

function TutorialWindow(props) {
  const [lesson, setLesson] = useState({});
  const [exampleNum, setExampleNum] = useState(0);
  const [complete, setComplete] = useState(false);
  var codeChecker = useRef(null);

  useEffect(() => {
    async function fetchData() {
      const lessonIndex = props.lesson - 1;
      // Get lessons for chapter 1
      const data = await getLessonData(1);
      lessonData = data[lessonIndex];
      setLesson({
        num: lessonData.num,
        title: lessonData.title,
        desc: lessonData.desc,
        exampleCount: lessonData.exampleCount,
      });
      codeChecker.current = new CodeChecker(lessonData.exampleCount);
      codeChecker.current.setEditor(ace.edit("editor"));
      codeChecker.current.setExamples(lessonData.examples);

      codeChecker.current.setEditorState({
        code: lessonData.examples[0].initial.code,
        cLine: lessonData.examples[0].initial.cLine,
        cPos: lessonData.examples[0].initial.cPos,
      });

      codeChecker.current.setCallback(() => {
        console.log("Lesson done!!!!");
        setComplete(true);
      });
    }
    fetchData();
  }, []);

  // Get style variables from style.css
  var style = getComputedStyle(document.body);
  const boxShadowDefault = style.getPropertyValue("--blue-0");
  const boxShadowComplete = style.getPropertyValue("--green-2");

  var editing = false;
  function onChange(newContent) {
    if (editing) {
      return;
    }
    editing = true;
    var currentPosition = ace.edit("editor").selection.getCursor();
    const edited = newContent.replace("\t", "    ");
    ace.edit("editor").setValue(edited);
    ace.edit("editor").clearSelection();
    ace.edit("editor").moveCursorTo(currentPosition.row, currentPosition.column);
    editing = false;
  }

  function onCursorChange(selection) {
    if (editing) {
      return;
    }
    setExampleNum(codeChecker.current.codeUpdated());
  }

  return (
    <div className="tutorial">
      <div
        className="textbox"
        style={{ boxShadow: "inset 20px 0" + (complete ? boxShadowComplete : boxShadowDefault) }}
      >
        <div>
          <h1>
            Lesson {lesson.num}: {lesson.title}
          </h1>
          <p>{lesson.desc}</p>
        </div>
        <div>
          <div className="marker">
            {exampleNum}/{lesson.exampleCount}
          </div>
        </div>
      </div>
      <AceEditor
        id="editor"
        mode="java"
        theme="chaos"
        name="editor"
        keyboardHandler="vim"
        style={{ width: "80rem", height: "100%" }}
        fontSize={20}
        showPrintMargin={false}
        onChange={onChange}
        onCursorChange={onCursorChange}
      />
    </div>
  );
}

export default TutorialWindow;
