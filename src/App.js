import React, { useState } from "react";
import { getCookie, setCookie, timeUnits } from './cookieService.js';
import emailService from "./emailService.js";
import Consts from "./utils/Consts.js";
import utils from "./utils/utils.js";

// Move from frontend to backends
import nodemailer from 'nodemailer';

const pagesJson = require('./storage/pages.json');
// const emailService = require('./storage/scripts/emailService.js');
const envCorection = window.location.href.includes('github') ? '/portofolio/public' : '';
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

    let currentPageJson = require(`./storage//languagesPagination/page${utils.GetUrlParam('p') || props.page}.json`);
    let languageJson = require('./storage/languagesPagination/languages.json');

    const [data, setData] = useState({
        lang: utils.GetUrlParam('lang') || languageJson.default,
        page: utils.GetUrlParam('p') || props.page,
        dir: dir
    });

    const title = document.querySelector('title');
    title.innerText = GetLanguageValue(currentPageJson.title);

    const updateLanguage = (e) => {
        let targetLang = e.target.getAttribute('data-type');
        utils.ModifyUrl(data.page, { name: "lang", value: targetLang });
        if (targetLang != data.lang)
            setData({
                ...data,
                lang: targetLang
            });
        document.querySelector('#languagePreview p').innerText = languageJson.languages.find(x => x.lang == targetLang).translation[targetLang];
    }

    function GetLanguageValue(content) {
        if (content.hasOwnProperty(data.lang)) return content[data.lang];
        if (content.hasOwnProperty('default')) return content['default'];
        if (content.match(/PROPERTY_.+\|.+/g)) {
            let keywords = content.split('_').pop().split('|');
            let category = keywords.shift();
            let key = keywords.pop();

            let value = currentPageJson.contentProperties[category][key];
            return GetLanguageValue(value);
        }
        return content;
    }

    function ParseContent(currentContent) {
        if (currentContent.hasOwnProperty('@usable') && !currentContent['@usable']) {
            return;
        }
        switch (currentContent['@contentType']) {
            case 'Q&A':
                return (
                    currentContent.content.map((x, index) => {
                        return [
                            <h4 key={`Q${currentContent['@type']}${index}`}
                                data-type={currentContent['@type']}
                                className="question">
                                {GetLanguageValue(x.q)}
                            </h4>,
                            <h6 key={`A${currentContent['@type']}${index}`}
                                data-type={currentContent['@type']}
                                className="answer">
                                {utils.ParseBreak(GetLanguageValue(x.a), `${currentContent['@type']}${index}`, '→')}
                            </h6>
                        ]
                    })
                );
            case 'Table':
                return (
                    currentContent.content.map((x, index) => {
                        return [
                            <li className="header"
                                key={`liN${currentContent['@type']}${index}`}>
                                {GetLanguageValue(x.name)}
                            </li>,
                            <li className="body"
                                key={`liV${currentContent['@type']}${index}`}
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
                            [...currentContent.content].map((x, index) => {
                                return (<div
                                    className={`directoryHeader${index == data.dir.directory ? ' active' : ''}`}
                                    key={`directoryHeader${currentContent['@contentType']}${index}`}
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
                                    "backgroundImage": `url(${envCorection}/storage/images/logos/${currentContent.content[data.dir.directory].content[data.dir.listItem].logo})`,
                                    "filter": currentContent.content[data.dir.directory].content[data.dir.listItem].shadow
                                        ? `drop-shadow(0 0 .75rem ${currentContent.content[data.dir.directory].content[data.dir.listItem].logoShadow})` : ''
                                }}>

                            </div>
                            <div>
                                {
                                    [...currentContent.content[data.dir.directory].content].map((x, index) => {
                                        return (<div
                                            className={`directoryLine${index == data.dir.listItem ? ' active' : ''}`}
                                            key={`directoryLine${currentContent['@contentType']}${index}`}
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
                                            <span key={`directoryLineSpan${currentContent['@contentType']}${index}`}>
                                                {utils.ParseBreak(GetLanguageValue(x.header))}
                                            </span>
                                            <p key={`directoryLineP${currentContent['@contentType']}${index}`}
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
                            {ParseContent(currentContent.content[data.dir.directory].content[data.dir.listItem].details)}
                            <hr></hr>
                            {ParseContent(currentContent.content[data.dir.directory].content[data.dir.listItem].info)}
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
                                [...currentContent.content.files.map((x, index) => {
                                    return (<li
                                        className={`FileLine${index == (+getCookie('file', true) || 0) ? ' active' : ''}`}
                                        key={`FileLine${currentContent['@contentType']}${index}`}
                                        onClick={(e) => {
                                            let target = e.target.className.includes('Icon') ?
                                                e.target.parentElement : e.target;
                                            if (target.className.includes('active')) return;
                                            let current = document.querySelector('.FileLine.active');
                                            current.className = 'FileLine';
                                            target.className = 'FileLine active';
                                            document.querySelector('#FilePreview iframe').setAttribute('src', `${envCorection}/storage/files/${currentContent.content.files[index].name}`)
                                            setCookie('file', index, 1, timeUnits.days);
                                        }}>
                                        <div
                                            className="FileIcon"
                                            style={{
                                                backgroundImage: `url(${envCorection}/storage/images/filesLogos/${x.name.split('.')[1]}.png)`
                                            }}
                                            key={`FileIcon${currentContent['@contentType']}${index}`}></div>
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
                                    {`${envCorection}/storage/files/${currentContent.content.files[+getCookie('file', true) || 0].name}`}
                                    width="100%"
                                    height="100%">
                                </iframe>
                            }
                        </div>
                    </div >,
                    <div
                        id="FilePreviewNotice"
                        key="FilePreviewNotice">
                        {GetLanguageValue(currentContent.content.notice)}
                    </div>
                ];
            case 'EmailSender':
                return (
                    <div
                        action={window.location.href}
                        id="EmailSender"
                        key="EmailSender">
                        {utils.ParseBreak(GetLanguageValue(currentContent.content.header))}
                        <hr />
                        <div className="emailRow">
                            {utils.ParseBreak(GetLanguageValue(currentContent.content.email))}
                            <span className="errorRow">
                            </span>
                            <input required
                                type="text"
                                placeholder={GetLanguageValue(currentContent.placeholders.email)}
                                pattern={Consts.emailValidationRegex.email}
                                title={GetLanguageValue(currentContent.validationErrors.email)}>
                            </input>
                        </div>
                        <div className="emailRow">
                            {utils.ParseBreak(GetLanguageValue(currentContent.content.subject))}
                            <span className="errorRow">
                            </span>
                            <input
                                type="text"
                                placeholder={GetLanguageValue(currentContent.placeholders.subject)}
                                pattern={Consts.emailValidationRegex.subject}
                                title={GetLanguageValue(currentContent.validationErrors.subject)}>
                            </input>
                        </div>
                        <div className="emailRow">
                            {utils.ParseBreak(GetLanguageValue(currentContent.content.body))}
                            <span className="errorRow">
                            </span>
                            <textarea required
                                placeholder={GetLanguageValue(currentContent.placeholders.body)}
                                pattern={Consts.emailValidationRegex.body}
                                title={GetLanguageValue(currentContent.validationErrors.body)}>
                            </textarea>
                        </div>
                        <hr />
                        <input type="submit"
                            onClick={emailService.submitForm}
                            value={GetLanguageValue(currentContent.content.submit)}
                        ></input>
                    </div>
                );
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
                        {utils.ParseBreak(GetLanguageValue(currentPageJson.content.find(x => x['@type'] == titleKey)), titleKey)}
                    </h1>,
                    ParseContent(currentPageJson.content.find(x => x['@type'] == contentKey)),
                    <img data-type="left"
                        className="imageFrame"
                        key="imageFrameL"></img>,
                    <img data-type="center"
                        className="imageFrame"
                        key="imageFrameC"></img>,
                    <img data-type="right"
                        className="imageFrame"
                        key="imageFrameR"></img>
                ];
            case 1:
                let bioKey = 'bioTable';
                return (
                    <ul id={bioKey}
                        key={bioKey}
                        data-type="table">
                        {ParseContent(currentPageJson.content.find(x => x['@type'] == bioKey))}
                    </ul>
                );
            case 2:
                return ParseContent(currentPageJson.content.find(x => x['@type'] == 'eduList'));
            case 3:
                return ParseContent(currentPageJson.content.find(x => x['@type'] == 'CVpreview'));
            case 4:
                let data = [...currentPageJson.content.find(x => x['@type'] == 'socialMedia').content.map((smEntry, smIndex) => {
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
                                // Add scroll option in JSON for gmail to next page
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
                                    backgroundImage: `url(${envCorection}/storage/images/social/${smEntry['@type']}${smEntry.imageType})`,
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
            case 5:
                return ParseContent(currentPageJson.content.find(x => x['@type'] == 'Contact'));
            default:
                console.log(data);
                return (
                    `This was made from Scratch! Hi there world!
                    page: ${data?.page || utils.GetUrlParam('p')}
                    language: ${data?.lang || utils.GetUrlParam('lang') || languageJson.default}`
                );
        }
    }

    const scrollPage = (e) => {
        let currentActive = utils.GetUrlParam('p') || 0;
        let currentNode = document.querySelector(`.rullerButton[value="${currentActive}"]`);
        let targetActive = e.target.getAttribute('value');
        currentNode.className = 'rullerButton';
        e.target.className = 'rullerButton active';

        utils.ModifyUrl(targetActive, { name: 'p', value: targetActive });
        // Only update if new
        if (targetActive != data.page) {
            // o sa fiu || sunt
            let isScrollingUp = targetActive > data.page;
            utils.ContentFade(isScrollingUp, false);
            setData({
                ...data,
                page: targetActive
            });
            utils.ContentFade(isScrollingUp, true);
        }

        let ruller = document.querySelector('#ruller');
        let rullerStyle = ruller.getAttribute('style');
        let rullerHeight = rullerStyle.match(/-?\d+(\.\d+)?/g)[0];

        let animFT = [
            { top: `${rullerHeight}vh` },
            { top: `${utils.CalculateHeight(targetActive, pagesJson.content.length)}vh` }
        ]
        let duration = Math.abs(targetActive - currentActive) * 200;
        let animProps = {
            duration: duration,
            easing: 'ease-in-out',
            fill: 'forwards'
        }
        ruller.animate(animFT, animProps);
        ruller.setAttribute('style', rullerStyle.replace(rullerHeight, utils.CalculateHeight(targetActive, pagesJson.content.length)));

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
            let cookieJson = require('./storage/cookieContent.json');
            return (
                <div id="cookiesPopUpBg"
                    key="cookiesPopUpBg">
                    <div id="cookiesPopUpMessage"
                        key="cookiessPopUpMessage">
                        {utils.ParseBreak(cookieJson.content.find(x => x['@type'] == 'cookiesText')[data.lang])}
                        <button id="cookiesAllow"
                            key="cookiesAllow"
                            onClick={() => {
                                setCookie('c', 'true', 30, timeUnits.days);
                                let self = document.querySelector('#cookiePopUp');
                                self.className = 'fade';
                                setTimeout(() => { self.remove() }, 250);
                            }}>
                            {cookieJson.content.find(x => x['@type'] == 'cookiesAllow')[data.lang]}
                        </button>
                    </div>
                </div>
            )
        }
    }

    return [
        <div id="languageChanger"
            key="languageChanger"
            // This only returns true at the very start, before React creating the element
            style={{
                backgroundImage: `url(${envCorection}/storage/images/langIcons/${data.lang}.png)`,
                backgroundSize: 'cover'
            }}
            onMouseEnter={() => { document.querySelector('#languageChanger').removeAttribute('style') }}
            onMouseLeave={() => {
                document.querySelector('#languageChanger').setAttribute('style',
                    `background-image: url(${envCorection}/storage/images/langIcons/${data.lang}.png);
                    background-size:cover;`);

                // Fade out for languagePreview
                let animKeys = [
                    { opacity: 1 },
                    { opacity: 0 }
                ]
                let animProps = {
                    duration: 700,
                    easing: 'ease-in',
                    fill: 'forwards'
                }

                let langPreview = document.querySelector('#languagePreview');
                langPreview.animate(animKeys, animProps);

                setTimeout(() => {
                    langPreview.parentElement.removeChild(langPreview);
                }, 700);
            }}
        >
            {
                languageJson.languages.filter(x => x['@usable'])
                    .map((x, index) => {
                        return (
                            <img onClick={updateLanguage}
                                onMouseEnter={(e) => {
                                    let previewer = document.querySelector('#languagePreview') || document.createElement('div');
                                    previewer.id = 'languagePreview';
                                    let previewedLanguage = e.target.getAttribute('data-type');
                                    let dataSet = languageJson.languages.find(x => x.lang == previewedLanguage);

                                    let styleData = `background-image: url(${envCorection}/storage/images/langIcons/${previewedLanguage}.png);`

                                    let langText = `${dataSet.translation[previewedLanguage]} - ${dataSet.translation[data.lang]}`;
                                    let langTextNode = document.createElement('p');
                                    langTextNode.innerText = langText;
                                    langTextNode.style = `color: ${dataSet.color}; position:absolute; left:25%; width:50%;`;

                                    previewer.innerHTML = '';
                                    if (dataSet?.uniqueCover) {
                                        let cover = document.createElement('div');
                                        cover.setAttribute('style', `background-image: url(${envCorection}/storage/images/langFlags/${previewedLanguage}.png);border-image: url(${envCorection}/storage/images/langFlags/${previewedLanguage}.png) 1 stretch;`)
                                        cover.appendChild(langTextNode);
                                        previewer.appendChild(cover);
                                    } else {
                                        styleData = `${styleData}background-size: ${dataSet.fillMode};background-color: ${dataSet.bgColor};`;
                                        previewer.appendChild(langTextNode);
                                    }
                                    previewer.setAttribute('style', styleData);
                                    document.body.appendChild(previewer);
                                }}
                                data-type={x.lang}
                                key={'language_option' + index}
                                className="language_option"
                                src={`${envCorection}/storage/images/langIcons/${x.lang + (x.lang == data.lang ? '' : '_OFF')}.png`}
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
                    top: `${utils.CalculateHeight(utils.GetUrlParam('p'), pagesJson.content.length)}vh`
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