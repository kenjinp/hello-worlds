import * as React from "react"
import { useStore } from "statery"
import { store, THEMES } from "./WorldBuilder.state"

export const useTheme = () => {
  const { theme } = useStore(store)
  return theme
}

export const ThemeSelector: React.FC = () => {
  const state = useStore(store)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    store.set(state => ({
      theme: e.target.value,
    }))
  }

  return (
    <>
      <label>theme</label>{" "}
      <select value={state.theme} onChange={handleChange}>
        {Object.values(THEMES).map(theme => (
          <option key={theme} value={theme}>
            {theme}
          </option>
        ))}
      </select>
    </>
  )
}

export const Options: React.FC = () => {
  const state = useStore(store)

  return (
    <>
      <br />
      <label>show planet labels</label>{" "}
      <input
        name="screenshot mode"
        type="checkbox"
        checked={state.showPlanetLabels}
        onChange={() =>
          store.set(state => ({
            showPlanetLabels: !state.showPlanetLabels,
          }))
        }
      />
      <br />
      <label>debug mode</label>{" "}
      <input
        name="debude mode"
        type="checkbox"
        checked={state.debugMode}
        onChange={() =>
          store.set(state => ({
            debugMode: !state.debugMode,
          }))
        }
      />
    </>
  )
}
