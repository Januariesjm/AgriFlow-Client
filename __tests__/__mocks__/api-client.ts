export const clientApiGet = jest.fn().mockImplementation((path: string) => {
  if (path.includes("farmer/wallet")) {
    return Promise.resolve({
      available_balance: 145000,
      pending_balance: 28000,
      withdrawals: [
        { id: "w-1", amount: 15000, method: "mobile_money", destination: "+254712345678", status: "completed", created_at: "2026-08-20T10:00:00Z" }
      ],
      deposits: [
        { id: "d-1", amount: 50000, method: "mobile_money", reference: "MPESA-892341", status: "completed", created_at: "2026-08-21T10:00:00Z" }
      ],
    })
  }
  return Promise.resolve([])
})

export const clientApiPost = jest.fn().mockResolvedValue({ success: true })
export const clientApiDelete = jest.fn().mockResolvedValue({ success: true })
