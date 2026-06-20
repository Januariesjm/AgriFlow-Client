"use client"

import { useState } from "react"
import { HelpCircle, MessageSquare, ChevronDown, ChevronUp, Send, CheckCircle2, BookOpen, Phone, Mail, Clock } from "lucide-react"

interface FAQ {
  question: string
  answer: string
}

interface SupportTicket {
  id: string
  subject: string
  category: string
  message: string
  status: "open" | "in_progress" | "resolved"
  created_at: string
}

const FAQS: FAQ[] = [
  {
    question: "How do I list a new crop for sale?",
    answer: "Navigate to 'My Products' in the sidebar and click 'Add Crop Offer'. Fill in the crop name, category, quantity, unit price, quality grade, and select the origin farm. Your listing will go live immediately on the marketplace."
  },
  {
    question: "How does the escrow payment system work?",
    answer: "When a buyer places an order, their payment is held in a secure escrow. The funds are only released to your wallet after the order is marked as 'Delivered' and the buyer confirms receipt. This protects both parties in the transaction."
  },
  {
    question: "How do I withdraw my earnings?",
    answer: "Go to 'My Wallet' in the sidebar. First configure your payout method (Mobile Money or Bank Transfer) in the Payout Configuration section. Then enter the amount you wish to withdraw and click 'Withdraw Funds'. Funds from delivered orders are available immediately."
  },
  {
    question: "How do I book a transporter for my order?",
    answer: "Navigate to 'Logistics' in the sidebar. Select a confirmed order from the dropdown, review the pickup and delivery details, and click 'Book Transport Request'. This broadcasts your request to available regional transporters who can accept the job."
  },
  {
    question: "Why can't I see my earnings in the wallet?",
    answer: "Earnings only appear in your Available Balance after the order status changes to 'Delivered'. Orders that are pending, confirmed, or in transit have their funds held in escrow. Check your order status under 'Incoming Orders'."
  },
  {
    question: "How do I change the price of my listed product?",
    answer: "Currently, to update a product's price, you need to update it from the 'My Products' section. You can edit any active listing's details including price, quantity, and description."
  },
  {
    question: "What quality grades are available and what do they mean?",
    answer: "Products can be graded as: Grade A (Premium quality, minimal defects), Grade B (Standard quality, acceptable for most buyers), Grade C (Sub-standard, may require processing), or Ungraded (Raw produce without formal grading). Higher grades typically command better prices."
  },
  {
    question: "How does the crop calendar work?",
    answer: "The Crop Calendar is your personal farm planner. You can schedule planting, irrigation, fertilization, pest control, and harvesting activities. It also includes an East African planting guide showing optimal planting and harvesting windows for common crops."
  },
]

export default function FarmerSupport() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  // Ticket form
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [ticketSubject, setTicketSubject] = useState("")
  const [ticketCategory, setTicketCategory] = useState("general")
  const [ticketMessage, setTicketMessage] = useState("")
  const [ticketSuccess, setTicketSuccess] = useState("")

  // Tickets
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("af_support_tickets")
      return stored ? JSON.parse(stored) : []
    }
    return []
  })

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault()

    const newTicket: SupportTicket = {
      id: `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
      subject: ticketSubject,
      category: ticketCategory,
      message: ticketMessage,
      status: "open",
      created_at: new Date().toISOString(),
    }

    const updated = [newTicket, ...tickets]
    setTickets(updated)
    localStorage.setItem("af_support_tickets", JSON.stringify(updated))

    setTicketSubject("")
    setTicketCategory("general")
    setTicketMessage("")
    setShowTicketForm(false)
    setTicketSuccess("Support ticket submitted successfully! Our team will respond within 24 hours.")
    setTimeout(() => setTicketSuccess(""), 5000)
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <HelpCircle className="h-8 w-8 text-primary" />
          Help & Support Center
        </h1>
        <p className="text-muted-foreground mt-1">
          Find answers to common questions, contact support, or submit a ticket.
        </p>
      </div>

      {ticketSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
          <span>{ticketSuccess}</span>
        </div>
      )}

      {/* Quick Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-xl border border-border/40 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Phone className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-sm font-bold text-white">Phone Support</h3>
          <p className="text-xs text-muted-foreground">Call our farmer support line for urgent assistance</p>
          <span className="text-sm font-bold text-primary block">+254 700 123 456</span>
          <span className="text-[10px] text-muted-foreground">Mon-Fri 8:00 AM - 6:00 PM EAT</span>
        </div>
        <div className="glass p-6 rounded-xl border border-border/40 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-sm font-bold text-white">Email Support</h3>
          <p className="text-xs text-muted-foreground">Send us a detailed message and we'll reply within 24hrs</p>
          <span className="text-sm font-bold text-primary block">support@agriflow.co</span>
          <span className="text-[10px] text-muted-foreground">Response within 24 hours</span>
        </div>
        <div className="glass p-6 rounded-xl border border-border/40 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-sm font-bold text-white">Submit a Ticket</h3>
          <p className="text-xs text-muted-foreground">Create a formal support request for tracked resolution</p>
          <button
            onClick={() => setShowTicketForm(!showTicketForm)}
            className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-4 py-2 rounded-lg text-xs transition-all cursor-pointer shadow"
          >
            {showTicketForm ? "Cancel" : "Create Ticket"}
          </button>
        </div>
      </div>

      {/* Submit Ticket Form */}
      {showTicketForm && (
        <div className="glass p-8 rounded-xl">
          <div className="flex items-center space-x-2.5 mb-6">
            <Send className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold text-white">New Support Ticket</h3>
          </div>

          <form onSubmit={handleSubmitTicket} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Subject</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="general">General Inquiry</option>
                  <option value="orders">Orders & Fulfillment</option>
                  <option value="payments">Payments & Wallet</option>
                  <option value="logistics">Logistics & Transport</option>
                  <option value="products">Product Listings</option>
                  <option value="account">Account & Profile</option>
                  <option value="technical">Technical Issue / Bug</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1.5">Detailed Message</label>
              <textarea
                required
                rows={5}
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                placeholder="Please describe your issue in detail. Include order IDs, product names, or screenshots if relevant..."
                className="w-full bg-slate-900 border border-border rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <button
              type="submit"
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-2.5 rounded-lg text-sm transition-all cursor-pointer shadow"
            >
              Submit Support Ticket
            </button>
          </form>
        </div>
      )}

      {/* Previous Tickets */}
      {tickets.length > 0 && (
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Your Support Tickets
          </h3>
          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="bg-slate-900/60 rounded-lg p-4 border border-border/30 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">{t.id}</span>
                    <span className="text-[10px] bg-slate-800 border border-border px-2 py-0.5 rounded-full text-muted-foreground uppercase font-bold">
                      {t.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">{t.subject}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.message}</p>
                  <span className="text-[10px] text-muted-foreground mt-2 block">
                    Submitted: {new Date(t.created_at).toLocaleDateString()} at {new Date(t.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase shrink-0 ${
                  t.status === "resolved"
                    ? "bg-green-500/10 border-green-500/20 text-green-400"
                    : t.status === "in_progress"
                    ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                }`}>
                  {t.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center space-x-2.5 mb-6">
          <BookOpen className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold text-white">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-border/30 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-900/40 transition-colors cursor-pointer"
              >
                <span className="text-sm font-semibold text-white pr-4">{faq.question}</span>
                {openFAQ === i ? (
                  <ChevronUp className="h-4 w-4 text-primary shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </button>
              {openFAQ === i && (
                <div className="px-5 pb-4 border-t border-border/20">
                  <p className="text-sm text-muted-foreground leading-relaxed pt-3">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Platform Resources */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Platform Resources</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900/60 rounded-lg p-4 border border-border/30 space-y-1">
            <h4 className="text-sm font-bold text-white">📖 Getting Started Guide</h4>
            <p className="text-xs text-muted-foreground">Learn how to set up your farm profile, list products, and manage orders effectively.</p>
          </div>
          <div className="bg-slate-900/60 rounded-lg p-4 border border-border/30 space-y-1">
            <h4 className="text-sm font-bold text-white">📊 Pricing Strategy Tips</h4>
            <p className="text-xs text-muted-foreground">Use our Price Trends data to competitively price your crops and maximize returns.</p>
          </div>
          <div className="bg-slate-900/60 rounded-lg p-4 border border-border/30 space-y-1">
            <h4 className="text-sm font-bold text-white">🚛 Logistics Best Practices</h4>
            <p className="text-xs text-muted-foreground">Tips for coordinating transport, packaging produce, and ensuring safe delivery.</p>
          </div>
          <div className="bg-slate-900/60 rounded-lg p-4 border border-border/30 space-y-1">
            <h4 className="text-sm font-bold text-white">🌱 Seasonal Crop Planner</h4>
            <p className="text-xs text-muted-foreground">Reference our East African planting guide in the Crop Calendar for optimal timing.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
