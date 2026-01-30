import { getDictionary } from '../get-dictionary'
import { Locale } from '../i18n-config'

describe('getDictionary', () => {
  it('returns English dictionary for "en" locale', async () => {
    const dict = await getDictionary('en' as Locale)
    expect(dict).toBeDefined()
    expect(dict.nav).toBeDefined()
    expect(dict.nav.home).toBe('Home')
  })

  it('returns Bengali dictionary for "bn" locale', async () => {
    const dict = await getDictionary('bn' as Locale)
    expect(dict).toBeDefined()
    expect(dict.nav).toBeDefined()
    expect(dict.nav.home).toBe('হোম')
  })

  it('returns Spanish dictionary for "es" locale', async () => {
    const dict = await getDictionary('es' as Locale)
    expect(dict).toBeDefined()
    expect(dict.nav.home).toBe('Inicio')
  })

  it('returns German dictionary for "de" locale', async () => {
    const dict = await getDictionary('de' as Locale)
    expect(dict).toBeDefined()
    expect(dict.nav.home).toBe('Startseite')
  })

  it('returns French dictionary for "fr" locale', async () => {
    const dict = await getDictionary('fr' as Locale)
    expect(dict).toBeDefined()
    expect(dict.nav.home).toBe('Accueil')
  })

  it('has consistent structure across all locales', async () => {
    const locales: Locale[] = ['en', 'bn', 'es', 'de', 'fr']
    
    for (const locale of locales) {
      const dict = await getDictionary(locale)
      expect(dict.nav).toBeDefined()
      expect(dict.home).toBeDefined()
      expect(dict.footer).toBeDefined()
      expect(dict.common).toBeDefined()
      expect(dict.categories).toBeDefined()
    }
  })

  it('includes all required navigation keys', async () => {
    const dict = await getDictionary('en' as Locale)
    expect(dict.nav.home).toBeDefined()
    expect(dict.nav.politics).toBeDefined()
    expect(dict.nav.business).toBeDefined()
    expect(dict.nav.immigration).toBeDefined()
    expect(dict.nav.jobs).toBeDefined()
  })
})
