'use strict';
import languageJson from '../data/languages.json' assert {type: 'json'}
import { getCookie } from '../scripts/common/cookieService.js'

let language = getCookie('lang', true) || languageJson.default;

const e = React.createElement;

class Text extends React.Component {
    constructor(props) {
        super(props);
        let page = window.location.href.split('page=');
        this.state = {
            page: page.length > 1 ? page.pop() : 0
        }
    }

    render() {
        window.addEventListener('click', (e) => {
            if (e.target.className.includes('rullerButton')) {
                document.querySelector('#content').animate([
                    { opacity: 1 },
                    { opacity: 0 }
                ], {
                    duration: 500, easing: 'ease-in'
                });
                let page = window.location.href.split('page=');
                this.setState({
                    page: page.length > 1 ? page.pop() : 0
                });

                document.querySelector('#content').animate([
                    { opacity: 0 },
                    { opacity: 1 }
                ], {
                    duration: 500, easing: 'ease-out'
                });
            }
        });

        function GetContent(page) {
            language = getCookie('lang', true) || languageJson.default;
            switch (+page) {
                case 0:
                    return [e(
                        'h1',
                        {
                            id: "mainTitle",
                            key: "mainTitle"
                        },
                        languageJson.content
                            .find(x => x['@type'] == 'mainTitle')[language]
                            .split('</br>').map((x, index) =>
                                [x, e('br', { key: `brContent${index}` })])
                    ),
                    ContentParser(
                        languageJson.content
                            .find(x => x['@type'] == 'mainContent')),
                    e(
                        'img',
                        {
                            id: 'imageFrame',
                            key: 'imageFrame'
                        }
                    )]
                case 1: return ContentParser(
                    languageJson.content.find(x => x['@type'] == 'bioTable'))
                case 2: return ContentParser(
                    languageJson.content.find(x => x['@type'] == 'eduList'))
                default:
                    return [e(
                        'h1',
                        {
                            id: "mainTitle",
                            key: "mainTitle"
                        },
                        'hey'
                    )]
            }
        }

        function ContentParser(contentNode, type = contentNode['@contentType']) {
            let content = contentNode.content;
            switch (type) {
                case 'Q&A':
                    let final = [];
                    content.forEach((x, index) => {
                        final.push(...[e(
                            'h4',
                            {
                                key: `q${index}`,
                                className: `question`,
                                'data-type': 'mainContent'
                            },
                            x.q[language]
                        ),
                        e(
                            'h6',
                            {
                                key: `a${index}`,
                                className: `answer`,
                                'data-type': 'mainContent'
                            },
                            ...x.a[language].split('</br>').map((y, i) =>
                                [y, e('br', { key: `brAnswer${i}` })]
                            )
                        )]);
                    })
                    return final;
                case 'Table':
                    return e(
                        'div',
                        {
                            key: 'bioTable',
                            id: 'bioTable'
                        },
                        content.map((x, index) => {
                            return e(
                                'div',
                                {
                                    className: 'bioHeader',
                                    key: `bioHeader${index}`
                                },
                                [x.name.hasOwnProperty(language) ?
                                    x.name[language] : (
                                        x.name.hasOwnProperty('default') ?
                                            x.name['default'] : x.name
                                    ),
                                e(
                                    'div',
                                    {
                                        className: 'bioRow',
                                        key: `bioRow${index}`,
                                        onClick: (e) => {
                                            let target = e.target.querySelector('.bioRowValue');
                                            navigator.clipboard.writeText(x.value);
                                            target.innerText = 'Text copied to the clipboard!';

                                            let animFT = [
                                                { color: '#101222' },
                                                { color: 'transparent' }
                                            ]
                                            let animProps = {
                                                duration: 700,
                                                easing: 'ease-in-out'
                                            }
                                            target.animate(animFT, animProps);

                                            setTimeout(() => {
                                                target.innerText = x.value;
                                            }, 685);
                                        }
                                    },
                                    [e(
                                        'div', {
                                        className: 'bioRowValue',
                                        key: `bioRowVal${index}`
                                    },
                                        x.value.hasOwnProperty(language) ?
                                            x.value[language] : (
                                                x.value.hasOwnProperty('default') ?
                                                    x.value['default'] : x.value
                                            )
                                    ),
                                    e('div',
                                        {
                                            className: 'copyToClipboard',
                                            key: `copyImg${index}`
                                        })
                                    ]
                                )]
                            )
                        })
                    )
                case 'List':
                    return e(
                        'div',
                        {
                            id: 'directory',
                            key: 'directory'
                        },
                        [
                            e(
                                'div',
                                {
                                    id: 'directoryHeaders',
                                    key: 'directoryHeaders'
                                },
                                content.map((x, index) => {
                                    return e(
                                        'div',
                                        {
                                            className: `directoryHeader${index == 0 ? ' active' : ''}`,
                                            key: `directoryHeader${index}`,
                                        },
                                        x.directoryName[language]
                                    )
                                })
                            ),
                            e(
                                'div',
                                {
                                    id: 'directoryListing',
                                    key: 'directoryListing'
                                },
                                content[0].content.map((x, index) => {
                                    return e(
                                        'div',
                                        {
                                            className: `directoryLine${index == 0 ? ' active' : ''}`,
                                            key: `directoryLine${index}`,
                                        },
                                        [
                                            e('span', { key: `directorySpan${index}` },
                                                x.header[language]),
                                            e(
                                                'p',
                                                {
                                                    key: `directoryP${index}`,
                                                    style: {
                                                        color: x.status
                                                    }
                                                },
                                                x.state[language]
                                            )
                                        ]
                                    )
                                })
                            ),
                            e(
                                'div',
                                {
                                    id: 'directoryContent',
                                    key: 'directoryContent'
                                },
                                ContentParser(content[0].content[0])
                            )
                        ]
                    );
                case 'DirectoryInfo':
                    break;
                default:
                    throw ('Wrong content type passed in the parser!');
            }
        }

        return GetContent(this.state.page);
    }
}


const domContainer = document.querySelector('#content[data-type="container"]');
const root = ReactDOM.createRoot(domContainer);
var textNode = Text;
root.render([e(textNode, { key: 'rootRender' })]);