"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { HelpCircle, CheckCircle2, MessageSquare, ShieldAlert, Sparkles, Send } from "lucide-react"

interface Ticket {
  id: string
  subject: string
  category: string
  message: string
  status: string
  createdAt: string
}

interface TenantInquiry {
  id: string
  tenantName: string
  facilityName: string
  question: string
  answered: boolean
  answer?: string
}

export default function WarehouseSupport() {
  const [session, setSession] = useState<any>(null)
  
  // Support state
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [subject, setSubject] = useState("")
  const [category, setCategory] = useState("Facilities / Infrastructure")
  const [message, setMessage] = useState("")

  // Tenant inquiries state
  const [inquiries, setInquiries] = useState<TenantInquiry[]>([])
  const [selectedInquiry, setSelectedInquiry] = useState<TenantInquiry | null>(null)
  const [answerContent, setAnswerContent] = useState("")

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        loadSupportData(session.user.id)
      }
    })
  }, [])

  const loadSupportData = (userId: string) => {
    // 1. Support Tickets
    const storedTickets = localStorage.getItem(`af_warehouse_tickets_${userId}`)
    if (storedTickets) {
      setTickets(JSON.parse(storedTickets))
    } else {
      const initialTickets = [
        { id: "t-1", subject: "Cold Room backup generator failure", category: "Facilities / Infrastructure", message: "Backup generator failed to auto-start during power drop.", status: "resolved", createdAt: new Date(Date.now() - 172800000).toISOString() }
      ]
      setTickets(initialTickets)
      localStorage.setItem(`af_warehouse_tickets_${userId}`, JSON.stringify(initialTickets))
    }

    // 2. Tenant inquiries
    const storedInquiries = localStorage.getItem(`af_warehouse_inquiries_${userId}`)
    if (storedInquiries) {
      setInquiries(JSON.parse(storedInquiries))
    } else {
      const initialInquiries = [
        { id: "inq-1", tenantName: "Timothy Kiprop", facilityName: "Rift Valley Cold Hub", question: "Do you have relative humidity settings for seed potatoes?", answered: false },
        { id: "inq-2", tenantName: "Kiambu Farmers Coop", facilityName: "Nakuru Dry Silos", question: "Is there a weight scale limit for heavy-duty Actros trailers?", answered: true, answer: "Yes, our weighbridge limits are up to 60 metric tons gross weight." }
      ]
      setInquiries(initialInquiries)
      localStorage.setItem(`af_warehouse_inquiries_${userId}`, JSON.stringify(initialInquiries))
    }
  }

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      if (!subject.trim() || !message.trim()) {
        throw new Error("Subject and description details are required.")
      }

      const newTicket: Ticket = {
        id: `tkt-${Date.now()}`,
        subject,
        category,
        message,
        status: "open",
        createdAt: new Date().toISOString()
      }

      const updated = [newTicket, ...tickets]
      setTickets(updated)
      if (session?.user) {
        localStorage.setItem(`af_warehouse_tickets_${session.user.id}`, JSON.stringify(updated))
      }

      setSuccess("Support ticket raised successfully! Our administration team will review this shortly.")
      setSubject("")
      setMessage("")
      setTimeout(() => setSuccess(""), 4000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerInquiry = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInquiry || !answerContent.trim()) return

    const updated = inquiries.map((i) => {
      if (i.id === selectedInquiry.id) {
        return { ...i, answered: true, answer: answerContent }
      }
      return i
    })

    setInquiries(updated)
    if (session?.user) {
      localStorage.setItem(`af_warehouse_inquiries_${session.user.id}`, JSON.stringify(updated))
    }

    setSuccess("Your response has been sent to the depositor tenant!")
    setAnswerContent("")
    setSelectedInquiry(null)
    setTimeout(() => setSuccess(""), 4000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <HelpCircle className="h-8 w-8 text-primary" />
          <span>Warehouse Helpdesk & Advisory</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Open infrastructure support tickets, resolve storage complaints, or answer tenant inquiries about facility rules.
        </p>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Support Tickets Section */}
        <div className="glass p-8 rounded-xl lg:col-span-1 h-fit space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            Raise Facility Ticket
          </h3>

          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Ticket Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Weighbridge calibration error"
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none"
              >
                <option value="Facilities / Infrastructure">Facilities / Infrastructure</option>
                <option value="Billing / Settlement">Billing / Settlement</option>
                <option value="System Bug">System Bug</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Detailed Description</label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe infrastructure details..."
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-3 rounded-lg text-sm transition-all cursor-pointer"
            >
              Open Ticket
            </button>
          </form>

          {/* Opened tickets list */}
          <div className="border-t border-border/20 pt-4 space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">My Raised Tickets</span>
            {tickets.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">No tickets raised.</p>
            ) : (
              <div className="space-y-2.5">
                {tickets.map((t) => (
                  <div key={t.id} className="bg-slate-950 p-3 rounded-lg border border-border/20 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white truncate max-w-[120px]">{t.subject}</span>
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        t.status === "open" ? "bg-amber-500/10 text-amber-500" : "bg-green-500/10 text-green-400"
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 block">Category: {t.category}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tenant inquiries consultation deck */}
        <div className="glass p-8 rounded-xl lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Tenant Inquiries & Questions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* List of inquiries */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Active Tenant Questions</span>
              {inquiries.map((i) => (
                <div
                  key={i.id}
                  onClick={() => !i.answered && setSelectedInquiry(i)}
                  className={`p-4 rounded-lg border transition-all ${
                    i.answered
                      ? "bg-slate-900/40 border-border/20 cursor-default"
                      : "bg-slate-900 border-primary/20 hover:border-primary cursor-pointer shadow-md"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-white">{i.tenantName}</span>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      i.answered ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-500 animate-pulse"
                    }`}>
                      {i.answered ? "Answered" : "Needs Answer"}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-primary uppercase tracking-wider block mb-1">
                    Facility: {i.facilityName}
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">"{i.question}"</p>
                  
                  {i.answered && i.answer && (
                    <div className="mt-3 bg-slate-950 p-2.5 rounded-lg border border-border/10">
                      <span className="text-[10px] font-bold text-green-400 block mb-1">Your reply:</span>
                      <p className="text-[11px] text-muted-foreground italic">"{i.answer}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Answer form */}
            <div className="bg-slate-900/60 p-5 rounded-lg border border-border/30 h-fit space-y-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider block flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                Response Deck
              </span>

              {selectedInquiry ? (
                <form onSubmit={handleAnswerInquiry} className="space-y-4">
                  <div className="text-xs">
                    <div className="text-muted-foreground">Replying to <strong className="text-white">{selectedInquiry.tenantName}</strong></div>
                    <div className="text-[10px] text-primary font-bold uppercase mt-0.5">Facility: {selectedInquiry.facilityName}</div>
                    <p className="italic text-muted-foreground mt-1.5">"{selectedInquiry.question}"</p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">My Response</label>
                    <textarea
                      rows={4}
                      required
                      value={answerContent}
                      onChange={(e) => setAnswerContent(e.target.value)}
                      placeholder="Write guidelines, weights restrictions, storage rules..."
                      className="w-full bg-slate-950 border border-border/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Send className="h-3 w-3" />
                      <span>Send Response</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedInquiry(null)}
                      className="bg-slate-950 hover:bg-slate-800 text-muted-foreground text-xs font-bold py-2 px-3 rounded-lg transition-all border border-border/40 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-12">
                  Select a pending tenant inquiry on the left to write an agronomic or logistical response.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
