import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  ja: {
    translation: {
      title: '🎃 Halloween Mini Apps',
      subtitle: 'React + FastAPI（ローカル環境で即動作）',
      sections: {
        trick: 'Trick or Treat API',
        story: 'Halloween Story API',
        history: '最近の履歴',
      },
      placeholders: {
        name: '名前（任意）',
        seedNumber: 'seed（任意、整数）',
        hero: '主人公名',
        seed: 'seed（任意）',
        heroDefault: 'あなた',
      },
      buttons: {
        trick: 'Trick or Treat!',
        story: '生成する',
        language: '言語',
      },
      timeline: {
        empty: 'まだ履歴がありません。',
        type: {
          trick: 'トリック',
          story: 'ストーリー',
        },
      },
      footer: 'Happy Halloween 👻',
      motion: {
        badgeTreat: 'TREAT! 🍬',
        badgeTrick: 'TRICK! 👻',
      },
      languageLabel: '言語',
    },
  },
  en: {
    translation: {
      title: '🎃 Halloween Mini Apps',
      subtitle: 'React + FastAPI (Runs locally instantly)',
      sections: {
        trick: 'Trick or Treat API',
        story: 'Halloween Story API',
        history: 'Recent Activity',
      },
      placeholders: {
        name: 'Name (optional)',
        seedNumber: 'Seed (optional, integer)',
        hero: 'Hero name',
        seed: 'Seed (optional)',
        heroDefault: 'You',
      },
      buttons: {
        trick: 'Trick or Treat!',
        story: 'Generate',
        language: 'Language',
      },
      timeline: {
        empty: 'No history yet.',
        type: {
          trick: 'Trick',
          story: 'Story',
        },
      },
      footer: 'Happy Halloween 👻',
      motion: {
        badgeTreat: 'TREAT! 🍬',
        badgeTrick: 'TRICK! 👻',
      },
      languageLabel: 'Language',
    },
  },
} as const

i18n.use(initReactI18next).init({
  resources,
  lng: 'ja',
  fallbackLng: 'ja',
  interpolation: { escapeValue: false },
})

export default i18n
