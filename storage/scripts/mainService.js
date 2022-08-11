'use strict';
import languageJson from '../data/languages.json' assert {type: 'json'}
import { getCookie } from '../scripts/common/cookieService.js'

let language = getCookie('lang', true);
language = language ? language : languageJson.default;

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
            switch (+page) {
                case 0:
                    return [e(
                        'h1',
                        {
                            id: "mainTitle",
                            key: "mainTitle"
                        },
                        ...['mainTitle', 'mainContent'].map(x =>
                            languageJson
                                .content.find(y => y.lang == language)
                                .data.find(y => y['@type'] == x)
                                .message.split('</br>').map((y, index) =>
                                    [y, e('br', { key: `brContent${index}` })])
                        )
                    ),
                    ContentParser(
                        languageJson
                            .content.find(x => x.lang == language)
                            .data.find(x => x['@type'] == 'mainContent')),
                    e(
                        'img',
                        {
                            id: 'imageFrame',
                            key: 'imageFrame'
                        }
                    )]
                case 1:
                    return [ContentParser(
                        languageJson
                            .content.find(x => x.lang == language)
                            .data.find(x => x['@type'] == 'bio'), 'Table1'),
                    e('div',
                        {
                            key: 'copyToClipboard',
                            style: {
                                'width': '90vw',
                                'textAlign': 'right'
                            }
                        },
                        languageJson
                            .content.find(x => x.lang == language)
                            .data.find(x => x['@type'] == 'copyToClipboard')
                            .message
                    )]
                case 2: return ContentParser(
                    languageJson
                        .content.find(x => x.lang == language)
                        .data.find(x => x['@type'] == 'bio'))

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
                                className: `question`
                            },
                            x.q
                        ),
                        e(
                            'h6',
                            {
                                key: `a${index}`,
                                className: `answer`
                            },
                            ...x.a.split('</br>').map((y, i) =>
                                ['→ ', y, e('br', { key: `brAnswer${i}` })]
                            )
                        )]);
                    })
                    return final;
                case 'Table1':
                    return e(
                        'table',
                        {
                            id: 'bio',
                            key: 'bio'
                        },
                        e(
                            'tbody',
                            {
                                key: 'biotbody'
                            },
                            content.map((x, index) => {
                                return [e(
                                    'tr',
                                    {
                                        key: `biotr${index}`
                                    },
                                    ...[
                                        e('td', {
                                            key: `biotdname${index}`,
                                            className: 'biotdname'
                                        }, x.name
                                        ),
                                        e('td', {
                                            key: `biotdvalue${index}`,
                                            className: 'biotdvalue',
                                            onClick: (e) => {
                                                navigator.clipboard.writeText(x.value);
                                                e.target.innerText = 'Text copied to the clipboard!';

                                                let animFT = [
                                                    { color: 'white' },
                                                    { color: '#101222' }
                                                ]
                                                let animProps = {
                                                    duration: 1000,
                                                    easing: 'ease-in-out'
                                                }
                                                e.target.animate(animFT, animProps);

                                                setTimeout(() => {
                                                    e.target.innerText = x.value;
                                                }, 1000);
                                            }
                                        }, x.value
                                        )]
                                )];
                            })
                        )
                    )
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
                                [x.name,
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
                                        x.value
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