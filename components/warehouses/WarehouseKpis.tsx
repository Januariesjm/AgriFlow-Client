import { Warehouse } from "@/lib/types"
import { Compass, Home, BarChart } from "lucide-react"

interface WarehouseKpisProps {
  warehouses: Warehouse[]
}

export default function WarehouseKpis({ warehouses }: WarehouseKpisProps) {
  const totalCapacity = warehouses.reduce((sum, w) => sum + w.capacity, 0)
  const activeNodes = warehouses.filter((w) => w.status === "active").length

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="glass p-6 rounded-xl border border-primary/20 relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs text-primary font-bold uppercase tracking-wider block">Active Hubs</span>
            <h3 className="text-3xl font-black text-white mt-1">{activeNodes}</h3>
            <p className="text-xs text-muted-foreground mt-1">Receiving inbound dispatches.</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Home className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>

      <div className="glass p-6 rounded-xl border border-secondary/20 relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs text-secondary font-bold uppercase tracking-wider block">Total Network Capacity</span>
            <h3 className="text-3xl font-black text-white mt-1">{totalCapacity} Tons</h3>
            <p className="text-xs text-muted-foreground mt-1">Storage capability across all depots.</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
            <BarChart className="h-5 w-5 text-secondary" />
          </div>
        </div>
      </div>

      <div className="glass p-6 rounded-xl border border-border/40 relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block">Default Hub</span>
            <h3 className="text-xl font-bold text-white mt-2 truncate max-w-[200px]">
              {warehouses.length > 0 ? warehouses[0].name : "None configured"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Primary landing depot for orders.</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center">
            <Compass className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  )
}
