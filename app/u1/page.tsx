"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Lock, MapPin, X, CheckCheck, AlertTriangle } from "lucide-react"

// =======================================================
// HELPER COMPONENTS
// =======================================================

type Message = {
  type: "incoming" | "outgoing"
  content: string
  time: string
  isBlocked?: boolean
}

const RealtimeMap = ({ lat, lng, city, country }: { lat: number; lng: number; city: string; country: string }) => {
  const mapEmbedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=13&output=embed`
  return (
    <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-inner">
      <iframe
        className="absolute top-0 left-0 w-full h-full border-0"
        loading="lazy"
        allowFullScreen
        src={mapEmbedUrl}
      ></iframe>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="bg-gray-800/80 text-white text-xs font-bold py-1 px-3 rounded">GPS TRACKING</span>
          <span className="bg-red-600 text-white text-xs font-bold py-1 px-3 rounded">LIVE</span>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="absolute h-20 w-20 rounded-full bg-red-600/30 animate-ping"></div>
          <div className="relative flex items-center justify-center h-12 w-12 rounded-full bg-red-600 border-2 border-white shadow-xl">
            <MapPin className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="text-white">
          <div className="flex items-center gap-2 font-bold text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <span>SUSPICIOUS ACTIVITY DETECTED</span>
          </div>
          <p className="text-sm text-gray-200">
            Location: {city}, {country}
          </p>
          <p className="text-sm text-gray-200">
            Coordinates: {lat.toFixed(4)}, {lng.toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  )
}

const ChatPopup = ({
  onClose,
  profilePhoto,
  conversationData,
  conversationName,
}: { onClose: () => void; profilePhoto: string | null; conversationData: Message[]; conversationName: string }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
      <div
        className="relative bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-teal-600 text-white p-3 flex items-center gap-3">
          <button onClick={onClose} className="p-1 rounded-full hover:bg-teal-700 transition-colors">
            <X className="h-5 w-5" />
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={profilePhoto || "/placeholder.svg"}
              alt="Profile"
              width={40}
              height={40}
              className="object-cover h-full w-full"
              unoptimized
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{conversationName.replace("🔒", "").trim()}</span>
            {conversationName.includes("🔒") && <Lock className="h-4 w-4" />}
          </div>
        </div>
        <div className="bg-gray-200 p-4 space-y-4 h-[28rem] overflow-y-scroll">
          {conversationData.map((msg, index) =>
            msg.type === "incoming" ? (
              <div key={index} className="flex justify-start">
                <div className="bg-white rounded-lg p-3 max-w-[80%] shadow">
                  <p className={`text-sm ${msg.isBlocked ? "font-semibold text-red-500" : "text-gray-800"}`}>
                    {msg.content}
                  </p>
                  <p className="text-right text-xs text-gray-400 mt-1">{msg.time}</p>
                </div>
              </div>
            ) : (
              <div key={index} className="flex justify-end">
                <div className="bg-lime-200 rounded-lg p-3 max-w-[80%] shadow">
                  <p className={`text-sm ${msg.isBlocked ? "font-semibold text-red-500" : "text-gray-800"}`}>
                    {msg.content}
                  </p>
                  <div className="flex justify-end items-center mt-1">
                    <span className="text-xs text-gray-500 mr-1">{msg.time}</span>
                    <CheckCheck className="h-4 w-4 text-blue-500" />
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 text-center bg-gradient-to-t from-white via-white/95 to-transparent">
          <p className="text-gray-700 font-medium">To view the full conversation, you need to unlock the chats.</p>
        </div>
      </div>
    </div>
  )
}

// =======================================================
// MAIN COMPONENT U1
// =======================================================

interface ProgressStep {
  id: string
  text: string
  status: "pending" | "loading" | "completed"
}

const countries = [
  { code: "+1", name: "United States", flag: "🇺🇸", placeholder: "(555) 123-4567" },
  { code: "+1", name: "Canada", flag: "🇨🇦", placeholder: "(555) 123-4567" },
  { code: "+44", name: "United Kingdom", flag: "🇬🇧", placeholder: "7911 123456" },
  { code: "+33", name: "France", flag: "🇫🇷", placeholder: "6 12 34 56 78" },
  { code: "+49", name: "Germany", flag: "🇩🇪", placeholder: "1512 3456789" },
  { code: "+39", name: "Italy", flag: "🇮🇹", placeholder: "312 345 6789" },
  { code: "+34", name: "Spain", flag: "🇪🇸", placeholder: "612 34 56 78" },
  { code: "+52", name: "Mexico", flag: "🇲🇽", placeholder: "55 1234 5678" },
  { code: "+55", name: "Brazil", flag: "🇧🇷", placeholder: "(11) 99999-9999" },
  { code: "+54", name: "Argentina", flag: "🇦🇷", placeholder: "11 1234-5678" },
  { code: "+56", name: "Chile", flag: "🇨🇱", placeholder: "9 1234 5678" },
  { code: "+57", name: "Colombia", flag: "🇨🇴", placeholder: "300 1234567" },
  { code: "+51", name: "Peru", flag: "🇵🇪", placeholder: "912 345 678" },
  { code: "+58", name: "Venezuela", flag: "🇻🇪", placeholder: "412-1234567" },
  { code: "+593", name: "Ecuador", flag: "🇪🇨", placeholder: "99 123 4567" },
  { code: "+595", name: "Paraguay", flag: "🇵🇾", placeholder: "961 123456" },
  { code: "+598", name: "Uruguay", flag: "🇺🇾", placeholder: "94 123 456" },
  { code: "+591", name: "Bolivia", flag: "🇧🇴", placeholder: "71234567" },
  { code: "+81", name: "Japan", flag: "🇯🇵", placeholder: "90-1234-5678" },
  { code: "+82", name: "South Korea", flag: "🇰🇷", placeholder: "10-1234-5678" },
  { code: "+86", name: "China", flag: "🇨🇳", placeholder: "138 0013 8000" },
  { code: "+91", name: "India", flag: "🇮🇳", placeholder: "81234 56789" },
  { code: "+61", name: "Australia", flag: "🇦🇺", placeholder: "412 345 678" },
  { code: "+64", name: "New Zealand", flag: "🇳🇿", placeholder: "21 123 4567" },
  { code: "+27", name: "South Africa", flag: "🇿🇦", placeholder: "71 123 4567" },
  { code: "+20", name: "Egypt", flag: "🇪🇬", placeholder: "100 123 4567" },
  { code: "+234", name: "Nigeria", flag: "🇳🇬", placeholder: "802 123 4567" },
  { code: "+254", name: "Kenya", flag: "🇰🇪", placeholder: "712 123456" },
  { code: "+971", name: "United Arab Emirates", flag: "🇦🇪", placeholder: "50 123 4567" },
  { code: "+966", name: "Saudi Arabia", flag: "🇸🇦", placeholder: "50 123 4567" },
  { code: "+90", name: "Turkey", flag: "🇹🇷", placeholder: "501 234 56 78" },
  { code: "+7", name: "Russia", flag: "🇷🇺", placeholder: "912 345-67-89" },
  { code: "+380", name: "Ukraine", flag: "🇺🇦", placeholder: "50 123 4567" },
  { code: "+48", name: "Poland", flag: "🇵🇱", placeholder: "512 345 678" },
  { code: "+31", name: "Netherlands", flag: "🇳🇱", placeholder: "6 12345678" },
  { code: "+32", name: "Belgium", flag: "🇧🇪", placeholder: "470 12 34 56" },
  { code: "+41", name: "Switzerland", flag: "🇨🇭", placeholder: "78 123 45 67" },
  { code: "+43", name: "Austria", flag: "🇦🇹", placeholder: "664 123456" },
  { code: "+45", name: "Denmark", flag: "🇩🇰", placeholder: "20 12 34 56" },
  { code: "+46", name: "Sweden", flag: "🇸🇪", placeholder: "70-123 45 67" },
  { code: "+47", name: "Norway", flag: "🇳🇴", placeholder: "406 12 345" },
  { code: "+358", name: "Finland", flag: "🇫🇮", placeholder: "50 123 4567" },
  { code: "+65", name: "Singapore", flag: "🇸🇬", placeholder: "8123 4567" },
  { code: "+63", name: "Philippines", flag: "🇵🇭", placeholder: "912 345 6789" },
  { code: "+62", name: "Indonesia", flag: "🇮🇩", placeholder: "0812 3456 789" },
  { code: "+60", name: "Malaysia", flag: "🇲🇾", placeholder: "012-345 6789" },
  { code: "+66", name: "Thailand", flag: "🇹🇭", placeholder: "081 234 5678" },
  { code: "+84", name: "Vietnam", flag: "🇻🇳", placeholder: "091 234 56 78" },
  { code: "+92", name: "Pakistan", flag: "🇵🇰", placeholder: "0300 1234567" },
  { code: "+98", name: "Iran", flag: "🇮🇷", placeholder: "0912 345 6789" },
  { code: "+94", name: "Sri Lanka", flag: "🇱🇰", placeholder: "071 123 4567" },
  { code: "+880", name: "Bangladesh", flag: "🇧🇩", placeholder: "01712 345678" },
  { code: "+855", name: "Cambodia", flag: "🇰🇭", placeholder: "092 123 456" },
  { code: "+673", name: "Brunei", flag: "🇧🇳", placeholder: "872 1234" },
  { code: "+679", name: "Fiji", flag: "🇫🇯", placeholder: "920 1234" },
  { code: "+675", name: "Papua New Guinea", flag: "🇵🇬", placeholder: "723 45678" },
  { code: "+677", name: "Solomon Islands", flag: "🇸🇧", placeholder: "742 1234" },
  { code: "+678", name: "Vanuatu", flag: "🇻🇺", placeholder: "778 1234" },
  { code: "+691", name: "Micronesia", flag: "🇫🇲", placeholder: "920 1234" },
  { code: "+692", name: "Marshall Islands", flag: "🇲🇭", placeholder: "692 1234" },
  { code: "+680", name: "Palau", flag: "🇵🇼", placeholder: "620 1234" },
  { code: "+685", name: "Samoa", flag: "🇼🇸", placeholder: "722 1234" },
  { code: "+676", name: "Tonga", flag: "🇹🇴", placeholder: "771 1234" },
  { code: "+682", name: "Cook Islands", flag: "🇨🇰", placeholder: "722 1234" },
  { code: "+683", name: "Niue", flag: "🇳🇺", placeholder: "811 1234" },
  { code: "+672", name: "Norfolk Island", flag: "🇳🇫", placeholder: "512 1234" },
  { code: "+670", name: "Timor-Leste", flag: "🇹🇱", placeholder: "771 1234" },
  { code: "+673", name: "Brunei", flag: "🇧🇳", placeholder: "872 1234" },
  { code: "+674", name: "Nauru", flag: "🇳🇷", placeholder: "555 1234" },
  { code: "+675", name: "Papua New Guinea", flag: "🇵🇬", placeholder: "723 45678" },
  { code: "+676", name: "Tonga", flag: "🇹🇴", placeholder: "771 1234" },
  { code: "+677", name: "Solomon Islands", flag: "🇸🇧", placeholder: "742 1234" },
  { code: "+678", name: "Vanuatu", flag: "🇻🇺", placeholder: "778 1234" },
  { code: "+679", name: "Fiji", flag: "🇫🇯", placeholder: "920 1234" },
  { code: "+680", name: "Palau", flag: "🇵🇼", placeholder: "620 1234" },
  { code: "+681", name: "Wallis and Futuna", flag: "🇼🇫", placeholder: "721 1234" },
  { code: "+682", name: "Cook Islands", flag: "🇨🇰", placeholder: "722 1234" },
  { code: "+683", name: "Niue", flag: "🇳🇺", placeholder: "811 1234" },
  { code: "+685", name: "Samoa", flag: "🇼🇸", placeholder: "722 1234" },
  { code: "+686", name: "Kiribati", flag: "🇰🇮", placeholder: "720 1234" },
  { code: "+687", name: "New Caledonia", flag: "🇳🇨", placeholder: "750 1234" },
  { code: "+688", name: "Tuvalu", flag: "🇹🇻", placeholder: "771 1234" },
  { code: "+689", name: "French Polynesia", flag: "🇵🇫", placeholder: "87 12 34 56" },
  { code: "+690", name: "Tokelau", flag: "🇹🇰", placeholder: "811 1234" },
  { code: "+691", name: "Micronesia", flag: "🇫🇲", placeholder: "920 1234" },
  { code: "+692", name: "Marshall Islands", flag: "🇲🇭", placeholder: "692 1234" },
  { code: "+850", name: "North Korea", flag: "🇰🇵", placeholder: "191 123 4567" },
  { code: "+852", name: "Hong Kong", flag: "🇭🇰", placeholder: "6123 4567" },
  { code: "+853", name: "Macau", flag: "🇲🇴", placeholder: "6612 3456" },
  { code: "+855", name: "Cambodia", flag: "🇰🇭", placeholder: "092 123 456" },
  { code: "+856", name: "Laos", flag: "🇱🇦", placeholder: "020 1234 5678" },
  { code: "+880", name: "Bangladesh", flag: "🇧🇩", placeholder: "01712 345678" },
  { code: "+886", name: "Taiwan", flag: "🇹🇼", placeholder: "0912 345 678" },
  { code: "+960", name: "Maldives", flag: "🇲🇻", placeholder: "777 1234" },
  { code: "+961", name: "Lebanon", flag: "🇱🇧", placeholder: "03 123 456" },
  { code: "+962", name: "Jordan", flag: "🇯🇴", placeholder: "079 123 4567" },
  { code: "+963", name: "Syria", flag: "🇸🇾", placeholder: "093 123 456" },
  { code: "+964", name: "Iraq", flag: "🇮🇶", placeholder: "0790 123 4567" },
  { code: "+965", name: "Kuwait", flag: "🇰🇼", placeholder: "600 12345" },
  { code: "+966", name: "Saudi Arabia", flag: "🇸🇦", placeholder: "50 123 4567" },
  { code: "+967", name: "Yemen", flag: "🇾🇪", placeholder: "711 123 456" },
  { code: "+968", name: "Oman", flag: "🇴🇲", placeholder: "921 12345" },
  { code: "+970", name: "Palestine", flag: "🇵🇸", placeholder: "0599 123 456" },
  { code: "+971", name: "United Arab Emirates", flag: "🇦🇪", placeholder: "50 123 4567" },
  { code: "+972", name: "Israel", flag: "🇮🇱", placeholder: "052-123-4567" },
  { code: "+973", name: "Bahrain", flag: "🇧🇭", placeholder: "3600 1234" },
  { code: "+974", name: "Qatar", flag: "🇶🇦", placeholder: "3312 3456" },
  { code: "+975", name: "Bhutan", flag: "🇧🇹", placeholder: "17 123 456" },
  { code: "+976", name: "Mongolia", flag: "🇲🇳", placeholder: "8812 3456" },
  { code: "+977", name: "Nepal", flag: "🇳🇵", placeholder: "984 123 4567" },
  { code: "+992", name: "Tajikistan", flag: "+992", placeholder: "917 123 456" },
  { code: "+993", name: "Turkmenistan", flag: "🇹🇲", placeholder: "66 123 4567" },
  { code: "+994", name: "Azerbaijan", flag: "🇦🇿", placeholder: "050 123 45 67" },
  { code: "+995", name: "Georgia", flag: "🇬🇪", placeholder: "555 12 34 56" },
  { code: "+996", name: "Kyrgyzstan", flag: "🇰🇬", placeholder: "0700 123 456" },
  { code: "+998", name: "Uzbekistan", flag: "🇺🇿", placeholder: "90 123 45 67" },
]

export default function U1() {
  const router = useRouter()

  // NOVO ESTADO PARA GÊNERO
  const [selectedGender, setSelectedGender] = useState<"Male" | "Female" | "Non-binary">("Female")

  const [isLoadingStarted, setIsLoadingStarted] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [selectedCountry, setSelectedCountry] = useState(
    countries.find((c) => c.name === "United States") || countries[0],
  )
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [countrySearch, setCountrySearch] = useState("")
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false)
  const [isPhotoPrivate, setIsPhotoPrivate] = useState(false)
  const [photoError, setPhotoError] = useState("")
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null)

  const [progress, setProgress] = useState(0)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [visibleSteps, setVisibleSteps] = useState<number>(1)
  const [currentSteps, setCurrentSteps] = useState<ProgressStep[]>([])

  const [location, setLocation] = useState<{ lat: number; lng: number; city: string; country: string } | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(true)
  const [selectedConvoIndex, setSelectedConvoIndex] = useState<number | null>(null)

  const [timeLeft, setTimeLeft] = useState(5 * 60)

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "00:00"
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const defaultLocation = { lat: -23.5505, lng: -46.6333, city: "São Paulo", country: "Brazil" }

  // DADOS DO RELATÓRIO AGORA SÃO DINÂMICOS COM BASE NO GÊNERO
  const { reportConversations, reportMedia } = useMemo(() => {
    const isMale = selectedGender === "Male"
    // Para 'Non-binary', usamos 'Female' como padrão para este exemplo
    const genderPath = isMale ? "male/zap" : "female/zap"
    const suffix = isMale ? "f" : "h"

    const conversations = [
      {
        img: `/images/${genderPath}/1-${suffix}.png`,
        name: "Blocked 🔒",
        msg: "Recovered deleted message",
        time: "Yesterday",
        popupName: "Blocked 🔒",
        chatData: [
          { type: "incoming", content: "Hi, how are you?", time: "2:38 PM" },
          { type: "outgoing", content: "I'm good, and you?", time: "2:40 PM" },
          { type: "incoming", content: "Blocked content", time: "2:43 PM", isBlocked: true },
        ] as Message[],
      },
      {
        img: `/images/${genderPath}/2-${suffix}.png`,
        name: "Blocked 🔒",
        msg: "Suspicious audio detected",
        time: "2 days ago",
        popupName: "Blocked",
        chatData: [
          { type: "incoming", content: "Hey my love", time: "10:21 PM" },
          { type: "outgoing", content: "I'm here, my love", time: "10:27 PM" },
          { type: "incoming", content: "Blocked content", time: "10:29 PM", isBlocked: true },
        ] as Message[],
      },
      {
        img: `/images/${genderPath}/3-${suffix}.png`,
        name: "Blocked 🔒",
        msg: "Suspicious photos found",
        time: "3 days ago",
        popupName: "Blocked",
        chatData: [
          { type: "incoming", content: "Hi, how have you been?", time: "11:45 AM" },
          { type: "outgoing", content: "I'm fine, thanks! What about you?", time: "11:47 AM" },
          { type: "incoming", content: "Blocked content", time: "11:50 AM", isBlocked: true },
        ] as Message[],
      },
    ]

    const media = [
      `/images/${genderPath}/4-${suffix}.png`,
      `/images/${genderPath}/5-${suffix}.png`,
      `/images/${genderPath}/6-${suffix}.png`,
      `/images/${genderPath}/7-${suffix}.png`,
      `/images/${genderPath}/8-${suffix}.png`,
      `/images/${genderPath}/9-${suffix}.png`,
    ]

    return { reportConversations: conversations, reportMedia: media }
  }, [selectedGender])

  const suspiciousKeywords = [
    { word: "Naughty", count: 13 },
    { word: "Love", count: 22 },
    { word: "Secret", count: 7 },
    { word: "Hidden", count: 11 },
    { word: "Don't tell", count: 5 },
  ]

  const filteredCountries = useMemo(
    () =>
      countries.filter(
        (c) => c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.code.includes(countrySearch),
      ),
    [countrySearch],
  )

  const fetchWhatsAppPhoto = async (phone: string) => {
    if (phone.replace(/[^0-9]/g, "").length < 10) return
    setIsLoadingPhoto(true)
    setPhotoError("")
    setProfilePhoto(null)
    // Nota: Não resetamos isPhotoPrivate para falso imediatamente aqui, pois queremos manter o status da requisição

    try {
      const response = await fetch("/api/whatsapp-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })
      const data = await response.json()

      // Lógica Atualizada: Se a foto for privada, definimos o placeholder mas NÃO tratamos como erro fatal
      if (data?.is_photo_private) {
        setProfilePhoto("/placeholder.svg")
        setIsPhotoPrivate(true)
        setPhotoError("") // Limpa erros para permitir o avanço
        return
      }

      if (!response.ok || !data?.success) {
        setProfilePhoto("/placeholder.svg")
        setIsPhotoPrivate(false) // Erro genérico não é necessariamente perfil privado
        setPhotoError("Could not load photo.")
        return
      }

      setProfilePhoto(data.result)
      setIsPhotoPrivate(false)
    } catch (error) {
      console.error("Error fetching photo:", error)
      setProfilePhoto("/placeholder.svg")
      setPhotoError("Error loading photo.")
    } finally {
      setIsLoadingPhoto(false)
    }
  }

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = e.target.value.replace(/[^0-9\-$$$$\s]/g, "")
    setPhoneNumber(formattedValue)
    setIsPhotoPrivate(false)
    setPhotoError("")
    if (debounceTimeout) clearTimeout(debounceTimeout)
    const newTimeout = setTimeout(() => {
      const cleanPhone = (selectedCountry.code + formattedValue).replace(/[^0-9]/g, "")
      if (cleanPhone.length >= 11) fetchWhatsAppPhoto(cleanPhone)
    }, 2000)
    setDebounceTimeout(newTimeout)
  }

  const handleSelectCountry = (country: (typeof countries)[0]) => {
    setSelectedCountry(country)
    setShowCountryDropdown(false)
    setCountrySearch("")
    setPhoneNumber("")
    setProfilePhoto(null)
    setPhotoError("")
    setIsPhotoPrivate(false)
    if (debounceTimeout) clearTimeout(debounceTimeout)
  }

  useEffect(() => {
    const fetchLocation = async () => {
      setIsLoadingLocation(true)
      try {
        const response = await fetch("/api/location")
        if (!response.ok) throw new Error("API response not OK")
        const data = await response.json()
        if (data.lat && data.lon) {
          setLocation({ lat: data.lat, lng: data.lon, city: data.city, country: data.country })
        } else {
          setLocation(defaultLocation)
        }
      } catch (error) {
        console.error("Failed to fetch location:", error)
        setLocation(defaultLocation)
      } finally {
        setIsLoadingLocation(false)
      }
    }
    fetchLocation()
  }, [])

  const steps: ProgressStep[] = useMemo(
    () => [
      { id: "initiating", text: "Initiating connection...", status: "pending" },
      { id: "locating", text: "Locating nearest server...", status: "pending" },
      { id: "establishing", text: "Establishing secure connection...", status: "pending" },
      { id: "verifying", text: "Verifying phone number...", status: "pending" },
      { id: "valid", text: "Valid phone number", status: "pending" },
      { id: "analyzing", text: "Analyzing suspicious activities...", status: "pending" },
    ],
    [],
  )

  // Additional logic can be added here if needed

  return <div className="flex flex-col items-center justify-center min-h-screen">{/* Main content goes here */}</div>
}
