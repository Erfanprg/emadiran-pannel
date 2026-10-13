import moment from 'jalali-moment';
import type { Moment, MomentFormatSpecification } from 'jalali-moment';
import { conv2EnNum } from './conv2EnNum';
import { translate } from '../i18n/translate'

export interface TypeDate {
    timestamp: number | string;
    type: string;
}

export const GenerateDate = ({ timestamp, type }: TypeDate) => {
    if (type == 'numberDate') {
        return ConvertTimestampToDate(timestamp);
    } else if (type == 'lastDate') {
        return ConvertTimestampToLastDate(timestamp);
    } else if (type == 'timeDate') {
        return ConvertTimestampToTime(timestamp);
    }
};

export const ConvertTimestampToDate = (timestamp: any) => {
    const date: MomentFormatSpecification = moment((new Date(timestamp * 1000))).format('jYYYY/jM/jD');
    return date;
};

export const ConvertTimestampToTime = (timestamp: any) => {
    const date: MomentFormatSpecification = moment((new Date(timestamp * 1000))).format(' HH:MM | jYYYY/jM/jD');
    return date;
};


const ConvertTimestampToLastDate = (timestamp: any) => {
    moment.locale('fa');

    const date: Moment = moment((new Date(timestamp * 1000)));
    const nowDate = moment();

    const durationDate = nowDate.diff(date);
    // miliSeconds
    const convert2SecDate = durationDate / 1000;
    // Seconds
    const durationMinDate = convert2SecDate / 60;
    // Min
    const durationHourDate = convert2SecDate / 3600;
    // Hour 
    const durationdayDate = convert2SecDate / (3600 * 24);
    // day
    const durationMounthDate = convert2SecDate / (3600 * 24 * 30);
    // mounth
    const durationYearDate = convert2SecDate / (3600 * 24 * 30 * 12);

    if (convert2SecDate < 60) {
        return translate('common.relativeTime.justNow');
    } else if (durationMinDate < 60) {
        return translate('common.relativeTime.minutes', { durationMinDate: Math.floor(durationMinDate) });
    } else if (durationHourDate < 24) {
        return translate('common.relativeTime.hours', { durationHourDate: Math.floor(durationHourDate) });
    } else if (durationdayDate < 7) {
        return translate('common.relativeTime.days', { durationdayDate: Math.floor(durationdayDate) });
    } else if (Math.floor(durationdayDate) == 7) {
        return translate('common.relativeTime.oneWeek');
    } else if (Math.floor(durationdayDate) > 7 && Math.floor(durationdayDate) < 14) {
        return translate('common.relativeTime.days', { durationdayDate: Math.floor(durationdayDate) });
    } else if (Math.floor(durationdayDate) == 14) {
        return translate('common.relativeTime.twoWeeks');
    } else if (Math.floor(durationdayDate) > 14 && Math.floor(durationdayDate) < 21) {
        return translate('common.relativeTime.days', { durationdayDate: Math.floor(durationdayDate) });
    } else if (Math.floor(durationdayDate) == 21) {
        return translate('common.relativeTime.threeWeeks');
    } else if (Math.floor(durationdayDate) > 21 && Math.floor(durationdayDate) < 31) {
        return translate('common.relativeTime.days', { durationdayDate: Math.floor(durationdayDate) });
    } else if (Math.floor(durationdayDate) > 30 && Math.floor(durationdayDate) < 365) {
        return translate('common.relativeTime.months', { durationMounthDate: Math.floor(durationMounthDate) });
    } else if (Math.floor(durationdayDate) > 365) {
        return translate('common.relativeTime.years', { durationYearDate: Math.floor(durationYearDate) });
    }
};


export function convertToTimestamp(date: any) {
    const dateMiladi = moment.from(date, 'fa', 'YYYY/MM/DD').format('YYYY/MM/DD');
    return moment(dateMiladi).unix();
}

export function isValidJalaliDate(date: string): boolean {
    const normalizedDate = conv2EnNum((date || '').trim());
    if (!normalizedDate) return false;

    const jalaliParsed = moment(normalizedDate, 'jYYYY/jMM/jDD', true);
    if (jalaliParsed.isValid()) {
        return true;
    }

    const gregorianParsed = moment(normalizedDate, 'YYYY-MM-DD', true);
    return gregorianParsed.isValid();
}

export function convertJalaliDateToIso(date: string): string | null {
    const normalizedDate = conv2EnNum((date || '').trim());
    if (!normalizedDate) return null;

    const jalaliParsed = moment(normalizedDate, 'jYYYY/jMM/jDD', true);
    if (jalaliParsed.isValid()) {
        const gregorianDate = jalaliParsed.format('YYYY-MM-DD');
        return moment.utc(gregorianDate).startOf('day').toISOString();
    }

    const gregorianParsed = moment(normalizedDate, 'YYYY-MM-DD', true);
    if (gregorianParsed.isValid()) {
        return moment.utc(normalizedDate).startOf('day').toISOString();
    }

    return null;
}
