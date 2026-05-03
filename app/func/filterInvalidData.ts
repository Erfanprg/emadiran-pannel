export function filterInvalidData<T extends object | FormData>(data: T): T {
    if (data instanceof FormData) {
        const filteredEntries = Array.from(data.entries()).filter(([_, value]) => {
            if ((value as any) instanceof File || (value as any) instanceof Blob) return true;
            if (value == null || value === '' || Number.isNaN(value)) return false;
            if (Array.isArray(value) && value.length === 0) return false;
            if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return false;
            return true;
        });

        const filteredFormData = new FormData();
        filteredEntries.forEach(([key, value]) => {
            filteredFormData.append(key, value);
        });

        return filteredFormData as T;
    } else {
        const obj = Object.fromEntries(
            Object.entries(data).filter(([_, value]) => {
                if (value == null || value === '' || Number.isNaN(value)) return false;
                if (Array.isArray(value) && value.length === 0) return false;
                if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return false;
                return true;
            })
        );
        return obj as T;
    }
}
