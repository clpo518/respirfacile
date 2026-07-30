"use client"
import { useState } from "react"
import { FAQS } from "@/lib/content/faq"
import { contactEmail } from "@/lib/site"

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-beige-200" id="faq">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-forest-500/10 border border-forest-500/20 px-4 py-2 text-sm font-medium text-forest-700 mb-5">
            Questions
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-forest-800 mb-4 text-balance">
            Tout ce que vous voulez savoir
          </h2>
          <p className="text-forest-500 max-w-xl mx-auto">
            Des questions ? Normal. Voici les réponses directes.
          </p>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className={`rounded-2xl border overflow-hidden transition-all duration-200 ${
                open === i
                  ? "bg-beige-100 border-forest-300 shadow-sm"
                  : "bg-beige-100/60 border-beige-300 hover:border-forest-200 hover:bg-beige-100"
              }`}
            >
              <button
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className={`font-semibold text-sm md:text-base transition-colors ${open === i ? "text-forest-800" : "text-forest-700"}`}>
                  {faq.q}
                </span>
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                  open === i ? "bg-forest-500 rotate-45" : "bg-forest-500/10 border border-forest-500/20"
                }`}>
                  <svg className={`w-3.5 h-3.5 transition-colors ${open === i ? "text-beige-100" : "text-forest-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m-8-8h16" />
                  </svg>
                </div>
              </button>
              {open === i && (
                <div className="px-6 pb-6">
                  <div className="h-px bg-forest-500/10 mb-4" />
                  <p className="text-forest-600 leading-relaxed text-sm">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-forest-500">
            Une autre question ?{" "}
            <a href={`mailto:${contactEmail}`} className="text-forest-700 font-semibold hover:underline underline-offset-2">
              Écrivez-moi
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
