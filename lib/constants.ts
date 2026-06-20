export const CROPS = ["Maize", "Beans", "Rice", "Tomatoes", "Onions", "Potatoes"]

export const COUNTRIES = ["Kenya", "Uganda", "Tanzania", "Rwanda"]

export const REGIONS: Record<string, string[]> = {
  Kenya: ["Nairobi", "Nakuru", "Mombasa", "Kisumu", "Eldoret"],
  Uganda: ["Kampala", "Entebbe", "Jinja", "Mbarara", "Gulu"],
  Tanzania: ["Dar es Salaam", "Dodoma", "Arusha", "Mwanza", "Zanzibar"],
  Rwanda: ["Kigali", "Gisenyi", "Butare", "Ruhengeri", "Kibuye"],
}

export const CROP_CATEGORIES: Record<string, string> = {
  Maize: "Grains",
  Beans: "Legumes",
  Rice: "Grains",
  Tomatoes: "Vegetables",
  Onions: "Vegetables",
  Potatoes: "Tubers",
}

export const UNITS = ["kg", "ton", "bag", "crate"]

export const QUALITY_GRADES = ["A", "B", "C", "Ungraded"]
