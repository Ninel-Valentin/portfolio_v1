'use strict';
import languageJson from '../data/languages.json' assert {type: 'json'}
import { getCookie } from '../scripts/cookieService.js'

let language = getCookie('lang');
language = language ? language : languageJson.default;

const e = React.createElement;

class Maintenance extends React.Component {
    render() {
        return [e(
            'img',
            {
                id: 'maintenance',
                src: '../storage/media/workInProgress.png',
                alt: 'Maintenance image',
                key: 'mentenanceImg'
            }
        ),
        e(
            'h2',
            {
                id: 'workInProgress',
                key: 'mentenanceTitle'
            },
            languageJson
                .content.find(x => x.lang == language)
                .data.find(x => x['@type'] == 'maintenance')
                .message
        )
        ];
    }
}

const domContainer = document.querySelector('#content_container');
const root = ReactDOM.createRoot(domContainer);
root.render(e(Maintenance));