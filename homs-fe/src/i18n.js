  import { createI18n } from 'vue-i18n'
  
  const savedLocale = localStorage.getItem('selectedLang') || 'ko'

  function loadLocaleMessages() {
    const messages = {}


    const modules = import.meta.glob('./locales/*.json', { eager: true })

    for (const path in modules) {
      const matched = path.match(/([A-Za-z0-9-_]+)\.json$/i)
      if (matched && matched[1]) {
        const locale = matched[1]
        messages[locale] = modules[path].default
      }
    }

    return messages
  }

  export default createI18n({
    legacy: false,
    locale: savedLocale, // ✅ localStorage 반영
    fallbackLocale: 'en',
    messages: loadLocaleMessages()
  })
