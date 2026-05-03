export function capitalizeFirstLetter(word:string | object ) {
    const sentens  = String(word)
    if (!sentens) return sentens; 
    return sentens.charAt(0).toUpperCase() + sentens.slice(1);
}
