import React from "react";
export default class utils {

    static ModifyUrl(senderId, param) {
        let search = window.location.search;
        let params = new URLSearchParams(search);
        params.set(param.name, param.value);

        history.replaceState({
            id: senderId,
            source: 'web'
        }, '', window.location.href.split('?').shift() + '?' + params);
    }

    static CalculateHeight(index, contentLength) {
        // calculate for #down
        //100 vh / number of steps - 5vh (selected space) / 2
        let pSize = (100 / contentLength - 5) / 2;
        let height = -100 + index * (2 * pSize + 5) + pSize;
        return height;
    }

    static GetUrlParam(name) {
        let search = window.location.search;
        let params = new URLSearchParams(search);

        return params.get(name);
    }

    static ContentFade(isScrollingUp, isFadingIn) {
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

    static ParseBreak(string, key, addOn = null) {
        return string.split('</br>').map((x, index) => {
            return [
                (addOn ? addOn : ''),
                ...this.ParseLinks(x),
                <br key={`BR_${key}_${index}`}></br>
            ];
        })
    }

    static ParseLinks(string) {
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

}