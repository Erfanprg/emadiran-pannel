import { onMounted, onBeforeUnmount } from 'vue';

export function useClickOutside(elementRef: any, callback: () => void) {
    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (elementRef.value && !elementRef.value.contains(target)) {
            callback();
        }
    };

    onMounted(() => {
        document.addEventListener('click', handleClickOutside);
    });

    onBeforeUnmount(() => {
        document.removeEventListener('click', handleClickOutside);
    });
}

