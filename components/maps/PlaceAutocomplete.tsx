"use client"

import { useEffect, useRef, useState } from "react"

interface PlaceAutocompleteProps {
  value: string
  onChange: (val: string) => void
  onPlaceSelect: (address: string, lat: number, lng: number, placeDetails?: any) => void
  placeholder?: string
  className?: string
}

export default function PlaceAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Search for a location...",
  className = ""
}: PlaceAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    // If google is already loaded, initialize immediately
    if ((window as any).google && (window as any).google.maps && (window as any).google.maps.places) {
      setLoaded(true)
      return
    }

    // Check if script is already injected
    const existingScript = document.getElementById("google-maps-api-script")
    if (existingScript) {
      const checkLoaded = setInterval(() => {
        if ((window as any).google?.maps?.places) {
          clearInterval(checkLoaded)
          setLoaded(true)
        }
      }, 100)
      return
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.error("Missing Google Maps API Key")
      return
    }

    // Load Google Maps Script
    const script = document.createElement("script")
    script.id = "google-maps-api-script"
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => setLoaded(true)
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    if (!loaded || !inputRef.current || typeof window === "undefined") return

    const google = (window as any).google

    // Initialize Autocomplete with East Africa bias/restrictions
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["geocode", "establishment"],
      componentRestrictions: { country: ["KE", "UG", "TZ", "RW"] },
      fields: ["formatted_address", "geometry", "address_components"]
    })

    // Listen for place selection
    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current.getPlace()
      if (place && place.geometry && place.geometry.location) {
        const address = place.formatted_address || ""
        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()
        onPlaceSelect(address, lat, lng, place)
      }
    })

    // Clean up autocomplete instance
    return () => {
      if (google?.maps?.event && autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [loaded])

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-slate-900 border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary ${className}`}
    />
  )
}
