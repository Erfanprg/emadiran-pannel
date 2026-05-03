import type { ErrMessages } from '~/types/global';

interface UpdateErrors {
    dataError: Record<string, string>;
    errorList: ErrMessages[]
}
export function useUpdateErrors({ dataError, errorList }: UpdateErrors) : any {
    const newErrors = { ...dataError };

    Object.keys(newErrors).forEach((key: string) => {
        newErrors[key] = '';
    });

    errorList.forEach((err) => {
        if (Object.prototype.hasOwnProperty.call(newErrors, err.field)) {
            newErrors[err.field] = err.message;
        }
    });

    return newErrors;
}

export function useClearErrors(dataError: Record<string, string>) : any {
    Object.keys(dataError).forEach((key: string) => {
        dataError[key] = '';
    });
    return dataError
}