"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Team } from "@/types";
import { subscribeToTeams, updateTeamProfile } from "@/lib/firebase/firestore";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

export default function TeamPortalPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tagline, setTagline] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const uploadFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = subscribeToTeams((loadedTeams) => {
      setTeams(loadedTeams);
    });
    return () => unsub();
  }, []);

  const selectedTeam = teams.find(
    (t) => t.id === selectedTeamId || t.teamId === selectedTeamId
  );

  const isSelectedTeamLocked = Boolean(
    selectedTeam && (selectedTeam.profileLocked || (selectedTeam.avatar && selectedTeam.avatar.trim()))
  );

  const handleSelectTeam = (team: Team) => {
    const id = team.id || team.teamId;
    setSelectedTeamId(id);
    setTagline(team.tagline || "");
    setUploadSuccess(null);
    setErrorMessage(null);
    setSelectedFile(null);
    setPreviewUrl(team.avatar || null);

    // Smooth scroll down to the upload drawer
    setTimeout(() => {
      uploadFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSelectedTeamLocked) return;
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please select a valid image file (PNG, JPG, WebP).");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("Image size must be under 10MB.");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMessage(null);
      setUploadSuccess(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) {
      setErrorMessage("Please select your team card from the grid first.");
      return;
    }

    if (isSelectedTeamLocked) {
      setErrorMessage("This profile has already been submitted and cannot be changed.");
      return;
    }

    if (!selectedFile && !selectedTeam.avatar) {
      setErrorMessage("Please select a team photo before submitting.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    try {
      let avatarUrl = selectedTeam.avatar || "";

      // If a new photo file was chosen, upload it
      if (selectedFile) {
        const { url } = await uploadImageToCloudinary(selectedFile);
        avatarUrl = url;
      }

      const targetId = selectedTeam.id || selectedTeam.teamId;
      await updateTeamProfile(targetId, {
        avatar: avatarUrl,
        tagline: tagline.trim(),
        profileLocked: true,
      });

      setUploadSuccess(
        `Success! ${selectedTeam.teamName}'s profile photo and punchline have been submitted and locked. It is now live across the leaderboard and team cards.`
      );
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to update profile. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const selectedLeader =
    selectedTeam?.members && selectedTeam.members.length > 0
      ? selectedTeam.members[0]
      : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="HackinTym'26 2.0" className="h-8 w-auto object-contain rounded-lg" />
            <div>
              <span className="font-black text-sm sm:text-base font-display text-white">
                HackinTym'26 2.0
              </span>
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block font-mono-numbers">
                TEAM PROFILE PORTAL
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all font-display"
          >
            <i className="bi bi-trophy-fill text-amber-400" />
            <span>View Leaderboard</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Banner Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3 font-display">
            <i className="bi bi-person-badge-fill" /> Official Team Registration Portal
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight">
            Team Photo & Tagline Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 font-sans">
            Find your team below, tap your team card to select it, then upload your team photo and add a punchline. Your photo will appear on the live leaderboard and your punchline will be showcased on your team card!
          </p>
        </div>

        {/* ─── SECTION 1: GRID OF ALL REGISTERED TEAMS ─── */}
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-white font-display flex items-center gap-2">
                <i className="bi bi-grid-fill text-cyan-400" />
                Step 1: Select Your Team ({teams.length} Teams Registered)
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Tap your team card to activate the upload form below
              </p>
            </div>

            {selectedTeam && (
              <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 px-3 py-1 rounded-xl font-display animate-fadeIn">
                Selected: {selectedTeam.teamName}
              </span>
            )}
          </div>

          {teams.length === 0 ? (
            <div className="py-16 text-center text-slate-500 rounded-3xl bg-slate-900/40 border border-slate-800 p-6">
              <i className="bi bi-people text-3xl text-slate-600 mb-2 block" />
              <p className="font-bold text-slate-300 font-display">No teams registered yet.</p>
              <p className="text-xs text-slate-500 mt-1">Teams will appear here once added by administrators.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {teams.map((team) => {
                const id = team.id || team.teamId;
                const isSelected = selectedTeamId === id || selectedTeamId === team.teamId;
                const leader = team.members && team.members.length > 0 ? team.members[0] : null;
                const isLocked = Boolean(team.profileLocked || (team.avatar && team.avatar.trim()));

                return (
                  <div
                    key={id}
                    onClick={() => handleSelectTeam(team)}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left relative flex flex-col justify-between ${
                      isSelected
                        ? "bg-cyan-950/40 border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)] ring-2 ring-cyan-500/20"
                        : "bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700 shadow-md"
                    }`}
                  >
                    <div>
                      {/* Top Bar of Card */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[11px] font-bold text-slate-400 font-display truncate">
                          {team.track || "General Track"}
                        </span>

                        {isSelected ? (
                          <span className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center text-xs font-black shadow">
                            <i className="bi bi-check-lg" />
                          </span>
                        ) : isLocked ? (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1 font-mono-numbers">
                            <i className="bi bi-lock-fill text-xs" /> Locked ✓
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 font-mono-numbers">
                            Awaiting Upload
                          </span>
                        )}
                      </div>

                      {/* Team Avatar & Name */}
                      <div className="flex items-center gap-3 mb-2.5">
                        {team.avatar ? (
                          <img
                            src={team.avatar}
                            alt={team.teamName}
                            className="w-11 h-11 rounded-xl object-cover border border-cyan-500/40 shadow-sm shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-sm text-cyan-400 font-mono-numbers shrink-0">
                            {team.teamName.substring(0, 2).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <h3 className="font-black text-white text-sm sm:text-base font-display truncate">
                            {team.teamName}
                          </h3>
                          <p className="text-[11px] text-slate-400 truncate font-sans">
                            {team.track || "General Track"}
                          </p>
                        </div>
                      </div>

                      {/* Team Leader Name */}
                      {leader && (
                        <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-amber-300 font-sans flex items-center gap-1.5 truncate">
                          <span className="text-amber-400">👑</span>
                          <span className="truncate">
                            Leader: <strong className="text-white font-medium">{leader}</strong>
                          </span>
                        </div>
                      )}

                      {/* Tagline Preview (if exists) */}
                      {team.tagline && (
                        <p className="mt-2 text-[11px] text-cyan-300/80 italic truncate font-sans">
                          "{team.tagline}"
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/60 text-right">
                      <span className={`text-[10px] font-black uppercase tracking-wider font-display ${isSelected ? "text-cyan-400" : isLocked ? "text-amber-400/80" : "text-slate-500"}`}>
                        {isSelected ? (isLocked ? "Selected (Locked) ✓" : "Selected ✓") : (isLocked ? "View Profile 🔒" : "Tap to Select →")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── SECTION 2: UPLOAD & PUNCHLINE FORM (FOCUSED DRAWER) ─── */}
        <div ref={uploadFormRef}>
          {selectedTeam ? (
            <div className="rounded-3xl bg-slate-900 border-2 border-cyan-500/50 shadow-2xl p-6 sm:p-9 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 font-display">
                      Step 2: Team Profile & Punchline
                    </span>
                    {isSelectedTeamLocked && (
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1 font-mono-numbers">
                        <i className="bi bi-lock-fill text-xs" /> Profile Locked
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight mt-0.5">
                    {selectedTeam.teamName}
                  </h2>
                  {selectedLeader && (
                    <p className="text-xs text-amber-300 mt-1 flex items-center gap-1 font-sans">
                      👑 Team Leader: <strong className="text-white">{selectedLeader}</strong>
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTeamId("")}
                  className="self-start sm:self-auto text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-display"
                >
                  Change Team
                </button>
              </div>

              {/* Status Banner */}
              {isSelectedTeamLocked ? (
                <div className="mb-6 p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-300 text-xs sm:text-sm font-semibold flex items-center gap-3.5 shadow-lg">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 text-lg shrink-0">
                    <i className="bi bi-shield-lock-fill" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-amber-200 uppercase tracking-wide font-display">
                      Profile Submitted & Locked
                    </p>
                    <p className="text-xs text-amber-300/90 mt-0.5 font-sans">
                      Notice: This team profile has already been submitted and locked. Once submitted, profile photos and taglines cannot be changed. The photo and punchline are actively displayed on the official leaderboard.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs flex items-center gap-3 font-sans">
                  <i className="bi bi-info-circle-fill text-sky-400 text-base shrink-0" />
                  <span>
                    <strong>Important Notice:</strong> Once submitted, your team profile photo and tagline cannot be changed. Please verify before clicking submit.
                  </span>
                </div>
              )}

              {uploadSuccess && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-3 shadow-md">
                  <i className="bi bi-check-circle-fill text-2xl text-emerald-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold">{uploadSuccess}</p>
                    <Link
                      href="/"
                      className="text-emerald-400 hover:underline text-xs inline-flex items-center gap-1 mt-1 font-bold"
                    >
                      See team on Live Leaderboard <i className="bi bi-arrow-right" />
                    </Link>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-3 shadow-md">
                  <i className="bi bi-exclamation-triangle-fill text-2xl text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* 1. Team Photo Upload */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2 font-display">
                    Team Profile Photo / Avatar {isSelectedTeamLocked && <span className="text-amber-400 lowercase font-mono-numbers">(locked)</span>}
                  </label>

                  {isSelectedTeamLocked ? (
                    <div className="border border-slate-800 rounded-2xl p-6 sm:p-8 text-center bg-slate-950/60 relative">
                      {previewUrl ? (
                        <div className="flex flex-col items-center gap-3">
                          <img
                            src={previewUrl}
                            alt="Locked Profile"
                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-amber-400/80 shadow-xl"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-200">
                              Official Team Photo Active
                            </p>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 mt-1 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30 font-mono-numbers">
                              <i className="bi bi-lock-fill text-xs" /> Profile Locked — Cannot be changed
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">No photo uploaded.</p>
                      )}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 sm:p-8 text-center bg-slate-950/60 transition-colors cursor-pointer relative">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      />

                      {previewUrl ? (
                        <div className="flex flex-col items-center gap-3">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-cyan-400 shadow-xl"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-200">
                              {selectedFile ? selectedFile.name : "Current Photo Active"}
                            </p>
                            <p className="text-[11px] text-cyan-400 mt-0.5">Click or drag a new picture to change</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-2xl mb-1">
                            <i className="bi bi-image" />
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-slate-200">
                            Click to browse or drag & drop team picture
                          </p>
                          <p className="text-[11px] text-slate-500">
                            PNG, JPG, or WebP up to 10MB • Square crop recommended
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Team Tagline / Punchline Input */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5 font-display flex items-center justify-between">
                    <span>Team Tagline / Punchline</span>
                    <span className="text-[10px] text-cyan-400 font-sans normal-case">
                      Displayed on your team card
                    </span>
                  </label>
                  <div className="relative">
                    <i className="bi bi-quote absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400 text-lg pointer-events-none" />
                    <input
                      type="text"
                      maxLength={120}
                      disabled={isSelectedTeamLocked}
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder={isSelectedTeamLocked ? "No tagline set" : "e.g. Innovate. Elevate. Dominate."}
                      className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950 border text-xs sm:text-sm font-sans ${
                        isSelectedTeamLocked
                          ? "border-slate-800 text-slate-400 cursor-not-allowed bg-slate-950/60"
                          : "border-slate-800 focus:border-cyan-500 text-white focus:outline-none shadow-sm"
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 font-sans">
                    {isSelectedTeamLocked
                      ? "This tagline is locked and displayed on the official team info card."
                      : "A catchy slogan or punchline for your team (max 120 characters)."}
                  </p>
                </div>

                {/* 3. Submit or Locked Button */}
                {isSelectedTeamLocked ? (
                  <div className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-slate-900 border border-slate-800 text-amber-300 font-bold text-xs sm:text-sm uppercase tracking-wider cursor-not-allowed font-display shadow-inner">
                    <i className="bi bi-lock-fill text-amber-400" />
                    <span>Profile Locked — Submitted & Cannot Be Modified</span>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-rose-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-cyan-950/40 disabled:opacity-40 disabled:cursor-not-allowed font-display"
                  >
                    {isUploading ? (
                      <>
                        <i className="bi bi-arrow-repeat animate-spin text-base" />
                        <span>Saving & Syncing to Live Leaderboard...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2-circle text-lg" />
                        <span>Submit & Lock Team Profile</span>
                      </>
                    )}
                  </button>
                )}
              </form>
            </div>
          ) : (
            <div className="rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 p-8 text-center text-slate-500">
              <i className="bi bi-arrow-up-circle text-2xl mb-2 block text-cyan-400/60" />
              <p className="text-sm font-bold text-slate-300 font-display">
                Select your team from the grid above to upload your photo and punchline.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 font-display mt-8">
        HackinTym'26 2.0 • Official Team Profile & Avatar Portal
      </footer>
    </div>
  );
}
