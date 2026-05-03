interface dataLimit {
    sentens: string;
    count: number;
}

export const letterLimit = ({ sentens, count }: dataLimit) => {
    if (sentens.length > count) {
        return sentens.slice(0, count) + '...';
    } else {
        return sentens;
    }
};