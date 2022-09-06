const languageJson = require('../data/languages.json');
import { getCookie, setCookie, timeUnits } from '../../cookieService.js';

function GetUrlParam(name) {
    let search = window.location.search;
    let params = new URLSearchParams(search);

    return params.get(name);
}

function GetLanguageValue(content) {
    let lang = GetUrlParam('lang');
    if (content.hasOwnProperty(lang)) return content[lang];
    if (content.hasOwnProperty('default')) return content['default'];
    return content;
}

export function ClearFields(e) {
    document.querySelectorAll('[placeholder]').forEach(x => {
        x.value = '';
    })
}

function SendEmail(e) {

}

function ValidateFields(e) {
    // Modify notice based on potential errors
    let data = languageJson.content.find(x => x['@type'] == 'email').content;
    document.querySelectorAll('input,textarea').forEach((x, index) => {
        if (x.value == '') {
            let errorData = data.errors.find(x => x.field == x.attr('input-type'));
            let message = GetLanguageValue(errorData.content);
        }
    });
}