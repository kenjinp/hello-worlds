import * as React from 'react';
import { ECS, THEMES } from './WorldBuilder.state';



export const ThemeSelector: React.FC = () => {
  const [theme, setTheme] = React.useState<THEMES>(THEMES.SCI_FANTASY);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) =>{
    setTheme(e.target.value);
  }

  return (
    <>
      <label>theme</label>{' '}
      <select value={theme} onChange={handleChange}>
        {Object.values(THEMES).map(theme => (<option key={theme} value={theme}>{theme}</option>))}
      </select>
      <ECS.Entity>
        <ECS.Component name="theme" data={theme}/>
      </ECS.Entity>
    </>
  );
}

export const useTheme = () => {
  const { entities } = ECS.useArchetype("theme");

  return entities.length ? entities[0].theme : THEMES.SCI_FANTASY
}