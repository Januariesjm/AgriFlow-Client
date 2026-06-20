"use client"

import { useState } from "react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { 
  BookOpen, 
  Bug, 
  Activity, 
  HelpCircle, 
  ArrowRight,
  ShieldCheck,
  Check,
  FileText,
  Info,
  HeartPulse,
  Sprout
} from "lucide-react"

// Crop guides database
const CROP_GUIDES = [
  {
    id: "maize",
    name: "Maize Planting Guide",
    icon: "🌽",
    intro: "Maize is a staple food across East Africa. High yield relies heavily on spacing, timely planting, and nitrogen availability.",
    phases: [
      {
        title: "Land Preparation",
        desc: "Plough deep to clear perennial weeds. Work compost or seasoned manure into the topsoil. For high returns, soil pH should be 5.8 to 6.8."
      },
      {
        title: "Sowing & Spacing",
        desc: "Sow at a depth of 5cm. Space rows 75cm apart, and plants 25cm apart within the row. Use about 10kg of certified seed per acre."
      },
      {
        title: "Fertilization & Weeding",
        desc: "Apply DAP fertilizer at planting (50kg/acre). Perform first weeding at 2-3 weeks. Top-dress with CAN fertilizer when maize is knee-high."
      },
      {
        title: "Harvest & Moisture Check",
        desc: "Harvest when leaves dry out and grain moisture drops below 13.5% to avoid aflatoxin contamination. Use hermetic storage bags."
      }
    ]
  },
  {
    id: "tomatoes",
    name: "Tomato Husbandry Guide",
    icon: "🍅",
    intro: "Tomatoes yield high profit margins but are highly sensitive to soil moisture consistency, support trellising, and pest control.",
    phases: [
      {
        title: "Nursery Management",
        desc: "Raise seeds in seedling trays with coco peat. Transplant after 4 weeks when seedlings are 10-15cm tall and have healthy roots."
      },
      {
        title: "Transplanting & Support",
        desc: "Space seedlings 60cm by 45cm. Stake the plants using sturdy wooden poles and soft twinings to keep heavy clusters off the soil."
      },
      {
        title: "Drip Irrigation",
        desc: "Provide steady drip irrigation. Fluctuating soil moisture causes blossom-end rot. Avoid overhead watering to reduce fungal disease."
      },
      {
        title: "Pruning & Pest Care",
        desc: "Pinch off side shoots (suckers) regularly. Spray neem oil extracts early in the morning to prevent whiteflies and red spider mites."
      }
    ]
  },
  {
    id: "beans",
    name: "Bean Crop Rotation Guide",
    icon: "🫘",
    intro: "Beans are excellent rotation legumes. They establish symbiotic relations with Rhizobium bacteria to fix atmospheric nitrogen.",
    phases: [
      {
        title: "Soil Setup",
        desc: "Beans prefer loose, well-draining soils. Avoid waterlogged patches. Minimal nitrogen fertilizer is required as they produce their own."
      },
      {
        title: "Planting & Depth",
        desc: "Sow seeds 2.5cm to 5cm deep. Space rows at 45-50cm, and individual seeds at 10-15cm. Ensure soil is warm and moist."
      },
      {
        title: "Weeding & Care",
        desc: "Beans have shallow roots. Weed gently using a hand hoe. Do not weed when plants are wet to prevent spreading bean rust spores."
      },
      {
        title: "Threshing & Storage",
        desc: "Harvest when pods turn brown and brittle. Dry pods fully, thresh, and store in cool dry silos. Treat with ash or organic protectants."
      }
    ]
  }
]

// Diagnostic tool symptom options
const SYMPTOMS_LIST = [
  { id: "yellow_leaves", label: "Yellowing leaves" },
  { id: "dark_spots_leaves", label: "Dark spots/rings on leaves" },
  { id: "wilting", label: "Wilting despite moist soil" },
  { id: "white_powder", label: "White powdery growth on leaves" },
  { id: "holes_leaves", label: "Holes chewed in leaves or stems" },
  { id: "rotting_fruit", label: "Fruit rotting at bottom (black spot)" },
]

export default function LearnPage() {
  const [activeGuide, setActiveGuide] = useState("maize")
  
  // Symptom checklist state
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null)
  const [diagnosing, setDiagnosing] = useState(false)

  const toggleSymptom = (symptomId: string) => {
    if (selectedSymptoms.includes(symptomId)) {
      setSelectedSymptoms(selectedSymptoms.filter(id => id !== symptomId))
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptomId])
    }
  }

  const handleDiagnose = () => {
    if (selectedSymptoms.length === 0) {
      setDiagnosisResult(null)
      return
    }

    setDiagnosing(true)
    setTimeout(() => {
      // Calculate basic diagnoses based on symptoms matched
      let diagnosis = {
        name: "Unknown Pest/Issue",
        cause: "General physiological stress or multi-infection.",
        remedy: "Maintain balanced watering, inspect for tiny insects under leaves, and apply a broad-spectrum organic copper fungicide."
      }

      if (selectedSymptoms.includes("yellow_leaves") && selectedSymptoms.includes("dark_spots_leaves")) {
        diagnosis = {
          name: "Early Blight (Fungal)",
          cause: "Alternaria solani fungus, triggered by warmth and leaf moisture.",
          remedy: "Prune lower infected leaves, apply organic copper fungicide, and switch to drip irrigation to keep foliage dry."
        }
      } else if (selectedSymptoms.includes("holes_leaves")) {
        diagnosis = {
          name: "Stem Borer / Armyworm Damage",
          cause: "Chewing moth larvae consuming foliage and tunneling stems.",
          remedy: "Spray Bt (Bacillus thuringiensis) extract or apply dry clean sand mixed with wood ash directly into the crop whorls."
        }
      } else if (selectedSymptoms.includes("rotting_fruit")) {
        diagnosis = {
          name: "Blossom End Rot (Calcium Deficiency)",
          cause: "Inconsistent soil moisture restricting calcium intake by fruits.",
          remedy: "Provide uniform watering, add agricultural lime to the soil, and apply a foliar calcium spray."
        }
      } else if (selectedSymptoms.includes("white_powder")) {
        diagnosis = {
          name: "Powdery Mildew (Fungal)",
          cause: "Fungal spores thrive in warm, dry weather under high humidity.",
          remedy: "Mix baking soda (1 tbsp), neem oil (1 tsp), and water (1 liter) and spray crops thoroughly. Improve plant ventilation."
        }
      } else if (selectedSymptoms.includes("wilting") && selectedSymptoms.includes("yellow_leaves")) {
        diagnosis = {
          name: "Fusarium Wilt (Soil-Borne Fungal)",
          cause: "Pathogen blocks water transportation vessels inside the plant.",
          remedy: "Remove and burn infected plants (do not compost). Apply crop rotation with grains and cultivate wilt-resistant seed varieties."
        }
      } else if (selectedSymptoms.includes("yellow_leaves")) {
        diagnosis = {
          name: "Nitrogen Deficiency",
          cause: "Depleted soil nutrients or leaching due to heavy rains.",
          remedy: "Top-dress with nitrogen-rich organic compost, compost tea, or standard urea/CAN fertilizers."
        }
      }

      setDiagnosisResult(diagnosis)
      setDiagnosing(false)
    }, 800)
  }

  const currentGuideData = CROP_GUIDES.find(g => g.id === activeGuide) || CROP_GUIDES[0]

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-foreground">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12">
        
        {/* Page Title */}
        <section className="text-center max-w-3xl mx-auto pt-6">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mb-6">
            <BookOpen className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 tracking-wide">
              AgriFlow Academy & Diagnostic Labs
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-6">
            Learn How to Plant
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore scientific planting guides for East African crops and run diagnostics on crop pests and nutrient deficiencies.
          </p>
        </section>

        {/* Guides & Diagnostics Tabs Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Diagnostic Simulator Tool */}
          <div className="lg:col-span-1 glass p-6 rounded-xl border border-border/40 space-y-6">
            <div className="flex items-center space-x-2 border-b border-border/40 pb-4">
              <Bug className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-white">Pest & Disease Diagnostic Lab</h2>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Check the symptoms you observe on your crop. Our simulator will analyze the combination to identify potential issues and organic remedies.
            </p>

            <div className="space-y-3">
              {SYMPTOMS_LIST.map((symptom) => {
                const checked = selectedSymptoms.includes(symptom.id)
                return (
                  <button
                    key={symptom.id}
                    onClick={() => toggleSymptom(symptom.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border text-left text-xs transition-all ${
                      checked
                        ? "bg-primary/10 border-primary text-white"
                        : "bg-slate-900 border-border/40 text-muted-foreground hover:border-border"
                    }`}
                  >
                    <span>{symptom.label}</span>
                    <div className={`h-4.5 w-4.5 rounded border flex items-center justify-center ${
                      checked ? "bg-primary border-primary text-white" : "border-border bg-slate-950"
                    }`}>
                      {checked && <Check className="h-3 w-3" />}
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              onClick={handleDiagnose}
              disabled={selectedSymptoms.length === 0 || diagnosing}
              className="w-full bg-primary hover:bg-primary/95 disabled:bg-primary/50 text-primary-foreground font-semibold py-3 rounded-lg text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer shadow"
            >
              <Activity className="h-4 w-4 shrink-0" />
              <span>{diagnosing ? "Analyzing Symptoms..." : "Run Diagnostics"}</span>
            </button>

            {/* Diagnostic Output */}
            {diagnosisResult && !diagnosing && (
              <div className="bg-slate-900/80 border border-border/40 rounded-xl p-5 space-y-4 animate-fade-in text-xs">
                <div className="flex items-center space-x-2 border-b border-border/30 pb-2">
                  <HeartPulse className="h-4.5 w-4.5 text-secondary shrink-0" />
                  <span className="font-extrabold text-white text-sm">{diagnosisResult.name}</span>
                </div>

                <div>
                  <span className="text-muted-foreground uppercase font-bold text-[9px] block">Primary Cause</span>
                  <p className="text-white mt-1 font-medium leading-relaxed">{diagnosisResult.cause}</p>
                </div>

                <div>
                  <span className="text-muted-foreground uppercase font-bold text-[9px] block">Recommended Action</span>
                  <p className="text-emerald-400 mt-1 font-medium leading-relaxed">{diagnosisResult.remedy}</p>
                </div>
              </div>
            )}
          </div>

          {/* Plant Guides Selector & Layout */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Guide Tabs */}
            <div className="flex space-x-2 bg-slate-900 p-1.5 rounded-lg border border-border/40">
              {CROP_GUIDES.map((guide) => (
                <button
                  key={guide.id}
                  onClick={() => setActiveGuide(guide.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-xs font-semibold transition-all ${
                    activeGuide === guide.id
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  <span className="text-base">{guide.icon}</span>
                  <span>{guide.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>

            {/* Guide Details Container */}
            <div className="glass p-8 rounded-xl border border-border/40 space-y-6">
              
              <div className="flex items-start space-x-4 border-b border-border/20 pb-4">
                <span className="text-4xl">{currentGuideData.icon}</span>
                <div>
                  <h2 className="text-2xl font-black text-white">{currentGuideData.name}</h2>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-2xl">
                    {currentGuideData.intro}
                  </p>
                </div>
              </div>

              {/* Progress steps mapping phases */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentGuideData.phases.map((phase, idx) => (
                  <div key={idx} className="bg-slate-900/60 border border-border/40 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="h-6 w-6 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="font-extrabold text-white text-sm">{phase.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {phase.desc}
                      </p>
                    </div>

                  </div>
                ))}
              </div>

            </div>

            {/* Advisory Info card */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-xl flex items-start space-x-4">
              <Sprout className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-white block mb-1">Weekly Agronomy Tip:</strong>
                Always test your soil composition before applying fertilizers. Soil pH levels regulate the absorption of minerals. High acidic levels (below 5.5) block potassium and nitrogen uptake, causing stunted seedling developments.
              </div>
            </div>

          </div>

        </section>

      </main>

      <Footer />
    </div>
  )
}
