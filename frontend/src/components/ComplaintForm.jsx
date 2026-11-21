/**
 * CivicLens Citizen Complaint Intake Form
 * Multilingual complaint submission, client-side photo validation,
 * geolocation detection, and immediate triage confirmation.
 */

import React, { useState, useEffect } from 'react';
import { submitComplaint } from '../services/api';
import SeverityBadge from './SeverityBadge';
import { Camera, MapPin, AlertCircle, CheckCircle2, RefreshCw, Copy, Check, ArrowRight, X } from './Icons';

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
          lat: parseFloat(pos.coords.latitude.toFixed(6)),
          lon: parseFloat(pos.coords.longitude.toFixed(6)),
        });
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        setClientError('Unable to retrieve GPS coordinates. Please type the location manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setClientError(null);

    // Validation: At least one of text or photo required
    const cleanText = text.trim();
    if (!cleanText && !photo) {
      setClientError('Please provide a complaint description or attach a photograph.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (cleanText) formData.append('raw_text', cleanText);
      if (locationText.trim()) formData.append('location_text', locationText.trim());
      if (coords.lat !== null) formData.append('latitude', coords.lat.toString());
      if (coords.lon !== null) formData.append('longitude', coords.lon.toString());
      if (contactNumber.trim()) formData.append('contact_number', contactNumber.trim());
      if (photo) formData.append('photo', photo);

      const result = await submitComplaint(formData);
      setSuccessResult(result);
      // Reset form fields
      setText('');
      setPhoto(null);
      setPhotoPreview(null);
      setLocationText('');
      setCoords({ lat: null, lon: null });
      setContactNumber('');
    } catch (err) {
      setClientError(err.message || 'An error occurred while submitting your grievance.');
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm font-medium">
            You appear to be offline. Please verify your internet connection before submitting.
          </p>
        </div>
      )}

      {/* Success Confirmation Card */}
      {successResult && (
        <div className="mb-8 p-6 rounded-lg bg-emerald-50 border border-emerald-300 dark:bg-emerald-950/70 dark:border-emerald-800 text-slate-900 dark:text-slate-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-emerald-950 dark:text-emerald-100">
                  Grievance Registered Successfully
                </h2>
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  Automated triage complete. Your complaint has been routed to the relevant municipal department.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSuccessResult(null)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-white dark:bg-slate-900 p-4 rounded-lg border border-emerald-200 dark:border-emerald-900">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Ticket Reference ID:</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono font-bold text-base text-blue-700 dark:text-blue-300">
                  {successResult.id}
                </span>
                <button
                  onClick={handleCopyId}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                  title="Copy Ticket ID"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Assigned Priority:</span>
              <div className="mt-1">
                <SeverityBadge severity={successResult.severity} />
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Detected Category:</span>
              <p className="font-medium capitalize text-slate-800 dark:text-slate-200 mt-0.5">
                {successResult.category}
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Routed Department:</span>
              <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                {successResult.primary_department}
              </p>
            </div>

            {successResult.detected_language && successResult.detected_language !== 'English' && (
              <div className="sm:col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Input Language ({successResult.detected_language}) Translated to English:
                </span>
                <p className="text-xs italic text-slate-700 dark:text-slate-300 mt-0.5">
                  "{successResult.translated_text}"
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <button
              onClick={() => onTrackTicket && onTrackTicket(successResult.id)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-700 text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span>Track Ticket Live</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSuccessResult(null)}
              className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Submit another complaint
            </button>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Register a Civic Complaint
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Report road hazards, garbage, drainage issues, water supply failures, or electrical faults in any language.
          </p>
        </div>

        {clientError && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-900 border border-red-300 dark:bg-red-950/70 dark:text-red-200 dark:border-red-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">Submission Error</p>
              <p className="mt-0.5">{clientError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Complaint Description Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="raw_text" className="block text-sm font-medium text-slate-900 dark:text-slate-100">
                Complaint Description
              </label>
              <span className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                English, Hindi, Kannada, Tamil, Telugu, Marathi, Bengali, or Hinglish
              </span>
            </div>
            <textarea
              id="raw_text"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe the issue in your own words (e.g., 'ರಸ್ತೆಯಲ್ಲಿ ದೊಡ್ಡ ಗುಂಡಿ ಬಿದ್ದಿದೆ' or 'Main road pe khadda hai aur paani beh raha hai')..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              At least one of complaint text or an attached photo is required.
            </p>
          </div>

          {/* Photo Upload Input */}
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
              On-Site Photograph (Optional, max 5 MB)
            </label>
            {!photoPreview ? (
              <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <Camera className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  Upload an image or take a photo
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  JPEG or PNG up to 5 MB. Server re-encodes photos to strip metadata safely.
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative inline-block border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <img
                  src={photoPreview}
                  alt="Complaint Preview"
                  className="h-44 w-auto object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-900/80 text-white hover:bg-red-600 transition-colors"
                  title="Remove photograph"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Location Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="location_text" className="block text-sm font-medium text-slate-900 dark:text-slate-100">
                  Location or Landmark (Optional)
                </label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={geoLoading}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 dark:text-blue-400 hover:underline"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {geoLoading ? 'Detecting GPS...' : 'Use Current GPS'}
                </button>
              </div>
              <input
                id="location_text"
                type="text"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="e.g. 100 Feet Road, opposite Indiranagar Metro Station"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {coords.lat !== null && (
              <div className="sm:col-span-2 p-2.5 rounded bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
                <span>
                  GPS Coordinates Attached: {coords.lat}, {coords.lon}
                </span>
                <button
                  type="button"
                  onClick={() => setCoords({ lat: null, lon: null })}
                  className="text-blue-700 hover:underline"
                >
                  Clear GPS
                </button>
              </div>
            )}
          </div>

          {/* Contact Number */}
          <div>
            <label htmlFor="contact_number" className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1.5">
              Citizen Contact Number (Optional)
            </label>
            <input
              id="contact_number"
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="+91 9876543210"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Protected by privacy controls. Contact details are never sent to external AI models.
            </p>
          </div>

          {/* Submit Action */}
          <div>
            <button
              type="submit"
              disabled={loading || isOffline}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg bg-blue-700 text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition-colors"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing & Classifying Grievance...</span>
                </>
              ) : (
                <span>Submit Grievance</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
