interface typeNumberFormat {
    number: any,
    decimals?: any,
}


export function number_format({ number, decimals }: typeNumberFormat) {
    let n = number
    let prec = decimals;
    n = !isFinite(+n) ? 0 : +n;
    prec = !isFinite(+prec) ? 0 : Math.abs(prec);
    const sep = ',';
    const dec = '.';
    let s = (prec > 0) ? n.toFixed(prec) : Math.round(n).toFixed(prec);
    const abs: any = Math.abs(n).toFixed(prec);
    let _, i: any;
    if (abs >= 1000) {
        _ = abs.split(/\D/);
        i = _[0].length % 3 || 3;
        _[0] = s.slice(0, i + (n < 0)) + _[0].slice(i).replace(/(\d{3})/g, sep + '$1');
        s = _[0]
    }
    return s;
}

export function numberCheck(event: any) {
    let key;

    if (window.event) {
        key = event.keyCode;
    } else {
        key = event.charCode;
    }

    if (event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 46
        || event.keyCode == 37 || event.keyCode == 38 || event.keyCode == 39
        || event.keyCode == 40 || event.keyCode == 35 || event.keyCode == 36
        || event.keyCode == 13) return true;

    if (key == 13) return true;
    if (key > 57) return false;
    if ((key < 48) && (key != 45)) return false;

    return true;
}

function str2num(str: any) {
    return String(str).replace(/[^0-9]/g, '');
}

export function money_format(elem: any) {
    return number_format({ number: str2num(elem.value) });
}

export function conv2EnNum(str: any) {
    if (str) {
        const removeCommos = str.replaceAll(',', '')
        return parseFloat(removeCommos
            .replace(/[۰۱۲۳۴۵۶۷۸۹]/g, function (d: any) { return d.charCodeAt(0) - 1776; }) // Convert Persian numbers
        ) * 1;
    }

}