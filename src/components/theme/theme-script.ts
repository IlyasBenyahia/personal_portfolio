/** Inline, render-blocking: applies the stored theme before first paint (no flash). */
export const themeScript = `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;
