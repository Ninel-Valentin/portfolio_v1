'use strict';
import languageJson from '../data/languages.json' assert {type: 'json'}
import { getCookie } from '../scripts/cookieService.js'

let language = getCookie('lang',true);
language = language ? language : languageJson.default;

const e = React.createElement;

class Maintenance extends React.Component {
    render() {
        return [e(
            'img',
            {
                id: 'maintenance',
                key: 'maintenance',
                src: '../storage/media/workInProgress.png',
                alt: 'Maintenance image'
            }
        ),
        e(
            'h2',
            {
                id: 'workInProgress',
                key: 'workInProgress'
            },
            languageJson
                .content.find(x => x.lang == language)
                .data.find(x => x['@type'] == 'workInProgress')
                .message
        ),
        e(
            'a',
            {
                id: 'returnHome',
                key: 'returnHome',
                href: '/main.html'
            },
            languageJson
                .content.find(x => x.lang == language)
                .data.find(x => x['@type'] == 'returnHome')
                .message
        )
        ];
    }
}

const domContainer = document.querySelector('#content_container');
const root = ReactDOM.createRoot(domContainer);
root.render(e(Maintenance));