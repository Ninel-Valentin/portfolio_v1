export function setCookie(cName, cContent, cTime) {
    const date = new Date();
    date.setTime(date.getTime() + (cTime * 24 * 60 * 60 * 1000));
    let expires = `expires=${date.toUTCString()}`;
    document.cookie = `${cName}=${cContent};${expires};path=/`;
}

export function getCookie(cName) {
    let decodedCookie = decodeURIComponent(document.cookie);
    let cArray = decodedCookie.split(';');

    // Remove spaces around cookies
    cArray = cArray.map((c) => c.trim());

    let regexp = new RegExp(`/${cName}\=/g`);
    let cookie = cArray.find((c) => c.match(regexp))

    return cookie ? cookie : "";
}