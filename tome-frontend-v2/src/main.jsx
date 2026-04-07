import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorPrimary: '#ec4899',
          fontFamily: '"Caveat", cursive',
          colorBackground: '#ffffff',
          colorText: '#000000',
        },
        elements: {
          cardBox: "border-[3px] border-black rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[8px_8px_0px_0px_rgba(236,72,153,1)] bg-white",
          card: "rounded-none shadow-none bg-transparent p-6",
          modalContent: "border-[3px] border-black rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[8px_8px_0px_0px_rgba(236,72,153,1)] bg-white sm:max-w-lg md:max-w-xl p-4",
          modalBackdrop: "bg-pink-500/40 backdrop-blur-sm",
          headerTitle: "text-6xl font-bold text-black font-['Caveat'] tracking-tight",
          headerSubtitle: "text-2xl text-black font-['Caveat']",
          socialButtonsBlockButton: "border-[3px] border-black rounded-[15px_225px_15px_255px/255px_15px_225px_15px] hover:bg-pink-50 hover:-translate-y-1 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white py-4",
          socialButtonsBlockButtonText: "font-bold text-2xl font-['Caveat']",
          dividerLine: "bg-black h-[3px]",
          dividerText: "text-black font-bold font-['Caveat'] text-2xl bg-white px-3",
          formFieldLabel: "text-3xl font-bold text-black font-['Caveat']",
          formFieldInput: "border-[3px] border-black rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-4 text-2xl font-['Caveat'] focus:ring-0 focus:border-pink-500 focus:shadow-[4px_4px_0px_0px_rgba(236,72,153,1)] transition-all bg-white",
          formButtonPrimary: "bg-black text-white hover:bg-pink-500 hover:text-black border-[3px] border-black rounded-[15px_225px_15px_255px/255px_15px_225px_15px] shadow-[4px_4px_0px_0px_rgba(236,72,153,1)] hover:-translate-y-1 transition-all text-3xl font-bold py-4 mt-6 font-['Caveat']",
          footerActionText: "text-2xl text-black font-['Caveat']",
          footerActionLink: "text-pink-500 hover:text-black font-bold text-2xl font-['Caveat'] hover:underline",
          identityPreviewText: "text-black font-['Caveat'] text-2xl",
          identityPreviewEditButtonIcon: "text-black w-6 h-6",
          formFieldInputShowPasswordButton: "text-black w-6 h-6",
          userButtonPopoverCard: "border-[3px] border-black rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[8px_8px_0px_0px_rgba(236,72,153,1)] bg-white p-4",
          userPreviewMainIdentifier: "font-bold text-2xl font-['Caveat']",
          userPreviewSecondaryIdentifier: "text-xl font-['Caveat'] text-gray-700",
          userButtonPopoverActionButton: "hover:bg-pink-50 rounded-[15px_255px_15px_225px/225px_15px_255px_15px] transition-colors py-3",
          userButtonPopoverActionButtonText: "text-2xl font-['Caveat'] text-black",
          userButtonPopoverActionButtonIcon: "text-black w-6 h-6",
          modalCloseButton: "text-black hover:text-pink-500 transition-colors w-8 h-8"
        }
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>,
)