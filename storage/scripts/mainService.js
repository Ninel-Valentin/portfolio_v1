'use strict';
import languageJson from '../data/languages.json' assert {type: 'json'}
import { getCookie } from '../scripts/common/cookieService.js'

let language = getCookie('lang', true);
language = language ? language : languageJson.default;

const e = React.createElement;

class Text extends React.Component {
    render() {
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
                .data.find(x => x['@type'] == 'mainContent')['@contentType'])
        ]
    }
}

class ImageFrame extends React.Component {
    render() {
        return e(
            'img',
            {
                id: 'imageFrame',
                key: 'imageFrame'
            }
        );
    }
}

const domContainer = document.querySelector('#content[data-type="container"]');
const root = ReactDOM.createRoot(domContainer);
root.render([e(Text), e(ImageFrame)]);
