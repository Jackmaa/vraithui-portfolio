import { ref, onMounted, onBeforeUnmount } from 'vue';

const KONAMI_SEQUENCE = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'b', 'a',
];

const STORAGE_KEY = 'vraithui-konami-unlocked';

export function useKonami(onUnlock) {
  const isUnlocked = ref(localStorage.getItem(STORAGE_KEY) === 'true');
  let currentIndex = 0;

  function handleKeydown(e) {
    if (isUnlocked.value) return;

    const expected = KONAMI_SEQUENCE[currentIndex];
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

    if (key === expected || (expected.length === 1 && key === expected.toLowerCase())) {
      currentIndex++;

      if (currentIndex === KONAMI_SEQUENCE.length) {
        isUnlocked.value = true;
        localStorage.setItem(STORAGE_KEY, 'true');
        currentIndex = 0;
        if (onUnlock) onUnlock();
      }
    } else {
      // Check if the failing key is the start of the sequence
      const firstKey = KONAMI_SEQUENCE[0];
      currentIndex = (key === firstKey) ? 1 : 0;
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown);
  });

  return { isUnlocked };
}
