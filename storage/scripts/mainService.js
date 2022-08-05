'use strict';
import { CookiesPopUp } from '../scripts/cookieService.js'
import { LanguageOption } from '../scripts/languageService.js'


const e = React.createElement;

const domContainer = document.querySelector('#root');
const root = ReactDOM.createRoot(domContainer);
root.render([e(CookiesPopUp), e(LanguageOption)]);
