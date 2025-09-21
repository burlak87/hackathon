  // stores/user.ts (обновлённый)
  import { defineStore } from 'pinia';
  import { ref } from 'vue';
  export const useUser Store = defineStore('user', () => {
    const name = ref('Anonymous');
    const age = ref(0);
    function setName(newName: string) {
      name.value = newName;
    }
    return { name, age, setName };
  }, {
    // Опции стора: здесь подключаем persistedstate
    persist: true  // Автоматически сохраняет ВСЁ состояние в localStorage (ключ: 'user-persistedState')
  });