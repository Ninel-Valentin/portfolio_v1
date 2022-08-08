'use strict';
import stepsJson from '../data/mainSteps.json' assert {type: 'json'}

const e = React.createElement;
var canScroll = true;


class ScrollBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: 0
        }
    }
    render() {

        window.addEventListener('load', (e) => {
            let url = window.location.href.split('?page=')
            let page = url.length > 1 ? url.pop() : 0;

            // Move ruller
            document.querySelector('#ruller').setAttribute('style',
                `top: ${CalculateHeight(page)}vh`);
            // Set text colors
            document.querySelectorAll('.rullerButton').forEach(x => x.className = 'rullerButton');
            document.querySelector(`.rullerButton[value="${page}"]`).classList.add('active');
            this.setState({ active: page });
        });

        function ModifyUrl(myUrl, senderId) {
            if (myUrl.includes('?')) {
                myUrl = `${myUrl.split('?').shift()}?page=${senderId}`;
            } else {
                myUrl += `?page=${senderId}`;
            }

            history.replaceState({
                id: senderId,
                source: 'web'
            }, '', myUrl);
        }

        function CalculateHeight(index) {
            // calculate for #down
            let pSize = (100 / stepsJson.content.length - 5) / 2;
            let height = -100 + index * (2 * pSize + 5) + pSize + 5;
            return height;
        }

        return [e(
            'div',
            {
                id: 'ruller',
                key: 'ruller',
                style: {
                    top: `${CalculateHeight(this.state.active)}vh`
                }
            },
            [
                e('div', {
                    id: 'up',
                    key: 'up'
                }),
                e('div', {
                    id: 'down',
                    key: 'down'
                })
            ]
        ), e(
            'div', { id: 'buttons', key: 'buttons' },
            [
                ...stepsJson.content.map(x => e(
                    'div',
                    {
                        className: `rullerButton${this.state.active == x.id ? ' active' : ''}`,
                        key: `rullerButton${x.id}`,
                        value: x.id,
                        onClick: (e) => {
                            let currentActive = this.state.active;
                            let currentNode = document.querySelector(`div[value="${currentActive}"]`);
                            currentNode.className = 'rullerButton';
                            e.target.className = 'rullerButton active';
                            let targetActive = e.target.getAttribute('value');

                            //Change URL
                            ModifyUrl(window.location.href, +targetActive)

                            let ruller = document.querySelector('#ruller');
                            let rullerStyle = ruller.getAttribute('style');
                            let rullerHeight = rullerStyle.match(/-?\d+(\.\d+)?/g)[0];

                            let animFT = [
                                { top: `${rullerHeight}vh` },
                                { top: `${CalculateHeight(targetActive)}vh` }
                            ]
                            let duration = Math.abs(targetActive - currentActive) * 100;
                            let animProps = {
                                duration: duration,
                                easing: 'ease-in-out',
                                fill: 'forwards'
                            }
                            ruller.animate(animFT, animProps);
                            ruller.setAttribute('style', rullerStyle.replace(rullerHeight, CalculateHeight(targetActive)));

                            this.state.active = targetActive;
                            setTimeout(() => {
                                canScroll = true;
                            }, duration);
                        }
                    },
                    // Modify based on type to text or image, !text => id
                    x.id
                ))
            ]
        )]
    }
}

function scroll(event) {
    // MIGHT BE DISABLED
    if (canScroll) {
        let active = document.querySelector('.active').getAttribute('value');
        if (event.deltaY) {
            // Scroll Up / Down
            let next = +active + (event.deltaY / Math.abs(event.deltaY));
            // If the move is impossible, do nothing
            if (next >= stepsJson.content.length || next < 0) return;
            let nextNode = document.querySelector(`[value="${next}"]`);
            nextNode.click();
        }
    }
    canScroll = false;
}

document.onwheel = scroll;

const domContainer = document.querySelector('#scroll[data-type="container"]');
const root = ReactDOM.createRoot(domContainer);
root.render(e(ScrollBar));