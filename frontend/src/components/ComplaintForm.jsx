/**
 * CivicLens Citizen Complaint Intake Form
 * Multilingual complaint submission, client-side photo validation,
 * geolocation detection, and immediate AI triage confirmation.
 * Follows Charcoal Black (#171717), Forest Green (#06110C), and Crimson Red (#A31C1B) palette.
 */

import React, { useState, useEffect } from 'react';
import { submitComplaint } from '../services/api';
import SeverityBadge from './SeverityBadge';
import { Camera, MapPin, AlertCircle, CheckCircle2, RefreshCw, Copy, Check, ArrowRight, X } from './Icons';
import LogoLoop from './reactbits/LogoLoop';

export default function ComplaintForm({ onTrackTicket }) {
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [locationText, setLocationText] = useState('');
  const [coords, setCoords] = useState({ lat: null, lon: null });
  const [contactNumber, setContactNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [clientError, setClientError] = useState(null);
  const [successResult, setSuccessResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handlePhotoChange = (e) => {
    setClientError(null);
    const file = e.target.files[0];
    if (!file) return;

    // Client-side file type validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setClientError('Invalid file type. Please upload a JPEG or PNG image.');
      return;
    }

    // Client-side 5 MB file size limit
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setClientError(`Photo is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 5 MB.`);
      return;
    }

    setPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setClientError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    setClientError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        });
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        setClientError(`Failed to fetch location: ${err.message}. Please enter landmark text manually.`);
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setClientError(null);

    // Business validation: At least one of text or photo is required
    if (!text.trim() && !photo) {
      setClientError('Please provide a complaint description, a photo, or both.');
      return;
    }

    setLoading(true);
    try {
      const data = await submitComplaint({
        text: text.trim(),
        photo,
        locationText: locationText.trim(),
        latitude: coords.lat,
        longitude: coords.lon,
        contactNumber: contactNumber.trim()
      });
      setSuccessResult(data);
      // Reset form
      setText('');
      setPhoto(null);
      setPhotoPreview(null);
      setLocationText('');
      setCoords({ lat: null, lon: null });
      setContactNumber('');
    } catch (err) {
      setClientError(err.message || 'Failed to submit complaint. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = () => {
    if (successResult) {
      navigator.clipboard.writeText(successResult.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Municipal department loop
  const partnerAgencies = [
    { title: "BBMP Roads", node: <span className="px-3 py-1 rounded bg-[#171717] border border-[#2a2a2a] text-[11px] font-bold text-zinc-300 uppercase tracking-wider">BBMP Road Infrastructure</span> },
    { title: "BWSSB Water", node: <span className="px-3 py-1 rounded bg-[#171717] border border-[#2a2a2a] text-[11px] font-bold text-zinc-300 uppercase tracking-wider">BWSSB Water &amp; Drainage</span> },
    { title: "BESCOM Power", node: <span className="px-3 py-1 rounded bg-[#171717] border border-[#2a2a2a] text-[11px] font-bold text-zinc-300 uppercase tracking-wider">BESCOM Power Grid</span> },
    { title: "Fire Force", node: <span className="px-3 py-1 rounded bg-[#171717] border border-[#2a2a2a] text-[11px] font-bold text-zinc-300 uppercase tracking-wider">State Fire &amp; Emergency</span> },
    { title: "Waste Mgmt", node: <span className="px-3 py-1 rounded bg-[#171717] border border-[#2a2a2a] text-[11px] font-bold text-zinc-300 uppercase tracking-wider">Solid Waste Directorate</span> },
    { title: "Traffic", node: <span className="px-3 py-1 rounded bg-[#171717] border border-[#2a2a2a] text-[11px] font-bold text-zinc-300 uppercase tracking-wider">Traffic Safety Command</span> },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="mb-6 p-4 rounded-md bg-[#2d1b10] text-amber-200 border border-amber-800 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-400" />
          <p className="text-sm font-medium">
            You appear to be offline. Please verify your internet connection before submitting.
          </p>
        </div>
      )}

      {/* Success Confirmation Card */}
      {successResult && (
        <div className="mb-8 p-6 rounded-xl bg-[#171717] border border-[#A31C1B]/60 text-white shadow-2xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#A31C1B] text-white flex items-center justify-center font-bold shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight text-white">
                  Grievance Registered Successfully
                </h2>
                <p className="text-xs text-zinc-400">
                  Automated triage complete. Your complaint has been routed to the relevant municipal department.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSuccessResult(null)}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-[#0c0c0c] p-4 rounded-lg border border-[#242424]">
            <div>
              <span className="text-xs text-zinc-400">Ticket Reference ID:</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono font-bold text-base text-[#A31C1B]">
                  {successResult.id}
                </span>
                <button
                  onClick={handleCopyId}
                  className="p-1 rounded hover:bg-[#222] text-zinc-400"
                  title="Copy Ticket ID"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <span className="text-xs text-zinc-400">Assigned Priority:</span>
              <div className="mt-1">
                <SeverityBadge severity={successResult.severity} />
              </div>
            </div>

            <div>
              <span className="text-xs text-zinc-400">Detected Category:</span>
              <p className="font-bold capitalize text-white mt-0.5">
                {successResult.category}
              </p>
            </div>

            <div>
              <span className="text-xs text-zinc-400">Routed Department:</span>
              <p className="font-bold text-white mt-0.5">
                {successResult.primary_department}
              </p>
            </div>

            {successResult.detected_language && successResult.detected_language !== 'English' && (
              <div className="sm:col-span-2 pt-2 border-t border-[#242424]">
                <span className="text-xs text-zinc-400">
                  Input Language ({successResult.detected_language}) Translated to English:
                </span>
                <p className="text-xs italic text-zinc-300 mt-0.5">
                  "{successResult.translated_text}"
                </p>
              </div>
            )}

            {successResult.confidence_flag && (
              <div className="sm:col-span-2 p-2.5 rounded bg-[#241a10] border border-amber-900/60 text-xs text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Ticket flagged for officer manual inspection: low AI confidence or multi-modal review recommended.</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={() => onTrackTicket && onTrackTicket(successResult.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#A31C1B] hover:bg-[#871716] text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <span>Track Live Status</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Intake Form Card */}
      <div className="bg-[#171717]/85 backdrop-blur-md rounded-xl border border-[#2a2a2a]/80 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-[#242424]/80 bg-[#101010]/70">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#5cf6d9] animate-pulse shadow-[0_0_8px_#5cf6d9]" />
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#5cf6d9]">
              PUBLIC GRIEVANCE INTAKE
            </span>
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight text-white">
            Lodge a Municipal Grievance
          </h1>
          <p className="text-xs text-zinc-300 mt-1">
            Report road hazards, water leaks, garbage, fallen trees, or power failures. Submit in English or regional languages.
          </p>
        </div>


        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {clientError && (
            <div className="p-3.5 rounded-md bg-[#241212] border border-red-900 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#A31C1B] flex-shrink-0" />
              <span>{clientError}</span>
            </div>
          )}

          {/* Multilingual Description */}
          <div>
            <label htmlFor="complaint-text" className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Issue Description (English, Hindi, Kannada, Tamil, Telugu, etc.)
            </label>
            <textarea
              id="complaint-text"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe the problem in any Indian language. Example: 'Main road pe khadda hai bahut bada' or 'ಕಸದ ತೊಟ್ಟಿ ತುಂಬಿ ರಸ್ತೆಗೆ ಚೆಲ್ಲಿದೆ' or 'Street light broken near school'."
              className="w-full px-3.5 py-2.5 rounded-md bg-[#0c0c0c] border border-[#333] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#A31C1B] transition-colors resize-none"
            />
            <div className="flex justify-between items-center mt-1 text-[11px] text-zinc-500">
              <span>Automatic language detection &amp; translation</span>
              <span>{text.length} characters</span>
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Photo Upload (Optional, JPEG / PNG up to 5 MB)
            </label>
            
            {!photoPreview ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#333] hover:border-[#A31C1B] rounded-lg p-6 cursor-pointer bg-[#0c0c0c] transition-colors">
                <Camera className="w-8 h-8 text-zinc-500 mb-2" />
                <span className="text-xs font-semibold text-zinc-300">Click to upload photo of issue</span>
                <span className="text-[11px] text-zinc-500 mt-0.5">JPEG, PNG or WebP &bull; Maximum 5 MB</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative inline-block border border-[#333] rounded-lg overflow-hidden bg-[#0c0c0c]">
                <img
                  src={photoPreview}
                  alt="Upload preview"
                  className="h-44 w-auto object-cover max-w-full"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 hover:bg-[#A31C1B] text-white transition-colors"
                  title="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Location Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="location-text" className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Location or Landmark (Optional)
              </label>
              <input
                id="location-text"
                type="text"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="e.g. 5th Cross, Near Metro Station, Indiranagar"
                className="w-full px-3.5 py-2.5 rounded-md bg-[#0c0c0c] border border-[#333] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#A31C1B] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Map Coordinates
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={coords.lat ? `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}` : 'Coordinates not attached'}
                  className="w-full px-3 py-2.5 rounded-md bg-[#0c0c0c] border border-[#333] text-xs font-mono text-zinc-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={geoLoading}
                  className="px-3 py-2.5 rounded-md border border-[#333] hover:border-[#A31C1B] bg-[#0c0c0c] text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 whitespace-nowrap transition-colors"
                >
                  {geoLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5 text-[#A31C1B]" />
                  )}
                  <span>Detect</span>
                </button>
              </div>
            </div>
          </div>

          {/* Contact Information (Sanitized & Never sent to LLM) */}
          <div>
            <label htmlFor="contact-num" className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Contact Number (Optional &bull; Kept Strictly Private)
            </label>
            <input
              id="contact-num"
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="10-digit mobile number for status SMS"
              className="w-full px-3.5 py-2.5 rounded-md bg-[#0c0c0c] border border-[#333] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#A31C1B] transition-colors max-w-sm"
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              Safety notice: Contact numbers are never forwarded to AI inference models.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-md bg-[#A31C1B] hover:bg-[#871716] active:bg-[#6d1211] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Classifying &amp; Prioritizing Grievance...</span>
                </>
              ) : (
                <>
                  <span>Submit Grievance For Triage</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Looping Marquee */}
      <div className="mt-8">
        <div className="text-center mb-2.5">
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-zinc-500">
            Triage &bull; Routing to 7 Civic Jurisdictions
          </span>
        </div>
        <div style={{ height: '38px', position: 'relative', overflow: 'hidden' }}>
          <LogoLoop
            logos={partnerAgencies}
            speed={40}
            direction="left"
            logoHeight={28}
            gap={24}
            hoverSpeed={10}
            ariaLabel="Partner Civic Jurisdictions"
          />
        </div>
      </div>
    </div>
  );
}
