"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { ShieldAlert, Check, X, ShieldCheck } from "lucide-react"

export default function AdminUsers() {
  const [session, setSession] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchUsers(session.access_token)
      }
    })
  }, [])

  const fetchUsers = async (token: string) => {
    try {
      const res = await fetch("http://localhost:4000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleVerification = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`http://localhost:4000/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ is_verified: !currentStatus }),
      })

      if (res.ok) {
        fetchUsers(session.access_token)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Member Verifications</h1>
        <p className="text-muted-foreground mt-1">
          Verify identities and agribusiness licenses of farmers, buyers, and transporters.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
        </div>
      ) : users.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center">No platform profiles registered.</p>
      ) : (
        <div className="glass rounded-xl p-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/40 text-xs font-semibold text-muted-foreground uppercase">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Country</th>
                  <th className="py-3 px-4">Trust Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 text-sm">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40">
                    <td className="py-4 px-4 font-semibold text-white">{u.full_name}</td>
                    <td className="py-4 px-4 text-muted-foreground">{u.email}</td>
                    <td className="py-4 px-4 text-primary capitalize font-medium">{u.role}</td>
                    <td className="py-4 px-4 text-muted-foreground">{u.country}</td>
                    <td className="py-4 px-4">
                      {u.is_verified ? (
                        <span className="inline-flex items-center space-x-1 text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2.5 py-1 rounded-full font-bold">
                          <ShieldCheck className="h-3 w-3" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-xs bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2.5 py-1 rounded-full font-bold">
                          <ShieldAlert className="h-3 w-3" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => toggleVerification(u.id, u.is_verified)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          u.is_verified
                            ? "bg-amber-500/15 hover:bg-amber-500/25 text-amber-500"
                            : "bg-primary/15 hover:bg-primary/25 text-primary"
                        }`}
                      >
                        {u.is_verified ? "Revoke Trust" : "Approve Trust"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
