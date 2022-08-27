export const timeUnits = {
    days: 24 * 60 * 60 * 1000,
    hours: 60 * 60 * 1000,
    minutes: 60 * 1000,
    seconds: 1000,
    miliseconds: 1
}

export function setCookie(cName, cContent, cTime, timeUnit) {
    const date = new Date();
    date.setTime(date.getTime() + (cTime * timeUnit));
    let expires = `expires=${date.toUTCString()}`;
    document.cookie = `${cName}=${cContent};${expires};path=/`;
}

export function removeCookie(cName) {
    document.cookie = `${cName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function getCookie(cName, onlyValue) {
    let decodedCookie = decodeURIComponent(document.cookie);
    let cArray = decodedCookie.split(';');

    // Remove spaces around cookies
    cArray = cArray.map((c) => c.trim());

    let regexp = new RegExp(`${cName}\=`, 'g');
    let cookie = cArray.find((c) => c.match(regexp))

    return cookie ? (onlyValue ? cookie.split('=').pop() : cookie) : "";
}