'use strict';
import languageJson from '../../data/languages.json' assert {type: 'json'}
import { getCookie, setCookie, timeUnits } from './cookieService.js'

let language = getCookie('lang', true);
language = language ? language : languageJson.default;
//This doesn't update;

const e = React.createElement;

function RefactorLanguage(lang) {
    if (!lang) throw ('No language was sent as parameter');
    let langData = languageJson.content.find(x => x.lang == lang);
    langData.data.filter(x => document.querySelectorAll(`#${x['@type']}`).length > 0)
        .forEach(x => {
            if (x.content) {
                x.content.forEach(y => {
                    document.querySelector(`#${y['@type']}`).innerHTML = y.message;
                })
            } else {
                document.querySelector(`#${x['@type']}`).innerHTML = x.message;
            }
        });
    document.querySelector('title').innerHTML = langData.titles
        .find(x => x['@type'] == document.querySelector('title').getAttribute('type'))
        .message;
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
                    language = getCookie('lang', true);
                    language = language ? language : languageJson.default;
                    self.setAttribute('style',
                        `background-image: url(/storage/media/langIcons/${language}.png);` +
                        'background-size:cover;');
                    self.removeAttribute('class');
                },
                onMouseEnter: () => {
                    this.state.minimized = false;
                    this.forceUpdate();
                    language = getCookie('lang', true);
                    language = language ? language : languageJson.default;
                    let self = document.querySelector('#language_preview');
                    self.removeAttribute('style');
                    self.setAttribute('class', 'active');
                }
            },
            this.state.minimized ? '' : [
                ...languageJson.content.filter(x => x['@usable']).map(l => {
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
                                let language = getCookie('lang', true);
                                language = language ? language : languageJson.default;
                                if (!e.target.getAttribute('src').includes(`${language}.png`)) {
                                    let current = e.target.getAttribute('src');
                                    e.target.setAttribute('src', current.replace('.png', '_OFF.png'));
                                }
                            },
                            onClick: (e) => {
                                let language = getCookie('lang', true);
                                language = language ? language : languageJson.default;
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

