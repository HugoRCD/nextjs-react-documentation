import Head from 'next/head'
import { Router, useRouter } from 'next/router'
import { MDXProvider } from '@mdx-js/react'
import { useEffect } from 'react'

import { Layout } from '@/components/Layout'
import * as mdxComponents from '@/components/mdx'
import { useMobileNavigationStore } from '@/components/MobileNavigation'

import '@/styles/tailwind.css'
import 'focus-visible'

function onRouteChange() {
  useMobileNavigationStore.getState().close()
}

Router.events.on('hashChangeStart', onRouteChange)
Router.events.on('routeChangeComplete', onRouteChange)
Router.events.on('routeChangeError', onRouteChange)

export default function App({ Component, pageProps }) {
  let router = useRouter()

  useEffect(() => {
    let darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    function updateMode() {
      let isSystemDarkMode = darkModeMediaQuery.matches
      let isDarkMode = window.localStorage.isDarkMode === 'true' || (!('isDarkMode' in window.localStorage) && isSystemDarkMode)

      if (isDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }

      if (isDarkMode === isSystemDarkMode) {
        delete window.localStorage.isDarkMode
      }
    }

    function disableTransitionsTemporarily() {
      document.documentElement.classList.add('[&_*]:!transition-none')
      window.setTimeout(() => {
        document.documentElement.classList.remove('[&_*]:!transition-none')
      }, 0)
    }

    function updateModeWithoutTransitions() {
      disableTransitionsTemporarily()
      updateMode()
    }

    updateMode()
    darkModeMediaQuery.addEventListener('change', updateModeWithoutTransitions)
    window.addEventListener('storage', updateModeWithoutTransitions)

    return () => {
      darkModeMediaQuery.removeEventListener('change', updateModeWithoutTransitions)
      window.removeEventListener('storage', updateModeWithoutTransitions)
    }
  }, [])

  return (
    <>
      <Head>
        {router.pathname === '/' ? (
          <title>Protocol API Reference</title>
        ) : (
          <title>{`${pageProps.title} - Protocol API Reference`}</title>
        )}
        <meta name="description" content={pageProps.description} />
      </Head>
      <MDXProvider components={mdxComponents}>
        <Layout {...pageProps}>
          <Component {...pageProps} />
        </Layout>
      </MDXProvider>
    </>
  )
}
