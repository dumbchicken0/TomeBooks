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
          headerTitle: "text-4xl font-bold text-black font-['Caveat']",
          headerSubtitle: "text-xl text-black font-['Caveat']",
          socialButtonsBlockButton: "border-[3px] border-black rounded-[15px_225px_15px_255px/255px_15px_225px_15px] hover:bg-pink-50 hover:-translate-y-1 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white",
          socialButtonsBlockButtonText: "font-bold text-xl font-['Caveat']",
          dividerLine: "bg-black h-[2px]",
          dividerText: "text-black font-bold font-['Caveat'] text-xl bg-white px-2",
          formFieldLabel: "text-2xl font-bold text-black font-['Caveat']",
          formFieldInput: "border-[3px] border-black rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-3 text-xl font-['Caveat'] focus:ring-0 focus:border-pink-500 focus:shadow-[4px_4px_0px_0px_rgba(236,72,153,1)] transition-all bg-white",
          formButtonPrimary: "bg-black text-white hover:bg-pink-500 hover:text-black border-[3px] border-black rounded-[15px_225px_15px_255px/255px_15px_225px_15px] shadow-[4px_4px_0px_0px_rgba(236,72,153,1)] hover:-translate-y-1 transition-all text-2xl font-bold py-3 mt-4 font-['Caveat']",
          footerActionText: "text-xl text-black font-['Caveat']",
          footerActionLink: "text-pink-500 hover:text-black font-bold text-xl font-['Caveat']",
          identityPreviewText: "text-black font-['Caveat']",
          identityPreviewEditButtonIcon: "text-black",
          formFieldInputShowPasswordButton: "text-black",
          userButtonPopoverCard: "border-[3px] border-black rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[8px_8px_0px_0px_rgba(236,72,153,1)] bg-white p-2",
          userPreviewMainIdentifier: "font-bold text-xl font-['Caveat']",
          userPreviewSecondaryIdentifier: "text-lg font-['Caveat'] text-gray-700",
          userButtonPopoverActionButton: "hover:bg-pink-50 rounded-[15px_255px_15px_225px/225px_15px_255px_15px] transition-colors",
          userButtonPopoverActionButtonText: "text-xl font-['Caveat'] text-black",
          userButtonPopoverActionButtonIcon: "text-black"
        }
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>,
)