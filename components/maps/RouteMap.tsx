"use client"

import { useEffect, useRef, useState } from "react"

interface RouteMapProps {
  originLat: number
  originLng: number
  destLat: number
  destLng: number
  originLabel?: string
  destLabel?: string
  height?: string
}

const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#0b0f19" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8e9bb0" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b0f19" }] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f293d" }]
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [{ color: "#111827" }]
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#334155" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#030712" }]
  }
]

export default function RouteMap({
  originLat,
  originLng,
  destLat,
  destLng,
  originLabel = "Origin",
  destLabel = "Destination",
  height = "350px"
}: RouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const directionsRendererRef = useRef<any>(null)
  const [loaded, setLoaded] = useState(false)
  const [distance, setDistance] = useState<string>("")
  const [duration, setDuration] = useState<string>("")

  useEffect(() => {
    if (typeof window === "undefined") return

    if ((window as any).google && (window as any).google.maps) {
      setLoaded(true)
      return
    }

    const existingScript = document.getElementById("google-maps-api-script")
    if (existingScript) {
      const checkLoaded = setInterval(() => {
        if ((window as any).google?.maps) {
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

    const script = document.createElement("script")
    script.id = "google-maps-api-script"
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
    script.async = true
    script.defer = true
    script.onload = () => setLoaded(true)
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    if (!loaded || !mapContainerRef.current || typeof window === "undefined") return

    const google = (window as any).google
    const origin = { lat: originLat, lng: originLng }
    const destination = { lat: destLat, lng: destLng }

    if (!mapRef.current) {
      mapRef.current = new google.maps.Map(mapContainerRef.current, {
        center: origin,
        zoom: 10,
        styles: darkMapStyles,
        disableDefaultUI: false
      })

      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map: mapRef.current,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: "#10b981", // primary theme green color
          strokeWeight: 5,
          strokeOpacity: 0.8
        }
      })
    }

    const directionsService = new google.maps.DirectionsService()

    directionsService.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING
      },
      (response: any, status: any) => {
        if (status === google.maps.DirectionsStatus.OK) {
          directionsRendererRef.current.setDirections(response)
          const route = response.routes[0]?.legs[0]
          if (route) {
            setDistance(route.distance.text)
            setDuration(route.duration.text)
          }
        } else {
          console.error("Directions request failed due to " + status)
        }
      }
    )
  }, [loaded, originLat, originLng, destLat, destLng])

  return (
    <div className="relative rounded-xl overflow-hidden border border-border/40 shadow-xl">
      <div ref={mapContainerRef} style={{ width: "100%", height }} />
      {(distance || duration) && (
        <div className="absolute top-4 left-4 bg-slate-950/90 backdrop-blur-md p-4 rounded-xl border border-border/40 text-white space-y-1 shadow-lg max-w-xs">
          <div className="text-[10px] font-bold text-primary uppercase tracking-wider">
            Transit Logistics Manifest
          </div>
          <div className="text-xs text-muted-foreground">
            From: <strong className="text-white">{originLabel}</strong>
          </div>
          <div className="text-xs text-muted-foreground">
            To: <strong className="text-white">{destLabel}</strong>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/20 mt-2">
            <div>
              <span className="text-[9px] text-muted-foreground uppercase font-bold block">Distance</span>
              <span className="text-sm font-black text-white">{distance}</span>
            </div>
            <div>
              <span className="text-[9px] text-muted-foreground uppercase font-bold block">Est. Time</span>
              <span className="text-sm font-black text-secondary">{duration}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
