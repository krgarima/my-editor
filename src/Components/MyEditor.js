import React, { useState } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  Modifier,
} from "draft-js";
import "draft-js/dist/Draft.css";

const MyEditor = () => {
  // Getting editorContent value from Local Storage and storing it in state, if it exists
  const savedContent = localStorage.getItem("editorContent");
  const initialEditorState = savedContent
    ? EditorState.createWithContent(convertFromRaw(JSON.parse(savedContent)))
    : EditorState.createEmpty();
  const [editorState, setEditorState] = useState(initialEditorState);

  let startOffset = null;
  let endOffset = null;

  // Change Style
  const savedEditorStyle = localStorage.getItem("editorStyle");
  const [editorStyle, setEditorStyle] = useState(
    savedEditorStyle ? savedEditorStyle : false
  );

  const styleMap = {
    HIGHLIGHT: {
      color: "red",
    },
    CODE_BLOCK: {
      backgroundColor: "blue",
    },
  };

  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  const handleEditorStateChange = (
    charactersToRemove,
    contentState,
    selectionState,
    currentBlock
  ) => {
    startOffset = currentBlock.getText().indexOf(charactersToRemove);
    endOffset = startOffset + charactersToRemove.length;

    // NEW CONTENT STATE
    const newContentState = Modifier.replaceText(
      contentState,
      selectionState.merge({
        anchorOffset: startOffset,
        focusOffset: endOffset,
      }),
      ""
    );
    // NEW EDITOR STATE
    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      "change-block-text"
    );
    return newEditorState;
  };

  const CHARACTERS_TO_REMOVE = {
    heading1: "#",
    underline: "***",
    highlight: "**",
    bold: "*",
    codeBlock: "```",
  };

  const handleBeforeInput = (input) => {
    if (input === " ") {
      const contentState = editorState.getCurrentContent();
      const selectionState = editorState.getSelection();
      const currentBlock = contentState.getBlockForKey(
        selectionState.getStartKey()
      );
      let blockText = currentBlock.getText();

      // HEADING-1
      if (blockText.startsWith(CHARACTERS_TO_REMOVE.heading1)) {
        const newEditorState = handleEditorStateChange(
          CHARACTERS_TO_REMOVE.heading1,
          contentState,
          selectionState,
          currentBlock
        );
        setEditorState(RichUtils.toggleBlockType(newEditorState, "header-one"));
        return "handled";
      }

      // UNDERLINE
      else if (blockText.startsWith(CHARACTERS_TO_REMOVE.underline)) {
        const newEditorState = handleEditorStateChange(
          CHARACTERS_TO_REMOVE.underline,
          contentState,
          selectionState,
          currentBlock
        );
        setEditorState(
          RichUtils.toggleInlineStyle(newEditorState, "UNDERLINE")
        );
        return "handled";
      }

      // CHANGE COLOR - RED
      else if (blockText.startsWith(CHARACTERS_TO_REMOVE.highlight)) {
        const newEditorState = handleEditorStateChange(
          CHARACTERS_TO_REMOVE.highlight,
          contentState,
          selectionState,
          currentBlock
        );
        setEditorState(
          RichUtils.toggleInlineStyle(newEditorState, "HIGHLIGHT")
        );
        return "handled";
      }

      // BOLD
      else if (blockText.startsWith(CHARACTERS_TO_REMOVE.bold)) {
        const newEditorState = handleEditorStateChange(
          CHARACTERS_TO_REMOVE.bold,
          contentState,
          selectionState,
          currentBlock
        );
        setEditorState(RichUtils.toggleInlineStyle(newEditorState, "BOLD"));
        return "handled";
      }

      // CODE BLOCK
      else if (blockText.startsWith(CHARACTERS_TO_REMOVE.codeBlock)) {
        const newEditorState = handleEditorStateChange(
          CHARACTERS_TO_REMOVE.codeBlock,
          contentState,
          selectionState,
          currentBlock
        );
        setEditorState(RichUtils.toggleCode(newEditorState));
        setEditorStyle(true);

        return "handled";
      }
    }
    return "not-handled";
  };

  const handleSave = () => {
    const contentState = editorState.getCurrentContent();
    const rawContentState = convertToRaw(contentState);
    const serializedContent = JSON.stringify(rawContentState);
    localStorage.setItem("editorContent", serializedContent);
    localStorage.setItem("editorStyle", editorStyle);
    alert("Editor content saved!");
  };

  return (
    <div className="container">
      <div className="title-container">
        <h3>Demo editor by Garima</h3>
        <button className="btn-save" onClick={handleSave}>
          Save
        </button>
      </div>
      <div className="editor-container">
        <Editor
          className="editor"
          customStyleMap={styleMap}
          editorState={editorState}
          onChange={setEditorState}
          handleKeyCommand={handleKeyCommand}
          handleBeforeInput={handleBeforeInput}
        />
      </div>
    </div>
  );
};

export default MyEditor;
