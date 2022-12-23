import { Button } from "@components/button/Button"
import { setRandomSeed } from "@hello-worlds/core"
import { Language } from "@hello-worlds/tongues"
import * as React from "react"

const mostCommonEnglishWords = [
  "time",
  "person",
  "year",
  "way",
  "day",
  "thing",
  "man",
  "world",
  "life",
  "hand",
  "part",
  "child",
  "eye",
  "woman",
  "place",
  "work",
  "week",
  "case",
  "point",
  "government",
  "company",
  "number",
  "group",
  "problem",
  "fact",
]

export const LanguageExample = () => {
  const [language, setLanguage] = React.useState(() => {
    setRandomSeed("hello-worlds")
    return new Language()
  })

  const handleButtonClick = () => {
    setLanguage(new Language())
  }

  return (
    <div>
      <br />
      <h3 style={{ fontSize: "1.5em" }}>
        The language of {language.makeName("us")}
      </h3>
      <br />

      <Button onClick={handleButtonClick}>Generate new language</Button>
      <br />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto auto auto",
          gridTemplateRows: "auto",
          columnGap: "10px",
          rowGap: "10px",
        }}
      >
        {mostCommonEnglishWords.map((word, index) => {
          return (
            <div key={index} style={{ margin: "0.5em" }}>
              {word} is <b>{language.makeWord(word)}</b>
            </div>
          )
        })}
      </div>
      <br />
      <hr />
      <br />
      <h3 style={{ fontSize: "1.5em" }}>Names</h3>
      {new Array(10).fill(0).map((_, index) => {
        return <div key={index}>{language.makeName(index)}</div>
      })}
    </div>
  )
}

export default LanguageExample
