import Link from "next/link"
import { Sprout } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Sprout className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold tracking-tight text-foreground">
                Agri<span className="text-primary">Flow</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              The Bloomberg Terminal for East African Agriculture. Connecting farmers, buyers, and transporters.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Marketplace</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground">
                  Browse Harvests
                </Link>
              </li>
              <li>
                <Link href="/prices" className="text-sm text-muted-foreground hover:text-foreground">
                  Price Compare
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Regional Coverage</h3>
            <ul className="mt-4 space-y-2">
              <li className="text-sm text-muted-foreground">Kenya</li>
              <li className="text-sm text-muted-foreground">Uganda</li>
              <li className="text-sm text-muted-foreground">Tanzania</li>
              <li className="text-sm text-muted-foreground">Rwanda</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border/40 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} AgriFlow. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground mt-4 sm:mt-0">
            Empowering smallholders & agribusinesses in East Africa.
          </p>
        </div>
      </div>
    </footer>
  )
}
