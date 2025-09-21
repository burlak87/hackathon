// plugins/pinia-persistedstate.client.ts
import { createPinia } from 'pinia' // Импорт базового Pinia
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate' // Плагин для сохранения
export default defineNuxtPlugin(nuxtApp => {
	// Создаём экземпляр Pinia (переопределяем дефолтный от @pinia/nuxt)
	const pinia = createPinia()

	// Подключаем плагин persistedstate к Pinia
	pinia.use(piniaPluginPersistedstate)

	// Применяем этот Pinia к Vue-приложению Nuxt
	nuxtApp.vueApp.use(pinia)
})
