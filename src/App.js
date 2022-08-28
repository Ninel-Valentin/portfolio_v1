import React, { useState } from "react";
import { getCookie, setCookie, timeUnits } from './cookieService.js';

const languageJson = require('./storage/data/languages.json');
const pagesJson = require('./storage/data/pages.json');
var canScroll = true;

function scroll(event) {
    if (canScroll) {
        let active = document.querySelector('.rullerButton.active').getAttribute('value');
        if (event.deltaY) {
            // Scroll Up / Down
            let next = +active + (event.deltaY / Math.abs(event.deltaY));
            // If the move is impossible, do nothing
            if (next >= pagesJson.content.length || next < 0) return;
            let nextNode = document.querySelector(`[value="${next}"]`);
            nextNode.click();
        }
    }
    canScroll = false;
}

document.onwheel = scroll;
document.addEventListener('keydown', (e) => {
    let keys = ['PageUp', 'PageDown'];
    if (keys.includes(e.key)) {
        scroll({
            deltaY: keys.indexOf(e.key) * 2 - 1
        });
    }
})

const App = (props) => {
    var dir = getCookie('dir', true);
    if (!dir) {
        dir = {
            directory: 0,
            listItem: 0
        };
        setCookie('dir',
            JSON.stringify(dir), 30, timeUnits.days);
    } else {
        dir = JSON.parse(dir);
    }

    const [data, setData] = useState({
        lang: GetUrlParam('lang') || languageJson.default,
        page: GetUrlParam('p') || props.page,
        dir: dir
    });

    const title = document.querySelector('title');
    title.innerText = languageJson.titles.find(x => x['@type'] == title.getAttribute('data-type'))[data.lang];

    const updateLanguage = (e) => {
        let targetLang = e.target.getAttribute('data-type');
        ModifyUrl(data.page, { name: "lang", value: targetLang });
        if (targetLang != data.lang)
            setData({
                ...data,
                lang: targetLang
            });
    }

    function GetUrlParam(name) {
        let search = window.location.search;
        let params = new URLSearchParams(search);

        return params.get(name);
    }

    function ModifyUrl(senderId, param) {
        let search = window.location.search;
        let params = new URLSearchParams(search);
        params.set(param.name, param.value);

        history.replaceState({
            id: senderId,
            source: 'web'
        }, '', window.location.href.split('?').shift() + '?' + params);
    }

    function ParseBreak(string, key, addOn = null) {
        return string.split('</br>').map((x, index) => {
            return [
                (addOn ? addOn : ''),
                ...ParseLinks(x),
                <br key={`BR_${key}_${index}`}></br>
            ];
        })
    }

    function ParseLinks(string) {
        let final = [];
        let matches = string.match(/{{.*?}}/g);
        let fillers = string.split(/{{.*?}}/g);
        if (!matches) return string;
        matches.forEach((link, index) => {
            final.push(fillers.shift());
            link = link.replace(/{|}/g, '');
            final.push(<a
                target="_blank"
                key={`Link${link.split('->')[0]}${index}`}
                href={link.split('->').pop()}>
                {link.split('->').shift()}
            </a>)
        })
        return final;
    }

    function GetLanguageValue(content) {
        if (content.hasOwnProperty(data.lang)) return content[data.lang];
        if (content.hasOwnProperty('default')) return content['default'];
        return content;
    }

    function ParseContent(content) {
        switch (content['@contentType']) {
            case 'Q&A':
                return (
                    content.content.map((x, index) => {
                        return [
                            <h4 key={`Q${content['@type']}${index}`}
                                data-type={content['@type']}
                                className="question">
                                {x.q[data.lang]}
                            </h4>,
                            <h6 key={`A${content['@type']}${index}`}
                                data-type={content['@type']}
                                className="answer">
                                {ParseBreak(GetLanguageValue(x.a), `${content['@type']}${index}`, '→')}
                            </h6>
                        ]
                    })
                );
            case 'Table':
                return (
                    content.content.map((x, index) => {
                        return [
                            <li className="header"
                                key={`liN${content['@type']}${index}`}>
                                {GetLanguageValue(x.name)}
                            </li>,
                            <li className="body"
                                key={`liV${content['@type']}${index}`}
                                onClick={(e) => {
                                    navigator.clipboard.writeText(GetLanguageValue(x.value));
                                    e.target.innerText = 'Text copied to the clipboard!';

                                    let animFT = [
                                        { color: '#101222' },
                                        { color: 'transparent' }
                                    ]
                                    let animProps = {
                                        duration: 700,
                                        easing: 'ease-in-out'
                                    }
                                    e.target.animate(animFT, animProps);

                                    setTimeout(() => {
                                        e.target.innerText = GetLanguageValue(x.value);
                                    }, 685);
                                }}>
                                {GetLanguageValue(x.value)}
                            </li>
                        ]
                    })
                );
            case 'Directory':
                return (<div
                    id="directory"
                    key="directory">
                    <div id="directoryHeaders"
                        key="directoryHeaders">
                        {
                            [...content.content].map((x, index) => {
                                return (<div
                                    className={`directoryHeader${index == data.dir.directory ? ' active' : ''}`}
                                    key={`directoryHeader${content['@contentType']}${index}`}
                                    onClick={(e) => {
                                        let newDir = {
                                            directory: index,
                                            listItem: 0
                                        };
                                        setData({
                                            ...data,
                                            dir: newDir
                                        });
                                        setCookie('dir',
                                            JSON.stringify(newDir), 30, timeUnits.days);
                                    }}
                                >{GetLanguageValue(x.directoryName)}
                                </div>)
                            })
                        }
                    </div>
                    <div id="directoryBlock"
                        key="directoryBlock">
                        <div id="directoryListing"
                            key="directoryListing">
                            <div id="directoryLogoPreview"
                                key="directoryLogoPreview"
                                style={{
                                    "backgroundImage": `url(/portofolio/public/storage/media/logos/${content.content[data.dir.directory].content[data.dir.listItem].logo})`,
                                    "filter": content.content[data.dir.directory].content[data.dir.listItem].shadow
                                        ? `drop-shadow(0 0 .75rem ${content.content[data.dir.directory].content[data.dir.listItem].logoShadow})` : ''
                                }}>

                            </div>
                            <div>
                                {
                                    [...content.content[data.dir.directory].content].map((x, index) => {
                                        return (<div
                                            className={`directoryLine${index == data.dir.listItem ? ' active' : ''}`}
                                            key={`directoryLine${content['@contentType']}${index}`}
                                            onClick={(e) => {
                                                let newDir = {
                                                    directory: data.dir.directory,
                                                    listItem: index
                                                };
                                                setData({
                                                    ...data,
                                                    dir: newDir
                                                });
                                                setCookie('dir',
                                                    JSON.stringify(newDir), 30, timeUnits.days);
                                            }}>
                                            <span key={`directoryLineSpan${content['@contentType']}${index}`}>
                                                {ParseBreak(GetLanguageValue(x.header))}
                                            </span>
                                            <p key={`directoryLineP${content['@contentType']}${index}`}
                                                style={{
                                                    color: x.status
                                                }}>
                                                {GetLanguageValue(x.state)}
                                            </p>
                                        </div>)
                                    })
                                }
                            </div >
                        </div>
                        <div id="directoryContent"
                            key="directoryContent">
                            {ParseContent(content.content[data.dir.directory].content[data.dir.listItem].details)}
                            <hr></hr>
                            {ParseContent(content.content[data.dir.directory].content[data.dir.listItem].info)}
                        </div>
                    </div>
                </div >);
            case 'FileSystem':
                return (<div>
                    {/* <iframe src=
                        "https://media.geeksforgeeks.org/wp-content/cdn-uploads/20210101201653/PDF.pdf"
                        width="800"
                        height="500">
                    </iframe> */}
                </div>);
            default:
                break;
        }
    }

    function CreateContent() {
        switch (+data.page) {
            case 0:
                let titleKey = 'mainTitle',
                    contentKey = 'mainContent';
                return [
                    <h1 key={titleKey}
                        id={titleKey}>
                        {ParseBreak(GetLanguageValue(languageJson.content.find(x => x['@type'] == titleKey)), titleKey)}
                    </h1>,
                    ParseContent(languageJson.content.find(x => x['@type'] == contentKey)),
                    <img id="imageFrame"
                        key="imageFrame"></img>
                ];
            case 1:
                let bioKey = 'bioTable';
                return (
                    <ul id={bioKey}
                        key={bioKey}>
                        {ParseContent(languageJson.content.find(x => x['@type'] == bioKey))}
                    </ul>
                );
            case 2:
                return ParseContent(languageJson.content.find(x => x['@type'] == 'eduList'));
            case 3:
                return ParseContent(languageJson.content.find(x => x['@type'] == 'CVpreview'));
            default:
                return (
                    `This was made from Scratch! Hi there world!
                    page: ${data.page}
                    language: ${data.lang}`
                );
        }
    }

    function CalculateHeight(index) {
        // calculate for #down
        //100 vh / number of steps - 5vh (selected space) / 2
        let pSize = (100 / pagesJson.content.length - 5) / 2;
        let height = -100 + index * (2 * pSize + 5) + pSize + 5;
        return height;
    }

    const scrollPage = (e) => {
        let currentActive = GetUrlParam('p') || 0;
        let currentNode = document.querySelector(`.rullerButton[value="${currentActive}"]`);
        let targetActive = e.target.getAttribute('value');
        currentNode.className = 'rullerButton';
        e.target.className = 'rullerButton active';

        ModifyUrl(targetActive, { name: 'p', value: targetActive });
        // Only update if new
        if (targetActive != data.page) setData({
            ...data,
            page: targetActive
        });

        let ruller = document.querySelector('#ruller');
        let rullerStyle = ruller.getAttribute('style');
        let rullerHeight = rullerStyle.match(/-?\d+(\.\d+)?/g)[0];

        let animFT = [
            { top: `${rullerHeight}vmin` },
            { top: `${CalculateHeight(targetActive)}vmin` }
        ]
        let duration = Math.abs(targetActive - currentActive) * 100;
        let animProps = {
            duration: duration,
            easing: 'ease-in-out',
            fill: 'forwards'
        }
        ruller.animate(animFT, animProps);
        ruller.setAttribute('style', rullerStyle.replace(rullerHeight, CalculateHeight(targetActive)));

        setTimeout(() => {
            canScroll = true;
        }, duration);
    };

    function LoadScrollbar() {
        let search = window.location.search;
        let params = new URLSearchParams(search);

        let currentParam = params.get('p');
        let selectedPage = currentParam || 0;

        let buttons = pagesJson.content.map(x =>
            <div className={`rullerButton${x.id == selectedPage ? ' active' : ''}`}
                key={`rullerButton${x.id}`}
                value={x.id}
                onClick={scrollPage}>
                {x.text || x.id}
            </div>);
        return buttons;
    }

    function CookiePopUpService() {
        if (!getCookie('c', true)) {
            return (
                <div id="cookiesPopUpBg"
                    key="cookiesPopUpBg">
                    <div id="cookiesPopUpMessage"
                        key="cookiessPopUpMessage">
                        {ParseBreak(languageJson.content.find(x => x['@type'] == 'cookiesText')[data.lang])}
                        <button id="cookiesAllow"
                            key="cookiesAllow"
                            onClick={() => {
                                setCookie('c', 'true', 30, timeUnits.days);
                                let self = document.querySelector('#cookiePopUp');
                                self.className = 'fade';
                                setTimeout(() => { self.remove() }, 250);
                            }}>
                            {languageJson.content.find(x => x['@type'] == 'cookiesAllow')[data.lang]}
                        </button>
                    </div>
                </div>
            )
        }
    }

    return [
        <div id="language_preview"
            key="languageChanger"
            // This only returns true at the very start, before React creating the element
            style={{
                backgroundImage: `url(/portofolio/public/storage/images/langIcons/${data.lang}.png)`, //deploy
                // backgroundImage: `url(/storage/images/langIcons/${lang}.png)`, //dev
                backgroundSize: 'cover'
            }}
            onMouseEnter={() => { document.querySelector('#language_preview').removeAttribute('style') }}
            onMouseLeave={() => {
                document.querySelector('#language_preview').setAttribute('style',
                    // `background-image: url(/portofolio/public/storage/images/langIcons/${lang}.png);
                    `background-image: url(/portofolio/public/storage/images/langIcons/${data.lang}.png);
                    background-size:cover;`)
            }}
        >
            {
                languageJson.languages.filter(x => x['@usable'])
                    .map((x, index) => {
                        return (
                            <img onClick={updateLanguage}
                                data-type={x.lang}
                                key={'language_option' + index}
                                className="language_option"
                                src={`/portofolio/public/storage/images/langIcons/${x.lang + (x.lang == data.lang ? '' : '_OFF')}.png`} //deploy
                            // src={`/storage/images/langIcons/${x.lang + (x.lang == lang ? '' : '_OFF')}.png`} //dev
                            >
                            </img>
                        )
                    })
            }
        </div >,
        <div id="content"
            key="content">
            {CreateContent()}
        </div>,
        < div id="scroll"
            key="scroll" >
            <div id="ruller"
                key="ruller"
                style={{
                    top: `${CalculateHeight(GetUrlParam('p'))}vmin`
                }}>
                <div id="up"
                    key="up"></div>
                <div id="down"
                    key="down"></div>
            </div>
            <div id="buttons"
                key="buttons">
                {LoadScrollbar()}
            </div>
        </div >,
        <div id="cookiePopUp"
            key="cookiePopUp"
            data-type="placeholder">
            {CookiePopUpService()}
        </div>
    ]
}

export default App;