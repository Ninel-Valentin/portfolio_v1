'use strict';
import languageJson from '../data/languages.json' assert {type: 'json'}
import { getCookie } from '../scripts/cookieService.js'

let language = getCookie('lang');
language = language ? language : languageJson.default;

const e = React.createElement;

function RefactorLanguage(lang) {
    if (!lang) throw ('No language was sent as parameter');
}

class LanguageOption extends React.Component {
    render() {
        return languageJson.content.map(l => {
            return e(
                'img',
                {
                    key: `option_${l.lang}`,
                    className: 'language_option',
                    onClick: (e) => {
                        if (!e.target.getAttribute('selected')) {
                            let active = document.querySelector('.language_option:not([src*="_OFF.png"])');
                            if (active == e.target) return;
                            let currentSrc = active.getAttribute('src');
                            let currentLang = currentSrc.match(/\/[a-zA-Z]{2}\./g)[0];
                            let newLang = currentLang.substring(0, currentLang.length - 1);

                            active.removeAttribute('selected');
                            active.setAttribute('src', currentSrc.replace(currentLang, `${newLang}_OFF.`));

                            currentSrc = e.target.getAttribute('src');
                            currentLang = currentSrc.match(/\/[a-zA-Z]{2}\_/g)[0];
                            newLang = currentLang.substring(0, currentLang.length - 1);

                            e.target.setAttribute('selected','');
                            e.target.setAttribute('src', `${currentSrc.split(newLang).shift()}${newLang}.png`);
                        }
                    },
                    src: `/storage/media/langIcons/${l.lang}${l.lang == languageJson.default ? '' : '_OFF'}.png`
                },
            );
        });
    }
}

const domContainer = document.querySelector('#language_container');
const root = ReactDOM.createRoot(domContainer);
root.render(e(LanguageOption));