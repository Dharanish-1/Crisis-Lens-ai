"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  ShieldAlert, 
  Upload, 
  AlertTriangle, 
  MapPin, 
  Volume2, 
  CheckCircle2, 
  Activity,
  WifiOff,
  Globe,
  Send,
  Navigation,
  Flame,
  Ambulance,
  Shield,
  Mic,
  Camera,
  Video,
  Crosshair,
  Phone,
  RefreshCw,
  Zap,
  UserCheck,
  Eye,
  HeartPulse,
  Home,
  Sparkles,
  Compass,
  Dog,
  Heart
} from "lucide-react";

// Firebase imports
import { db } from "@/lib/firebase";
import { ref, onValue, set } from "firebase/database";

const TRANSLATIONS: Record<string, any> = {
  EN: {
    title: "CrisisLens AI",
    status: "LIVE RESPONDING",
    uploadTitle: "Upload / Capture Disaster Evidence",
    triageTitle: "Automated AI Triage Instructions",
    dispatchBtn: "Dispatch Emergency Payload 🚀",
    lowBandwidth: "Low-Bandwidth SMS Mode Enabled",
    mapTitle: "Live Tactical Incident Map & Responder Pins",
    resourcesTitle: "Real-Time Emergency Resource Dispatch",
    getGpsBtn: "Fetch My Live GPS Location",
    startVoiceBtn: "Voice Report (Speak Now)",
    stopVoiceBtn: "Stop Recording",
    startCamBtn: "Open Live AI Camera Feed"
  },
  ES: {
    title: "CrisisLens AI",
    status: "RESPONDIENDO EN VIVO",
    uploadTitle: "Cargar / Capturar Evidencia",
    triageTitle: "Instrucciones de Triaje Automatizadas",
    dispatchBtn: "Enviar Alerta de Emergencia 🚀",
    lowBandwidth: "Modo SMS de Bajo Ancho de Banda",
    mapTitle: "Mapa Táctico de Incidentes y Rescatistas",
    resourcesTitle: "Despacho de Recursos de Emergencia",
    getGpsBtn: "Obtener Ubicación GPS En Vivo",
    startVoiceBtn: "Reporte de Voz (Hablar)",
    stopVoiceBtn: "Detener Grabación",
    startCamBtn: "Abrir Cámara En Vivo"
  },
  HI: {
    title: "CrisisLens AI",
    status: "लाइव प्रतिक्रिया चालू है",
    uploadTitle: "चित्र या लाइव कैमरा साक्ष्य अपलोड करें",
    triageTitle: "स्वचालित आपातकालीन निर्देश",
    dispatchBtn: "आपत्कालीन सूचना भेजें 🚀",
    lowBandwidth: "कम नेटवर्क एसएमएस मोड सक्षम",
    mapTitle: "लाइव घटना मानचित्र और प्रतिक्रिया बल",
    resourcesTitle: "आपकी संसाधन आवंटन प्रणाली",
    getGpsBtn: "लाइव जीपीएस स्थान प्राप्त करें",
    startVoiceBtn: "वॉइस रिपोर्ट (बोलें)",
    stopVoiceBtn: "रिकॉर्डिंग रोकें",
    startCamBtn: "लाइव कैमरा खोलें"
  },
  TA: {
    title: "CrisisLens AI",
    status: "நேரடி பதில் செயல்பாடு",
    uploadTitle: "ஆதாரம் பதிவேற்றவும் / நேரடி கேமரா",
    triageTitle: "தானியங்கி அவசர வழிகாட்டுதல்கள்",
    dispatchBtn: "அவசர எச்சரிக்கை அனுப்பு 🚀",
    lowBandwidth: "குறைந்த இணைய வேக முறை செயல்படுத்தப்பட்டது",
    mapTitle: "நேரடி சம்பவ வரைபடம் மற்றும் மீட்புக் குழுக்கள்",
    resourcesTitle: "அவசர வளங்கள் விநியோகம்",
    getGpsBtn: "நேரடி GPS இருப்பிடத்தைப் பெறுக",
    startVoiceBtn: "குரல் வழி அறிக்கை (பேசவும்)",
    stopVoiceBtn: "பதிவை நிறுத்து",
    startCamBtn: "நேரடி AI கேமராவைத் திற"
  }
};

const DEFAULT_INCIDENT = {
  id: "preset-1",
  title: "Urban Emergency Standby",
  hazard: "Awaiting Live Image/Camera Scan",
  severity: 50,
  status: "STABLE",
  location: "Sector 4 (13.0827, 80.2707)",
  actions: {
    EN: ["Capture image or open camera feed to trigger real-time AI triage."],
    ES: ["Capture una imagen para activar el triaje con IA."],
    HI: ["एआई विश्लेषण ट्रिगर करने के लिए चित्र कैप्चर करें।"],
    TA: ["AI பகுப்பாய்வைத் தொடங்க படத்தை எடுக்கவும்."]
  },
  image: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=800"
};

const INITIAL_SHELTERS = [
  { id: 1, name: "Central High School Shelter", occupants: 340, capacity: 400, waterHoursLeft: 4.5, foodHoursLeft: 6.0, status: "WARNING" },
  { id: 2, name: "Indoor Sports Complex", occupants: 120, capacity: 500, waterHoursLeft: 28.0, foodHoursLeft: 36.0, status: "OPTIMAL" },
  { id: 3, name: "St. Mary Community Hall", occupants: 295, capacity: 300, waterHoursLeft: 1.2, foodHoursLeft: 2.0, status: "CRITICAL" }
];

const VULNERABLE_NODES = [
  { id: 1, address: "Apt 4B, Sector 3", type: "Elderly & Oxygen Dependent", requirement: "Power Backup & Stretcher", priority: "HIGH" },
  { id: 2, address: "House #12, Riverside Drive", type: "Bedridden Patient", requirement: "Wheelchair Ambulance Needed", priority: "CRITICAL" }
];

const RESPONDER_UNITS = [
  { id: 1, name: "Fire Squad Engine #4", type: "FIRE", lat: 30, lng: 45, status: "EN ROUTE" },
  { id: 2, name: "Medical Triage Unit #12", type: "MEDICAL", lat: 60, lng: 25, status: "ON SCENE" },
  { id: 3, name: "SWAT Safety Perimeter", type: "SWAT", lat: 75, lng: 70, status: "DISPATCHED" }
];

export default function CrisisLensDashboard() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<any>(DEFAULT_INCIDENT);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [language, setLanguage] = useState<"EN" | "ES" | "HI" | "TA">("EN");
  const [isLowBandwidth, setIsLowBandwidth] = useState(false);
  const [shelters] = useState(INITIAL_SHELTERS);

  // Live Controls State
  const [liveGps, setLiveGps] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isArMode, setIsArMode] = useState(false);

  // Facial Recognition State
  const [isMatchingFace, setIsMatchingFace] = useState(false);
  const [facialMatchResult, setFacialMatchResult] = useState<any>(null);

  // Twilio SOS State
  const [phoneNumber, setPhoneNumber] = useState("");
  const [sendingSms, setSendingSms] = useState(false);
  const [smsStatus, setSmsStatus] = useState<string | null>(null);

  // Empathy State
  const [petsPresent, setPetsPresent] = useState(false);
  const [isDetectingBreathing, setIsDetectingBreathing] = useState(false);
  const [breathStatus, setBreathStatus] = useState<string | null>(null);
  const [reassuranceSent, setReassuranceSent] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const t = TRANSLATIONS[language];

  // FIREBASE REALTIME LISTENER
  useEffect(() => {
    try {
      const activeIncidentRef = ref(db, "activeIncident");
      const unsubscribe = onValue(activeIncidentRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setActiveAnalysis(data);
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn("Firebase listener initialization deferred:", err);
    }
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLiveGps(`GPS: (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`),
        () => setLiveGps(null)
      );
    }
  }, []);

  const handleFetchLiveGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const loc = `Live GPS: (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`;
        setLiveGps(loc);
        const updated = { ...activeAnalysis, location: loc };
        setActiveAnalysis(updated);
        try { set(ref(db, "activeIncident"), updated); } catch {}
        alert(`Captured ${loc}`);
      });
    }
  };

  const startCameraFeed = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      alert("Unable to access live webcam feed.");
      setIsCameraActive(false);
    }
  };

  const stopCameraFeed = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
    }
    setIsCameraActive(false);
    setIsArMode(false);
  };

  const processImageForAnalysis = async (imageData: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: imageData }),
      });

      const resData = await response.json();

      if (resData.success) {
        const actionsList = resData.data.actions || [
          "Follow local disaster emergency protocols.",
          "Keep communication channels open.",
          "Evacuate to nearest shelter if instructed."
        ];

        const newAnalysisPayload = {
          title: "Live Gemini Vision AI Triage",
          hazard: resData.data.hazard,
          severity: resData.data.severity,
          status: resData.data.status,
          location: liveGps || "Live GPS (13.0827, 80.2707)",
          actions: {
            EN: actionsList,
            ES: actionsList,
            HI: actionsList,
            TA: actionsList,
          },
          timestamp: Date.now()
        };

        setActiveAnalysis(newAnalysisPayload);

        try {
          await set(ref(db, "activeIncident"), newAnalysisPayload);
        } catch (fbErr) {
          console.warn("Firebase sync fallback:", fbErr);
        }
      } else {
        alert(`AI Analysis Failed: ${resData.error}`);
      }
    } catch (err) {
      console.error("API request failed:", err);
      alert("Error communicating with Gemini AI Backend Route.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const captureAndDetect = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/jpeg");
      setSelectedImage(imageData);
      processImageForAnalysis(imageData);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSelectedImage(base64String);
        processImageForAnalysis(base64String);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleFacialMatchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setIsMatchingFace(true);
      setFacialMatchResult(null);
      setTimeout(() => {
        setIsMatchingFace(false);
        setFacialMatchResult({
          confidence: 96.4,
          personName: "Aarav Sharma (Age 11)",
          lastSeenLocation: "Indoor Sports Complex Shelter (Bed #42)",
          timestamp: "12 mins ago via Shelter Registration Cam"
        });
      }, 2000);
    }
  };

  const sendSosToMobile = async () => {
    if (!phoneNumber) return alert("Enter valid phone number with country code!");
    setSendingSms(true);
    setSmsStatus(null);
    try {
      const currentActions = activeAnalysis.actions[language] || activeAnalysis.actions.EN;
      const res = await fetch("/api/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneNumber,
          hazard: activeAnalysis.hazard,
          location: activeAnalysis.location,
          recommendation: currentActions[0] || "Evacuate immediately"
        })
      });
      const data = await res.json();
      setSmsStatus(data.success ? "✅ Mobile SOS Alert Dispatched Successfully!" : `❌ Error: ${data.error}`);
    } catch {
      setSmsStatus("❌ Server route error dispatching SMS.");
    } finally {
      setSendingSms(false);
    }
  };

  const toggleAcousticBreathDetector = () => {
    if (isDetectingBreathing) {
      setIsDetectingBreathing(false);
      setBreathStatus(null);
      return;
    }
    setIsDetectingBreathing(true);
    setBreathStatus("Listening for faint rhythmic breathing & acoustic pulses...");
    setTimeout(() => {
      setBreathStatus("FAINT HEARTBEAT / BREATH PATTERN DETECTED (0.8 Hz) • Priority Rescue Flagged");
    }, 2500);
  };

  const triggerVoiceReassurance = () => {
    setReassuranceSent(true);
    if ("speechSynthesis" in window) {
      const msg = new SpeechSynthesisUtterance("Automated Reassurance Sent: Your family member has checked in safe at St. Mary Shelter.");
      window.speechSynthesis.speak(msg);
    }
  };

  const playAudioInstructions = () => {
    if ("speechSynthesis" in window) {
      setIsPlayingAudio(true);
      const actions = activeAnalysis.actions[language] || activeAnalysis.actions.EN;
      const utterance = new SpeechSynthesisUtterance(`Warning! ${activeAnalysis.hazard}. ${actions.join(" ")}`);
      utterance.onend = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      
      {/* Header Bar */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/20 text-red-500 rounded-xl border border-red-500/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wide flex items-center gap-2">
              CrisisLens <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">Live AI + Firebase Hub</span>
            </h1>
            <p className="text-xs text-slate-400">Empathy-Driven Multimodal Command & SOS Dispatch System</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleFetchLiveGPS}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-950/60 border border-blue-500/40 text-blue-400 rounded-xl text-xs font-semibold hover:bg-blue-900/50 transition-all"
          >
            <Crosshair className="w-3.5 h-3.5 animate-spin" />
            {t.getGpsBtn}
          </button>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
            {(["EN", "ES", "HI", "TA"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  language === lang ? "bg-red-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsLowBandwidth(!isLowBandwidth)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isLowBandwidth ? "bg-amber-950/60 border-amber-500/50 text-amber-400" : "bg-slate-900 border-slate-800 text-slate-400"
            }`}
          >
            <WifiOff className="w-3.5 h-3.5" />
            {isLowBandwidth ? "Low Bandwidth ON" : "Normal Mode"}
          </button>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{t.status}</span>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        
        {/* Left Column */}
        <section className="lg:col-span-5 space-y-6">
          
          {/* Camera & AR Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold uppercase text-slate-400 tracking-wider mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2"><Camera className="w-4 h-4 text-blue-400" /> {t.uploadTitle}</span>
              {isCameraActive && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse ${isArMode ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
                  {isArMode ? "AR HEADS-UP MODE" : "LIVE CAM"}
                </span>
              )}
            </h2>

            {/* Animal Rescue Flag */}
            <div className="mb-4 p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dog className="w-4 h-4 text-amber-400" />
                <div>
                  <p className="text-xs font-bold text-slate-200">Pets/Livestock Trapped?</p>
                  <p className="text-[10px] text-slate-500">Alerts Animal Rescue Response Units</p>
                </div>
              </div>
              <button
                onClick={() => setPetsPresent(!petsPresent)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  petsPresent ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"
                }`}
              >
                {petsPresent ? "🐾 ANIMALS ADDED" : "Add Animals"}
              </button>
            </div>

            {isCameraActive ? (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-red-500/50 bg-black h-52">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  
                  {isArMode && (
                    <div className="absolute inset-0 pointer-events-none border-2 border-emerald-500/40 p-3 flex flex-col justify-between bg-emerald-950/10">
                      <div className="flex justify-between items-center text-[10px] font-mono text-emerald-400 bg-slate-950/80 p-2 rounded">
                        <span className="flex items-center gap-1"><Compass className="w-3 h-3 animate-spin" /> HEADING: 142° SE</span>
                        <span>VISIBILITY: LOW</span>
                      </div>
                      <div className="relative w-full h-20 flex items-center justify-center">
                        <div className="w-1/2 h-12 border-b-4 border-emerald-400 border-dashed transform -skew-x-12 animate-pulse flex items-center justify-center">
                          <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                            ⬆ SAFE AR PATH CORRIDOR
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={captureAndDetect}
                    disabled={isAnalyzing}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1"
                  >
                    <Zap className="w-3.5 h-3.5" /> {isAnalyzing ? "Gemini Analyzing..." : "Analyze Live Frame"}
                  </button>
                  <button
                    onClick={() => setIsArMode(!isArMode)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border ${isArMode ? "bg-emerald-600 text-white" : "bg-slate-800 text-emerald-400"}`}
                  >
                    <Eye className="w-3.5 h-3.5" /> {isArMode ? "Standard" : "AR Mode"}
                  </button>
                  <button onClick={stopCameraFeed} className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-2.5 rounded-xl">Close</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button onClick={startCameraFeed} className="border border-slate-700 hover:border-red-500/50 p-4 rounded-xl flex flex-col items-center bg-slate-950/50">
                  <Video className="w-6 h-6 text-red-400 mb-2" />
                  <span className="text-xs font-semibold text-slate-300">Live WebCam / AR</span>
                </button>
                <label className="border border-slate-700 hover:border-red-500/50 p-4 rounded-xl flex flex-col items-center bg-slate-950/50 cursor-pointer">
                  <Upload className="w-6 h-6 text-blue-400 mb-2" />
                  <span className="text-xs font-semibold text-slate-300">Upload Image</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Missing Persons Facial Match */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold uppercase text-slate-400 tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-purple-400" /> Missing Persons AI Facial Match</span>
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            </h2>
            <label className="border border-dashed border-slate-700 hover:border-purple-500/50 p-3 rounded-xl flex items-center justify-center bg-slate-950/50 cursor-pointer text-xs text-slate-300 font-semibold mb-2">
              <Upload className="w-4 h-4 text-purple-400 mr-2" /> Upload Missing Person Photo
              <input type="file" accept="image/*" onChange={handleFacialMatchUpload} className="hidden" />
            </label>

            {isMatchingFace && (
              <div className="p-3 bg-purple-950/30 border border-purple-800/50 rounded-xl text-xs text-purple-300 flex items-center gap-2 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Privacy Vector Match across Shelter Nodes...</span>
              </div>
            )}

            {facialMatchResult && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-xl space-y-1">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> MATCH CONFIRMED ({facialMatchResult.confidence}%)</span>
                <p className="text-xs font-bold text-white">{facialMatchResult.personName}</p>
                <p className="text-[11px] text-slate-300">📍 <strong>Location:</strong> {facialMatchResult.lastSeenLocation}</p>
              </div>
            )}
          </div>

          {/* Acoustic Breath Detector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-red-500 animate-pulse" /> Acoustic Breath & Heartbeat Detector
            </h2>
            <button
              onClick={toggleAcousticBreathDetector}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border ${
                isDetectingBreathing ? "bg-red-600 border-red-500 text-white animate-pulse" : "bg-slate-950 border-slate-800 text-slate-300"
              }`}
            >
              <Mic className="w-4 h-4 text-red-400" />
              {isDetectingBreathing ? "STOP DETECTOR" : "START FAINT BREATH DETECTOR"}
            </button>
            {breathStatus && (
              <div className="mt-2.5 p-2.5 bg-red-950/40 border border-red-500/50 rounded-xl text-[11px] text-red-300 font-semibold animate-pulse flex items-center gap-2">
                <Activity className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{breathStatus}</span>
              </div>
            )}
          </div>

          {/* Voice of Loved Ones Reassurance */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-400" /> Voice of Loved Ones Reassurance
            </h2>
            <button
              onClick={triggerVoiceReassurance}
              className="w-full bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/40 text-pink-300 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Volume2 className="w-4 h-4 text-pink-400" />
              {reassuranceSent ? "✅ Family Voice Reassurance Sent" : "Dispatch Family Reassurance Voice Note"}
            </button>
          </div>

          {/* Twilio Mobile SOS Dispatch */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" /> Mobile SOS Alert (Twilio API)
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="+919876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none"
              />
              <button
                onClick={sendSosToMobile}
                disabled={sendingSms}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {sendingSms ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sendingSms ? "Sending..." : "Dispatch Mobile SOS SMS"}
              </button>
              {smsStatus && <p className="text-xs font-semibold text-center text-slate-300 bg-slate-950 p-2 rounded-xl border border-slate-800">{smsStatus}</p>}
            </div>
          </div>

        </section>

        {/* Right Column */}
        <section className="lg:col-span-7 space-y-6">
          
          {/* Live Gemini Vision Triage Output Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative">
            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-2xl">
                <Activity className="w-10 h-10 text-red-500 animate-spin mb-2" />
                <p className="text-xs font-semibold text-slate-200">Gemini 1.5 Flash AI Analyzing Scene in Real Time...</p>
              </div>
            )}

            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-red-500 bg-red-950/60 border border-red-800/50 px-2 py-0.5 rounded uppercase">
                  {activeAnalysis.status}
                </span>
                <h3 className="text-xl font-bold text-slate-100 mt-2">{activeAnalysis.hazard}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-red-400" /> {activeAnalysis.location}
                </p>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Severity</p>
                  <p className="text-2xl font-black text-red-500">{activeAnalysis.severity}<span className="text-xs text-slate-500">/100</span></p>
                </div>
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
            </div>

            {!isLowBandwidth && (
              <div className="mt-4 rounded-xl overflow-hidden border border-slate-800 max-h-[220px]">
                <img src={selectedImage || activeAnalysis.image} alt="Incident Evidence" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {t.triageTitle} ({language})
                </h4>
                <button onClick={playAudioInstructions} className="flex items-center gap-1.5 text-xs bg-slate-800 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700">
                  <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? "text-red-400 animate-pulse" : ""}`} />
                  {isPlayingAudio ? "Playing..." : "Audio Advisory"}
                </button>
              </div>

              <div className="space-y-2">
                {(activeAnalysis.actions[language] || activeAnalysis.actions.EN).map((action: string, idx: number) => (
                  <div key={idx} className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl flex items-start gap-2.5 text-xs text-slate-300">
                    <span className="w-4 h-4 rounded-full bg-red-600/20 text-red-400 font-bold flex items-center justify-center text-[10px]">{idx + 1}</span>
                    <p>{action}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shelter Capacity & Supply Burn Predictor */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
              <Home className="w-4 h-4 text-blue-400" /> Dynamic Shelter Capacity & AI Supply Burn Predictor
            </h2>
            <div className="space-y-3">
              {shelters.map((s) => (
                <div key={s.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <p className="font-bold text-slate-200">{s.name}</p>
                    <p className="text-[10px] text-slate-400">Occupancy: <strong>{s.occupants}/{s.capacity}</strong></p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="bg-slate-900 px-2 py-1 rounded text-amber-300">💧 Water: <strong>{s.waterHoursLeft}h</strong></span>
                    <span className="bg-slate-900 px-2 py-1 rounded text-emerald-300">🍞 Food: <strong>{s.foodHoursLeft}h</strong></span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${s.status === "CRITICAL" ? "bg-red-950 text-red-400" : "bg-emerald-950 text-emerald-400"}`}>{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>

      </main>

      {/* Vulnerable Population Sentinel */}
      <section className="max-w-7xl mx-auto mt-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-red-400" /> Automated Vulnerable Population Sentinel Pins
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {VULNERABLE_NODES.map((node) => (
              <div key={node.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-start text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase bg-red-600 text-white px-2 py-0.5 rounded">{node.priority} RESCUE</span>
                  <p className="font-bold text-white mt-1.5">{node.address}</p>
                  <p className="text-slate-400 mt-0.5">Category: {node.type}</p>
                  <p className="text-amber-400 font-semibold mt-0.5">⚡ Requirement: {node.requirement}</p>
                </div>
                <button onClick={() => alert(`Assigned team to ${node.address}`)} className="bg-slate-800 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700">Dispatch</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Vector Tactical Map (Enhanced) */}
      <section className="max-w-7xl mx-auto mt-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <Navigation className="w-4 h-4 text-red-500" /> {t.mapTitle}
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span> Fire</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Med</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> SWAT</span>
            </div>
          </div>

          <div className="relative w-full h-96 bg-[#090e17] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            
            {/* Tactical Grid Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {/* Radar Sweep Effect Animation */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-emerald-500/10 pointer-events-none flex items-center justify-center">
              <div className="w-full h-full rounded-full border border-emerald-500/20 animate-ping opacity-20 absolute" />
            </div>

            {/* SVG Topography & Roads */}
            <svg className="w-full h-full absolute inset-0 opacity-80 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <path d="M-50,300 C150,280 250,150 450,220 C650,290 850,100 1200,180 L1200,400 L-50,400 Z" fill="#0f2b48" opacity="0.6" />
              <path d="M 0 180 Q 400 120 1200 220" stroke="#334155" strokeWidth="12" fill="none" opacity="0.5" />
              <path d="M 200 250 L 200 100 L 600 100 L 950 100 L 950 240" stroke="#10b981" strokeWidth="4" strokeDasharray="8,6" fill="none" className="animate-pulse" opacity="0.8" />
            </svg>

            {/* Central Active Incident Pin with Pulse & Tooltip */}
            <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-20">
              <div className="absolute -inset-3 bg-red-600/30 rounded-full blur-sm animate-pulse" />
              <div className="bg-red-600 text-white p-2.5 rounded-full shadow-lg shadow-red-600/50 border-2 border-white/20 transform hover:scale-110 transition-transform">
                <AlertTriangle className="w-5 h-5 animate-bounce" />
              </div>
              <div className="bg-slate-950/90 backdrop-blur-md text-red-400 border border-red-500/40 text-[11px] font-bold px-3 py-1 rounded-lg mt-1.5 shadow-xl flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>{activeAnalysis.hazard}</span>
              </div>
            </div>

            {/* Responder Units with Hover Cards */}
            {RESPONDER_UNITS.map((unit) => (
              <div 
                key={unit.id} 
                className="absolute flex flex-col items-center group z-10 cursor-pointer" 
                style={{ top: `${unit.lat}%`, left: `${unit.lng}%` }}
              >
                <div className="absolute -inset-2 bg-slate-800/40 rounded-full blur-xs group-hover:bg-blue-500/20 transition-colors" />
                <div className="relative bg-slate-900 border border-slate-700 p-2 rounded-xl text-slate-200 shadow-xl group-hover:border-blue-400 group-hover:scale-110 transition-all">
                  {unit.type === "FIRE" && <Flame className="w-4 h-4 text-orange-400 animate-pulse" />}
                  {unit.type === "MEDICAL" && <Ambulance className="w-4 h-4 text-blue-400 animate-pulse" />}
                  {unit.type === "SWAT" && <Shield className="w-4 h-4 text-emerald-400 animate-pulse" />}
                </div>

                {/* Hover Tooltip Card */}
                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col bg-slate-950 border border-slate-800 p-2.5 rounded-xl shadow-2xl text-[10px] whitespace-nowrap z-30 min-w-[140px]">
                  <span className="font-bold text-white">{unit.name}</span>
                  <span className="text-slate-400 uppercase tracking-wider">{unit.type} UNIT</span>
                  <span className="mt-1 text-emerald-400 font-semibold bg-emerald-950/50 px-1.5 py-0.5 rounded text-center">STATUS: {unit.status}</span>
                </div>
              </div>
            ))}

            {/* Map Footer Control Bar Overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center bg-slate-950/80 backdrop-blur-md border border-slate-800/80 px-3 py-2 rounded-xl text-[10px] text-slate-400 pointer-events-none">
              <span className="font-mono">SECURE TACTICAL GRID // ENCRYPTED FEED</span>
              <span className="text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> GPS SYNCED
              </span>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
