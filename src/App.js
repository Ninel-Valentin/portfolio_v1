import React, { useState } from "react";

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

const App = (props) => {

    const [lang, setLanguage] = useState(GetUrlParam('lang') || languageJson.default);
    const [page, setPage] = useState(GetUrlParam('p') || props.page);
    console.log(lang)

    const title = document.querySelector('title');
    title.innerText = languageJson.titles.find(x => x['@type'] == title.getAttribute('data-type'))[lang];

    const updateLanguage = (e) => {
        let targetLang = e.target.getAttribute('data-type');
        ModifyUrl(page, { name: "lang", value: targetLang });
        if (targetLang != lang) setLanguage(targetLang);
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
                (addOn ? addOn : '') + x,
                <br key={`BR_${key}_${index}`}></br>
            ];
        })
    }

    function ContentParser(content) {
        switch (content['@contentType']) {
            case 'Q&A':
                return (
                    content.content.map((x, index) => {
                        return [
                            <h4 key={`Q${content['@type']}${index}`}
                                data-page={page}
                                className="question">
                                {x.q[lang]}
                            </h4>,
                            <h6 key={`A${content['@type']}${index}`}
                                data-page={page}
                                className="answer">
                                {ParseBreak(x.a[lang], `${content['@type']}${index}`, '→')}
                            </h6>
                        ]
                    })
                )
            default:
                break;
        }
    }

    function CreateContent() {
        switch (+page) {
            case 0:
                let titleKey = 'mainTitle',
                    contentKey = 'mainContent';
                return [
                    <h1 key={titleKey}
                        id={titleKey}>
                        {ParseBreak(languageJson.content.find(x => x['@type'] == titleKey)[lang], titleKey)}
                    </h1>,
                    ContentParser(languageJson.content.find(x => x['@type'] == contentKey)),
                    <img id="imageFrame"
                        key="imageFrame"></img>
                ]
            default:
                return (
                    `This was made from Scratch! Hi there world!
                    page: {page}
                    language: {lang}`
                )
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
        if (targetActive != page) setPage(targetActive);

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

    return [
        <div id="language_preview"
            key="languageChanger"
            // This only returns true at the very start, before React creating the element
            style={{
                backgroundImage: `url(/portofolio/public/storage/images/langIcons/${lang}.png)`, //deploy
                // backgroundImage: `url(/storage/images/langIcons/${lang}.png)`, //dev
                backgroundSize: 'cover'
            }}
            onMouseEnter={() => { document.querySelector('#language_preview').removeAttribute('style') }}
            onMouseLeave={() => {
                document.querySelector('#language_preview').setAttribute('style',
                    // `background-image: url(/portofolio/public/storage/images/langIcons/${lang}.png);
                    `background-image: url(/storage/images/langIcons/${lang}.png);
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
                                src={`/portofolio/public/storage/images/langIcons/${x.lang + (x.lang == lang ? '' : '_OFF')}.png`} //deploy
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
        <div id="scroll"
            key="scroll">
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
        </div>
    ]
}

export default App;