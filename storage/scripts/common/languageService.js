'use strict';
import languageJson from '../../data/languages.json' assert {type: 'json'}
import { getCookie, setCookie, timeUnits } from './cookieService.js'

let language = getCookie('lang', true) || languageJson.default;
//This doesn't update;

const e = React.createElement;
window.addEventListener('load', (e) => {
    document.querySelector('title').innerHTML = languageJson.titles
        .find(x => x['@type'] == document.querySelector('title').getAttribute('type'))[language];
});
function RefactorLanguage(lang) {
    if (!lang) throw ('No language was sent as parameter');
    languageJson.content.filter(x =>
        document.querySelectorAll(`[data-type="${x['@type']}"]`).length > 0
        || document.querySelectorAll(`#${x['@type']}`).length > 0)
        .forEach(x => {
            if (x.content) {
                switch (x['@contentType']) {
                    case 'Q&A':
                        let qNodes = document.querySelectorAll('#content h4,h6');
                        qNodes.forEach((y, i) => {
                            // i%2 ? answer : question
                            y.innerHTML = i % 2 ?
                                x.content[parseInt(i / 2)].a[lang]
                                : x.content[parseInt(i / 2)].q[lang];
                        });
                        break;
                    case 'Table':
                        let tNodes = document.querySelectorAll('.bioHeader');
                        tNodes.forEach((y, i) => {
                            let header = x.content[i].name;
                            header = header.hasOwnProperty(lang) ? header[lang] :
                                (header.hasOwnProperty('default') ? header['default'] : header);
                            let value = x.content[i].value;
                            value = value.hasOwnProperty(lang) ? value[lang] :
                                (value.hasOwnProperty('default') ? value['default'] : value);
                            y.childNodes[0].textContent = header;
                            y.querySelector('.bioRowValue').innerText = value;
                        });
                        break;
                    default:
                        throw ('Wrong content type passed in RefactorLanguage function');
                }
            } else {
                document.querySelector(`#${x['@type']}`).innerHTML = x[lang];
            }
        });
    document.querySelector('title').innerHTML = languageJson.titles
        .find(x => x['@type'] == document.querySelector('title').getAttribute('type'))[lang];
}

class LanguagePreview extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            minimized: true
        };
    }
    render() {
        return e(
            'div',
            {
                id: 'language_preview',
                key: 'language_preview',
                style: {
                    backgroundImage: `url(/storage/media/langIcons/${language}.png)`,
                    backgroundSize: 'cover'
                },
                onMouseLeave: () => {
                    this.state.minimized = true;
                    this.forceUpdate();
                    let self = document.querySelector('#language_preview');
                    language = getCookie('lang', true) || languageJson.default;
                    self.setAttribute('style',
                        `background-image: url(/storage/media/langIcons/${language}.png);` +
                        'background-size:cover;');
                    self.removeAttribute('class');
                },
                onMouseEnter: () => {
                    this.state.minimized = false;
                    this.forceUpdate();
                    language = getCookie('lang', true) || languageJson.default;
                    let self = document.querySelector('#language_preview');
                    self.removeAttribute('style');
                    self.setAttribute('class', 'active');
                }
            },
            this.state.minimized ? '' : [
                ...languageJson.languages.filter(x => x['@usable']).map(l => {
                    return e(
                        'img',
                        {
                            key: `option_${l.lang}`,
                            className: 'language_option',
                            onMouseEnter: (e) => {
                                let current = e.target.getAttribute('src');
                                e.target.setAttribute('src', current.replace('_OFF', ''));
                            },
                            onMouseLeave: (e) => {
                                let language = getCookie('lang', true) || languageJson.default;
                                if (!e.target.getAttribute('src').includes(`${language}.png`)) {
                                    let current = e.target.getAttribute('src');
                                    e.target.setAttribute('src', current.replace('.png', '_OFF.png'));
                                }
                            },
                            onClick: (e) => {
                                let language = getCookie('lang', true) || languageJson.default;
                                let active = [...document.querySelectorAll('.language_option:not([src*="_OFF.png"])')]
                                    .find(x => x.getAttribute('src').includes(`${language}.png`));
                                if (e.target == active) return;
                                let currentSrc = active.getAttribute('src');
                                let currentLang = currentSrc.match(/\/[a-zA-Z]{2}\./g)[0];
                                let newLang = currentLang.substring(0, currentLang.length - 1);

                                active.removeAttribute('selected');
                                active.setAttribute('src', currentSrc.replace(currentLang, `${newLang}_OFF.`));

                                currentSrc = e.target.getAttribute('src');
                                currentLang = currentSrc.match(/\/[a-zA-Z]{2}\./g)[0];
                                newLang = currentLang.substring(0, currentLang.length - 1);

                                e.target.setAttribute('selected', '');
                                e.target.setAttribute('src', `${currentSrc.split(newLang).shift()}${newLang}.png`);
                                RefactorLanguage(newLang.replace('/', ''));
                                setCookie('lang', newLang.replace('/', ''), 30, timeUnits.days);
                            },
                            src: `/storage/media/langIcons/${l.lang}${l.lang == language ? '' : '_OFF'}.png`
                        },
                    );
                })
            ]
        )
    }
}

const domContainer = document.querySelector('#language[data-type="container"]');
const root = ReactDOM.createRoot(domContainer);
root.render(e(LanguagePreview));

