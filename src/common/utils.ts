import {useEffect} from "react";
import moment from "moment-timezone";
import {TIME_ZONE} from "../constants";

export function timeSince (date: number) {

    const seconds = Math.floor((Date.now() - date) / 1000);

    let interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}

export function setTitle (title: string) {
    if (document) {
        document.title = `${title} | Dev Tools`;
    }
}

export const useSetTitle = (title: string) => {
    useEffect(() => {
        setTitle(title);
    }, [])
}

export function setFavicon (url: string) {
    if (!document) {
        return;
    }
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (!link) {
        const newLink = document.createElement('link') as HTMLLinkElement;
        newLink.type = 'image/x-icon';
        newLink.rel = 'shortcut icon';
        newLink.href = url;
        document.getElementsByTagName('head')[0].appendChild(newLink);
    } else {
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = url;
    }
}

export const useSetFavicon = (url: string) => {
    useEffect(() => {
        setFavicon(url);
    }, [])
}


export function onlyUnique <R> (value: R, index: number, self: R[]): boolean {
    return self.indexOf(value) === index;
}

export function toFixed (n: number): string {
    return n % 1 > 0 ? n.toFixed(2) : n.toFixed(0);
}

export type MetricUnit = 'seconds'|'milliseconds'|'bytes'|'count'|'percent';

export const convertNumberToUnit = (n: number, yType: MetricUnit = 'count'): string => {
    switch (yType) {
        case 'seconds':
            if (n >= 60) {
                return `${toFixed(n/60)}m`;
            } else {
                return `${toFixed(n)}s`;
            }
        case 'milliseconds':
            if (n >= 60000) {
                return `${toFixed(n/60000)}m`;
            } else if (n >= 1000) {
                return `${toFixed(n/1000)}s`;
            } else {
                return `${n}ms`;
            }
        case 'bytes':
            if (n > 1e9) {
                return `${toFixed(n/1e9)}gb`;
            } else if (n > 1e6) {
                return `${toFixed(n/1e6)}mb`;
            } else if (n > 1e3) {
                return `${toFixed(n/1e3)}kb`;
            } else {
                return `${n}b`;
            }
        case 'percent':
            return `${toFixed(n*100)}%`;
        default:
        case 'count':
            if (n > 1e9) {
                return `${toFixed(n/1e9)}g`;
            } else if (n > 1e6) {
                return `${toFixed(n/1e6)}m`;
            } else if (n > 1e3) {
                return `${toFixed(n/1e3)}k`;
            } else {
                return `${n}`;
            }
    }
}

export function movingAvg(array: number[], slidingWindow: number): number[] {
    const eachSideWindow = Math.floor(slidingWindow / 2);
    const result = [];
    for (let i = 0; i < array.length; i++) {
        const startIndex = i - eachSideWindow < 0 ? 0 : i - eachSideWindow;
        const endIndex = i + eachSideWindow > array.length ? array.length : i + eachSideWindow + 1;
        const slicedArray = array.slice(startIndex, endIndex)
        const movingAvg = slicedArray.reduce((accumulator, currentValue) => accumulator + currentValue);
        result.push(movingAvg / slicedArray.length)
    }
    return result
}

export function displayTimestamp(timestamp: string) {
    return moment(timestamp).tz(TIME_ZONE).format("YYYY-MM-DD h:mm:ss a")
}

export function percentIncrease(toValue: number, fromValue: number) {
    const factorIncrease = toValue == 0 ? 0 : fromValue == 0 ? toValue : (toValue - fromValue) / fromValue
    return factorIncrease * 100
}

export function fillMissingValues(valuesArray: number[], timeStampArray: number[], start: number,
                                  step: number) {
    const resultValues = []
    let count: number
    count = parseInt(String(start / 1000))
    let resultIndex = 0
    for (let timeStampIndex = 0; timeStampIndex < timeStampArray.length;) {
        if (timeStampArray[timeStampIndex] == count) {
            resultValues[resultIndex++] = valuesArray[timeStampIndex++]
            count = count + step
        } else {
            resultValues[resultIndex++] = 0
            count = count + step
        }
    }
    return resultValues
}

export function getLayoutWidth (padding: number): number {
    return window.innerWidth - padding;
}
