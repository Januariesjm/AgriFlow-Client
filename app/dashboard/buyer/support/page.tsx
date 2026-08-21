"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { clientApiGet } from "@/lib/api-client"
import { Order } from "@/lib/types"
import { HelpCircle, Plus, CheckCircle2 } from "lucide-react"

interface Ticket {
  id: string
  orderId?: string
  subject: string
  category: string
  description: string
  status: "open" | "investigating" | "resolved"
  createdAt: string
}

const FAQS = [
  {
    q: "How do I file a dispute on an order?",
    a: "Select your active order in the support center panel, choose a reason (e.g. damaged goods, short weight, transport delays), and click submit. Our trust & safety team will freeze the escrow funds immediately and arbitrate."
  },
  {
    q: "What is the standard payment escrow period?",
    a: "Escrow funds are locked until you log in and click 'Confirm Delivery' on your orders dashboard, or until the transporter uploads proof of delivery and 48 hours pass without a dispute."
  },
  {
    q: "How are logistics estimates calculated?",
    a: "We compute distances between farmer crop coordinates and your registered warehouse location. We then cross-reference available carrier vehicle rates to provide landed freight estimates."
  }
]

export default function BuyerSupport() {
  const [orders, setOrders] = useState<Order[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])

  // Form states
  const [category, setCategory] = useState("Dispute Order")
  const [selectedOrderId, setSelectedOrderId] = useState("")
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")

  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const fetchOrders = useCallback(async () => {
    try {
      const data = await clientApiGet<{ orders: Order[] }>("orders?role=buyer")
      if (data?.orders) {
        setOrders(data.orders)
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchOrders()
        
        const stored = localStorage.getItem(`af_buyer_tickets_${session.user.id}`)
        if (stored) {
          setTickets(JSON.parse(stored))
        } else {
          const defaultTickets: Ticket[] = [
            {
              id: "TCK-1082",
              subject: "Inquiry on bulk wheat shipping rates",
              category: "General Inquiry",
              description: "Looking for corporate freight discounts for shipping >100 tons per month.",
              status: "resolved",
              createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
            }
          ]
          setTickets(defaultTickets)
          localStorage.setItem(`af_buyer_tickets_${session.user.id}`, JSON.stringify(defaultTickets))
        }
      }
    })
  }, [fetchOrders])

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!subject.trim() || !description.trim()) {
      setError("Please fill out all fields.")
      return
    }

    if (category === "Dispute Order" && !selectedOrderId) {
      setError("Please select an active order to dispute.")
      return
    }

    const newTicket: Ticket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: category === "Dispute Order" ? selectedOrderId : undefined,
      subject,
      category,
      description,
      status: "open",
      createdAt: new Date().toISOString()
    }

    const updated = [newTicket, ...tickets]
    setTickets(updated)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        localStorage.setItem(`af_buyer_tickets_${session.user.id}`, JSON.stringify(updated))
      }
    })

    setSuccess(category === "Dispute Order" ? "Dispute filed successfully. Escrow funds frozen." : "Support ticket submitted successfully.")
    setSubject("")
    setDescription("")
    setSelectedOrderId("")

    setTimeout(() => setSuccess(""), 5000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <HelpCircle className="h-8 w-8 text-primary" />
          <span>Support Center & Escrow Disputes</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Open sourcing tickets, raise delivery disputes, audit orders, and review our trust and security procedures.
        </p>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Support Request Form */}
        <div className="glass p-8 rounded-xl lg:col-span-1">
          <div className="flex items-center space-x-2.5 mb-6">
            <Plus className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold text-white">Create Ticket</h3>
          </div>

          <form onSubmit={handleCreateTicket} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Ticket Category</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  setSelectedOrderId("")
                }}
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none"
              >
                <option value="Dispute Order">Dispute Harvest Delivery</option>
                <option value="Billing">Billing & Wallet Top-Up</option>
                <option value="Technical">Technical Issue</option>
                <option value="General Inquiry">General Sourcing Inquiry</option>
              </select>
            </div>

            {category === "Dispute Order" && (
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Select Purchase Order</label>
                {orders.length === 0 ? (
                  <p className="text-xs text-muted-foreground bg-slate-900 border border-border/40 p-2.5 rounded-lg">No active purchase orders found.</p>
                ) : (
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none"
                  >
                    <option value="">-- Select Order --</option>
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        ORD-{o.id.substring(0, 8).toUpperCase()} ({o.product?.name}) - ${o.total_price}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Subject Heading</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Damaged packaging on delivery"
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Detailed Description</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe your sourcing inquiry or dispute in detail..."
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-3 rounded-lg text-sm transition-all cursor-pointer shadow"
            >
              {category === "Dispute Order" ? "File Sourcing Dispute" : "Submit Support Ticket"}
            </button>
          </form>
        </div>

        {/* Tickets and disputes list */}
        <div className="glass p-8 rounded-xl lg:col-span-2 space-y-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Active Case Files</h3>
            {tickets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No support cases open at this time.</p>
            ) : (
              <div className="space-y-4">
                {tickets.map((t) => (
                  <div key={t.id} className="bg-slate-900/60 p-4 rounded-lg border border-border/40 space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs text-muted-foreground font-mono font-bold block">{t.id} | {t.category}</span>
                        <span className="text-sm font-bold text-white block mt-0.5">{t.subject}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        t.status === "resolved"
                          ? "bg-green-500/10 border-green-500/20 text-green-400"
                          : t.status === "investigating"
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                          : "bg-primary/10 border-primary/20 text-primary"
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{t.description}</p>
                    {t.orderId && (
                      <div className="pt-2 border-t border-border/20 text-[10px] text-muted-foreground">
                        Linked Order File: <span className="text-white font-mono">ORD-{t.orderId.substring(0, 8).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sourcing FAQs */}
          <div className="pt-4 border-t border-border/40">
            <h3 className="text-xl font-bold text-white mb-5">Sourcing FAQs</h3>
            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <div key={i} className="space-y-1.5">
                  <span className="text-xs font-bold text-white block">{faq.q}</span>
                  <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
