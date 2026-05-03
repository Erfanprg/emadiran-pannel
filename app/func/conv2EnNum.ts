export const conv2EnNum = (value: string): string => {
    if (!value) return '';

    const persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
    const arabicNumbers = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];

    let newValue = value;
    persianNumbers.forEach((num, index) => {
        newValue = newValue.replace(num, index.toString());
    });
    arabicNumbers.forEach((num, index) => {
        newValue = newValue.replace(num, index.toString());
    });

    return newValue;
};
