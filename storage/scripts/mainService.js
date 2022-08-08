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
                    ContentParser(languageJson
                        .content.find(x => x.lang == language)
                        .data.find(x => x['@type'] == 'mainContent').content,
                        languageJson
                            .content.find(x => x.lang == language)
                            .data.find(x => x['@type'] == 'mainContent')['@contentType']),
                    e(
                        'img',
                        {
                            id: 'imageFrame',
                            key: 'imageFrame'
                        }
                    )]
                    break;
                default:
                    return [e(
                        'h1',
                        {
                            id: "mainTitle",
                            key: "mainTitle"
                        },
                        'hey'
                    )]
                    break;
            }
        }

        function ContentParser(content, contentType) {
            switch (contentType) {
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
root.render([e(textNode)]);