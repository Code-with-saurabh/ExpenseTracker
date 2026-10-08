import option1 from './option1WarmIvoryForest';
import option2 from './option2OffWhiteNavy';
import option3 from './option3CreamBurgundy';
import option4 from './option4WhiteTerracotta';
import option5 from './option5WhiteOlive';
import option6 from './option6PearlPlum';
import option7 from './option7WhiteCobalt';
import option8 from './option8WarmEspressoSage';

export const themes = [option1, option2, option3, option4, option5, option6, option7, option8];

export const getTheme = (id) => {
  const found = themes.find((theme) => theme.id === id);
  return found || option8;
};

export const applyTheme = (theme, dark) => {
  const palette = dark ? theme.dark : theme.light;
  const root = document.documentElement;

  root.style.setProperty('--bg', palette.bg);
  root.style.setProperty('--text', palette.text);
  root.style.setProperty('--card', palette.card);
  root.style.setProperty('--border', palette.border);
  root.style.setProperty('--primary', palette.primary);
  root.style.setProperty('--primary-text', palette.primaryText);
  root.style.setProperty('--primary-hover', palette.primaryHover);
  root.style.setProperty('--accent', palette.accent);
  root.style.setProperty('--sage', palette.sage);
  root.style.setProperty('--beige', palette.beige);
  root.style.setProperty('--muted', palette.muted || palette.text + '99');
  root.style.setProperty('--hover', palette.text + '0D');
};
