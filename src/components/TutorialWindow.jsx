import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom'
import { getLessonData } from "../firebase.js";

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-chaos";
import ace from "ace-builds/src-noconflict/ace";
import CodeChecker from "../js/CodeChecker";

import "../styles/TutorialWindow.css";

function TutorialWindow(props) {
  const navigate = useNavigate()
  const [lesson, setLesson] = useState({});
  const [exampleNum, setExampleNum] = useState(0);
  const [complete, setComplete] = useState(false);
  var codeChecker = useRef(null);

  useEffect(() => {
    async function fetchData() {
      const lessonIndex = props.lesson - 1;
      // Get lessons for chapter 1
      const data = await getLessonData(props.chapter);
      const lessonData = data[lessonIndex];
      setLesson({
        num: lessonData.num,
        title: lessonData.title,
        description: lessonData.lesson.description,
        exampleCount: lessonData.examples.length,
      });

      codeChecker.current = new CodeChecker(
        ace.edit("editor"),
        lessonData.lesson.editorSetup,
        lessonData.examples,
        setExampleNum,
        () => {
          setComplete(true);
        }
      );
    }

    fetchData();
  }, [props.chapter, props.lesson]);

  useEffect(() => {
    document.addEventListener('keypress', (e) => {
      if(e.key === 'Enter' && e.shiftKey && complete){
        const link = '/vim/' + props.chapter + '/' + (parseInt(props.lesson)+1)
        navigate(link, { replace: true })
        window.location.reload()
      }
    })
  }, [props.chapter, props.lesson, complete, navigate])

  // Get style variables from style.css
  var style = getComputedStyle(document.body);
  const boxShadowDefault = style.getPropertyValue("--blue-0");
  const boxShadowComplete = style.getPropertyValue("--green-2");

  function onChange() {
    if (!codeChecker.current) {
      return;
    }
    codeChecker.current.onChange();
  }

  function onCursorChange() {
    if (!codeChecker.current) {
      return;
    }
    codeChecker.current.onCursorChange();
  }

  // style={{ boxShadow: "inset 20px 0" + (complete ? boxShadowComplete : boxShadowDefault) }}

  return (
    <div id="tutorial">
      <div id="textbox">
        <div id="lesson-info">
          <h1 id="lesson-title">
            Lesson {lesson.num}: {lesson.title}
          </h1>
          <p id="lesson-desc">{lesson.description}</p>
        </div>
        <div id="lesson-marker">
          <div id="blob" style={{ background: complete ? boxShadowComplete : boxShadowDefault }}>
            {exampleNum}/{lesson.exampleCount}
          </div>
        </div>
      </div>
      <AceEditor
        id="editor"
        mode="text"
        theme="chaos"
        name="editor"
        keyboardHandler="vim"
        style={{ width: "80%", height: "100%" }}
        fontSize={"1.5vw"}
        showPrintMargin={false}
        onChange={onChange}
        onCursorChange={onCursorChange}
      />
    </div>
  );
}

export default TutorialWindow;
