import { convertToTimestamp } from '~/func/GenerateDate';

export async function usePrepareFormData<T extends Record<string, any>>(dataModel: T) {
  const formData = new FormData();

  Object.keys(dataModel).forEach((field) => {
    const key = field as keyof T;
    let value = dataModel[key];

    if (key === 'birthDate' && value) {
      value = convertToTimestamp(value) as T[keyof T];
    }

    if (value === undefined || String(value).trim().length === 0) {
      return;
    }

    if (typeof value === 'object') {
      const isEmptyObject = Object.keys(value).length === 0;
      const isEmptyArray = Array.isArray(value) && value.length === 0;

      if (isEmptyObject || isEmptyArray) {
        return; 
      }

      formData.append(field, JSON.stringify(value));
    } else {
      formData.append(field, String(value));
    }
  });

  return formData;
}
