import React, { useState } from "react";
import { getCookie, setCookie, timeUnits } from './cookieService.js';

const pagesJson = require('./storage/data/pages.json');
// const emailService = require('./storage/scripts/emailService.js');
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

window.onload = () => {
    let url = window.location.href;
    if (!url.includes('p=')) return;
    let param = window.location.search.match(/(?<=p=)-?\d+/g)?.shift() || 0;

    if (param < 0 || param >= pagesJson.content.length) {
        param = param <= 0 ? 0 : pagesJson.content.pop().id;
        window.location.href = window.location.href.replace(/p=-?\d+/g, `p=${param}`);
    }
};
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

    let languageJson = require(`./storage/data//languagesPagination/page${GetUrlParam('p') || props.page}.json`);

    const [data, setData] = useState({
        lang: GetUrlParam('lang') || languageJson.default,
        page: GetUrlParam('p') || props.page,
        dir: dir
    });

    const title = document.querySelector('title');
    title.innerText = GetLanguageValue(languageJson.title);

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
        if (content.match(/PROPERTY_.+\|.+/g)) {
            let keywords = content.split('_').pop().split('|');
            let category = keywords.shift();
            let key = keywords.pop();

            let value = languageJson.contentProperties[category][key];
            return GetLanguageValue(value);
        }
        return content;
    }

    function ParseContent(content) {
        if (content.hasOwnProperty('@usable') && !content['@usable']) {
            return;
        }
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
                                    "backgroundImage": `url(/portofolio/public/storage/images/logos/${content.content[data.dir.directory].content[data.dir.listItem].logo})`,
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
                return [
                    <div id="FileSystem"
                        key="FileSystem">
                        <ul id="FileListing"
                            key="FileListing">
                            {
                                [...content.content.files.map((x, index) => {
                                    return (<li
                                        className={`FileLine${index == (+getCookie('file', true) || 0) ? ' active' : ''}`}
                                        key={`FileLine${content['@contentType']}${index}`}
                                        onClick={(e) => {
                                            let target = e.target.className.includes('Icon') ?
                                                e.target.parentElement : e.target;
                                            if (target.className.includes('active')) return;
                                            let current = document.querySelector('.FileLine.active');
                                            current.className = 'FileLine';
                                            target.className = 'FileLine active';
                                            document.querySelector('#FilePreview iframe').setAttribute('src', `/storage/files/${content.content.files[index].name}`)
                                            setCookie('file', index, 1, timeUnits.days);
                                        }}>
                                        <div
                                            className="FileIcon"
                                            style={{
                                                backgroundImage: `url(/portofolio/public/storage/images/filesLogos/${x.name.split('.')[1]}.png)`
                                            }}
                                            key={`FileIcon${content['@contentType']}${index}`}></div>
                                        {x.displayedName || x.name.split('.').shift()}
                                    </li>);
                                })]}
                        </ul>
                        <div id="FilePreview"
                            key="FilePreview">
                            {
                                // content.content.files.find
                                <iframe
                                    key="FileIFrame"
                                    src=
                                    {`/storage/files/${content.content.files[+getCookie('file', true) || 0].name}`}
                                    width="100%"
                                    height="100%">
                                </iframe>
                            }
                        </div>
                    </div >,
                    <div
                        id="FilePreviewNotice"
                        key="FilePreviewNotice">
                        {GetLanguageValue(content.content.notice)}
                    </div>
                ];
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
                        key={bioKey}
                        data-type="table">
                        {ParseContent(languageJson.content.find(x => x['@type'] == bioKey))}
                    </ul>
                );
            case 2:
                return ParseContent(languageJson.content.find(x => x['@type'] == 'eduList'));
            case 3:
                return ParseContent(languageJson.content.find(x => x['@type'] == 'CVpreview'));
            case 'email':
                /* region email
                return (<table
                    key="EmailSender"
                    id="EmailSender">
                    <thead>
                        {
                            Object.keys(languageJson.content.find(x => x['@type'] == 'email').content.head).map((x, index) => {
                                return (
                                    <tr key={`${x}${index}row`}
                                        email-data={x}>
                                        <th key={`${x}${index}header`}>
                                            {GetLanguageValue(languageJson.content.find(x => x['@type'] == 'email').content.head[x])}:
                                        </th>
                                        <td key={`${x}${index}input`}>
                                            {
                                                x == 'to' ? <i>valentinbanica8@gmail.com</i> : (
                                                    <input type="text"
                                                        input-type={x}
                                                        placeholder={GetLanguageValue(languageJson.content.find(x => x['@type'] == 'email').content.placeholder)}
                                                        id={`input_${x}`}
                                                        key={`${x}${index}input_${x}`}>
    
                                                    </input>
                                                )
                                            }
                                        </td>
                                    </tr>);
                            })
                        }
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan="2"
                                email-data="body">
                                <textarea
                                    placeholder={GetLanguageValue(languageJson.content.find(x => x['@type'] == 'email').content.placeholder)}
                                ></textarea>
                            </td>
                        </tr>
                        <tr>
                            <td email-data="footer"
                                colSpan="2">
                                <button>
                                    {GetLanguageValue(languageJson.content.find(x => x['@type'] == 'email').content.clear)}
                                </button>
                                <button>
                                    {GetLanguageValue(languageJson.content.find(x => x['@type'] == 'email').content.send)}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table >);
                */
                break;
            case 4:
                let data = [...languageJson.content.find(x => x['@type'] == 'socialMedia').content.map((smEntry, smIndex) => {
                    return (<div
                        key={`div${smIndex}`}>
                        <div
                            key={`key${smIndex}`}
                            className="rope">
                        </div>
                        <div
                            key={`faceWrapper${smIndex}`}
                            className="faceWrapper"
                            datatype={`${smEntry['@type']}`}
                            onClick={(e) => {
                                if (!smEntry.link) return;
                                window.open(smEntry.link);
                            }}
                            onMouseEnter={(e) => {
                                const target = document.querySelector(`[datatype=${smEntry['@type']}] .contentBox`);
                                let child = document.querySelector(`[datatype=${smEntry['@type']}] .contentBox p`);
                                if (!child.getAttribute('style')) {
                                    return;
                                }
                                let animFT = [
                                    { transform: 'rotateY(0deg)' },
                                    { transform: 'rotateY(180deg)' }
                                ]
                                let animProps = {
                                    duration: 500,
                                    easing: 'ease-in-out',
                                    fill: 'forwards'
                                }
                                target.animate(animFT, animProps);

                                setTimeout(() => {
                                    child.removeAttribute('style');
                                }, 250);
                            }}
                            onMouseLeave={(e) => {
                                const target = document.querySelector(`[datatype=${smEntry['@type']}] .contentBox`);
                                let child = document.querySelector(`[datatype=${smEntry['@type']}] .contentBox p`);
                                let animFT = [
                                    { transform: 'rotateY(180deg)' },
                                    { transform: 'rotateY(0deg)' }
                                ]
                                let animProps = {
                                    duration: 500,
                                    easing: 'ease-in-out',
                                    fill: 'forwards'
                                }
                                target.animate(animFT, animProps);

                                setTimeout(() => {
                                    child.setAttribute('style', 'display:none;');
                                }, 250);
                            }}>
                            <div
                                style={{
                                    backgroundImage: `url(/portofolio/public/storage/images/social/${smEntry['@type']}${smEntry.imageType})`,
                                    backgroundColor: smEntry.background || '',
                                    filter: `drop-shadow(${smEntry.color} 0 0 5px)`
                                }}
                                key={`contentBox${smIndex}`}
                                className="contentBox">
                                <p
                                    key={`contentP${smIndex}`}
                                    style={{
                                        display: 'none'
                                    }}>
                                    {smEntry.text}</p>
                            </div>
                        </div>
                    </div>);
                })];
                return (
                    <div
                        key="screen"
                        id="screen">
                        {data}
                    </div>);
            default:
                console.log(data);
                return (
                    `This was made from Scratch! Hi there world!
                    page: ${data?.page || GetUrlParam('p')}
                    language: ${data?.lang || GetUrlParam('lang') || languageJson.default}`
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

    function ContentFade(isScrollingUp, isFadingIn) {
        let content = document.querySelector('div#content');

        let animKeys = [
            {
                top: isFadingIn ? (isScrollingUp ? '25vmin' : '-25vmin') : 0,
                opacity: isFadingIn ? 0 : 1
            },
            {
                top: isFadingIn ? 0 : (isScrollingUp ? '-25vmin' : '25vmin'),
                opacity: isFadingIn ? 1 : 0
            }
        ];

        let animOptions = {
            duration: 200,
            easing: isFadingIn ? 'ease-out' : 'ease-in',
            fill: 'forwards'
        }
        content.animate(animKeys, animOptions);
    }

    const scrollPage = (e) => {
        let currentActive = GetUrlParam('p') || 0;
        let currentNode = document.querySelector(`.rullerButton[value="${currentActive}"]`);
        let targetActive = e.target.getAttribute('value');
        currentNode.className = 'rullerButton';
        e.target.className = 'rullerButton active';

        ModifyUrl(targetActive, { name: 'p', value: targetActive });
        // Only update if new
        if (targetActive != data.page) {
            // o sa fiu || sunt
            let isScrollingUp = targetActive > data.page;
            ContentFade(isScrollingUp, false);
            setData({
                ...data,
                page: targetActive
            });
            ContentFade(isScrollingUp, true);
        }

        let ruller = document.querySelector('#ruller');
        let rullerStyle = ruller.getAttribute('style');
        let rullerHeight = rullerStyle.match(/-?\d+(\.\d+)?/g)[0];

        let animFT = [
            { top: `${rullerHeight}vmin` },
            { top: `${CalculateHeight(targetActive)}vmin` }
        ]
        let duration = Math.abs(targetActive - currentActive) * 200;
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
                backgroundImage: `url(/portofolio/public/storage/images/langIcons/${data.lang}.png)`,
                backgroundSize: 'cover'
            }}
            onMouseEnter={() => { document.querySelector('#language_preview').removeAttribute('style') }}
            onMouseLeave={() => {
                document.querySelector('#language_preview').setAttribute('style',
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
                                src={`/storage/images/langIcons/${x.lang + (x.lang == data.lang ? '' : '_OFF')}.png`}
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