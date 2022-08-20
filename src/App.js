import React, { useState } from "react";

const languageJson = require('./storage/data/languages.json');

const App = (props) => {
    const [lang, setLanguage] = useState(languageJson.default);

    const updateLanguage = (e) => {
        setLanguage(e.target.getAttribute('data-type'));
    }

    const { page } = props;

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
                                className="question">{x.q[lang]}</h4>,
                            <h6 key={`A${content['@type']}${index}`}
                                className="answer">{
                                    ParseBreak(x.a[lang], `${content['@type']}${index}`, '→')
                                }</h6>
                        ]
                    })
                )
            default:
                break;
        }
    }

    function CreateContent() {
        switch (page) {
            case 0:
                let titleKey = 'mainTitle',
                    contentKey = 'mainContent';
                return [
                    <h1 key={titleKey}
                        id={titleKey}>
                        {ParseBreak(languageJson.content.find(x => x['@type'] == titleKey)[lang], titleKey)}
                    </h1>,
                    ContentParser(languageJson.content.find(x => x['@type'] == contentKey))
                ]
            default:
                return (
                    `This was made from Scratch! Hi there world!
                    page: {page}
                    language: {lang}`
                )
        }
    }

    return [
        <div id="language_preview"
            key="languageChanger"
            // This only returns true at the very start, before React creating the element
            style={document.querySelector('#language_preview') ? null : {
                backgroundImage: `url(/portofolio/public/storage/images/langIcons/${lang}.png)`,
                backgroundSize: 'cover'
            }}
            onMouseEnter={() => { document.querySelector('#language_preview').removeAttribute('style') }}
            onMouseLeave={() => { document.querySelector('#language_preview').setAttribute('style', `background-image: url(/portofolio/public/storage/images/langIcons/${lang}.png); background-size:cover;`) }}
        >
            {
                languageJson.languages.filter(x => x['@usable'])
                    .map((x, index) => {
                        return (
                            <img onClick={updateLanguage}
                                data-type={x.lang}
                                key={'language_option' + index}
                                className="language_option"
                                src={`/portofolio/public/storage/images/langIcons/${x.lang + (x.lang == lang ? '' : '_OFF')}.png`}
                            >
                            </img>
                        )
                    })
            }
        </div >,
        <div></div>,
        <div id="content" key="content">
            {CreateContent()}
        </div>
    ]
}

export default App;