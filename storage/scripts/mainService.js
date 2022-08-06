'use strict';
import languageJson from '../data/languages.json' assert {type: 'json'}
import { getCookie } from '../scripts/common/cookieService.js'

let language = getCookie('lang', true);
language = language ? language : languageJson.default;

const e = React.createElement;

class Text extends React.Component {
    render() {
        return e(
            'h1',
            {
                id: "mainTitle",
                key: "mainTitle"
            },
            ...languageJson
                .content.find(x => x.lang == language)
                .data.find(x => x['@type'] == 'mainTitle')
                .message.split('</br>').map((x, index) => [x, e('br', { key: `br${index}` })])
        )
    }
}

class ImageFrame extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            step: 0
        }
    }

    render() {
        switch (this.state.step) {
            default:
                throw ('Invalid step on ImageFrame');
            case 0:
                return e(
                    'img',
                    {
                        id: 'imageFrame',
                        key: 'imageFrame'
                    }
                );
        }
    }
}

const domContainer = document.querySelector('#content[data-type="container"]');
const root = ReactDOM.createRoot(domContainer);
root.render([e(Text), e(ImageFrame)]);
