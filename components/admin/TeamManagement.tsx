"use client";

import React, { useState, useMemo } from "react";
import { Team } from "@/types";
import {
  createTeam,
  updateTeam,
  deleteTeam,
} from "@/lib/firebase/firestore";

interface TeamManagementProps {
  teams: Team[];
  onNotification?: (msg: string) => void;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({
  teams,
  onNotification,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Dynamic list of existing tracks in the system
  const existingTracks = useMemo(() => {
    const trackSet = new Set<string>();
    teams.forEach((t) => {
      if (t.track && t.track.trim()) {
        trackSet.add(t.track.trim());
      }
    });
    return Array.from(trackSet);
  }, [teams]);

  // New Team Form State
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamId, setNewTeamId] = useState("");
  const [newMembers, setNewMembers] = useState("");
  const [newTrack, setNewTrack] = useState("");
  const [newScore, setNewScore] = useState("0");
  const [newPoints, setNewPoints] = useState("0");

  const [isSaving, setIsSaving] = useState(false);

  const filteredTeams = teams.filter(
    (t) =>
      t.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.teamId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    const nextNum = teams.length + 1;
    const generatedId = `HT${String(nextNum).padStart(3, "0")}`;
    setNewTeamId(generatedId);
    setNewTeamName("");
    setNewMembers("");
    setNewTrack("");
    setNewScore("0");
    setNewPoints("0");
    setIsAddModalOpen(true);
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !newTeamId.trim()) return;

    setIsSaving(true);
    try {
      const memberList = newMembers
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean);

      await createTeam({
        teamId: newTeamId.trim().toUpperCase(),
        teamName: newTeamName.trim(),
        members: memberList,
        track: newTrack.trim() || "General Track",
        review1Score: 0,
        review2Score: 0,
        review3Score: 0,
        score: 0,
        points: Number(newPoints) || 0,
      });

      if (onNotification) onNotification(`Team "${newTeamName}" registered successfully!`);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to register new team.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;

    setIsSaving(true);
    try {
      await updateTeam(editingTeam.id || editingTeam.teamId, {
        teamName: editingTeam.teamName,
        track: editingTeam.track ? editingTeam.track.trim() : "General Track",
        members: editingTeam.members,
        score: Number(editingTeam.score) || 0,
        points: Number(editingTeam.points) || 0,
      });

      if (onNotification) onNotification(`Team "${editingTeam.teamName}" updated!`);
      setEditingTeam(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update team.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTeam = async (team: Team) => {
    if (!confirm(`Are you sure you want to delete "${team.teamName}" (${team.teamId})?`)) {
      return;
    }
    try {
      await deleteTeam(team.id || team.teamId);
      if (onNotification) onNotification(`Team "${team.teamName}" deleted.`);
    } catch (err) {
      console.error(err);
      alert("Failed to delete team.");
    }
  };

  return (
    <div className="rounded-3xl cyber-card border border-slate-800 p-6 sm:p-7 shadow-2xl font-sans">
      
      {/* Dynamic Datalist for Track Autocomplete */}
      <datalist id="dynamic-track-suggestions">
        {existingTracks.map((tr) => (
          <option key={tr} value={tr} />
        ))}
      </datalist>

      {/* Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 font-display">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md">
            <i className="bi bi-people-fill text-lg" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-wide text-white">
              Team Roster Management
            </h3>
            <p className="text-xs text-slate-400 font-mono-numbers">
              {teams.length} teams registered in competition database
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-display">
          {/* Add Team Button */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-cyan-950/40"
          >
            <i className="bi bi-plus-lg text-sm" />
            <span>Register Team</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-5">
        <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter registered teams by name or ID..."
          className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/60 shadow-sm font-sans"
        />
      </div>

      {/* Teams Table */}
      {teams.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs bg-slate-950/60 rounded-2xl border border-slate-800">
          <i className="bi bi-folder-plus text-3xl text-slate-600 mb-2 block" />
          <p className="font-semibold text-slate-300 text-sm font-display">No teams registered yet.</p>
          <p className="mt-1 text-slate-400">Click "Register Team" above to add official teams to your hackathon.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 font-display">
              <tr>
                <th className="p-3.5">Rank / ID</th>
                <th className="p-3.5">Team Name</th>
                <th className="p-3.5 hidden sm:table-cell">Track</th>
                <th className="p-3.5 hidden md:table-cell">Members</th>
                <th className="p-3.5 text-right">Score</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTeams.map((team) => (
                <tr key={team.id || team.teamId} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-3.5 font-mono-numbers font-bold text-slate-300">
                    #{team.rank || "-"} • <span className="text-cyan-400">{team.teamId}</span>
                  </td>
                  <td className="p-3.5 font-bold text-white font-display text-sm">
                    {team.teamName}
                  </td>
                  <td className="p-3.5 text-slate-300 hidden sm:table-cell">
                    {team.track || "General"}
                  </td>
                  <td className="p-3.5 text-slate-400 hidden md:table-cell">
                    {team.members?.length || 0} members
                  </td>
                  <td className="p-3.5 text-right font-mono-numbers font-bold text-white">
                    {team.score} <span className="text-slate-500 font-normal">({team.points} pts)</span>
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setEditingTeam(team)}
                        title="Edit Team"
                        className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center shadow-sm"
                      >
                        <i className="bi bi-pencil-square text-xs" />
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team)}
                        title="Delete Team"
                        className="p-2 rounded-xl bg-slate-950 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 flex items-center justify-center shadow-sm"
                      >
                        <i className="bi bi-trash-fill text-xs" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE TEAM MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl cyber-card border border-slate-800 p-6 sm:p-7 shadow-2xl">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <i className="bi bi-x-lg text-sm" />
            </button>

            <h4 className="text-lg font-black text-white uppercase tracking-wide mb-4 font-display">
              Register New Team
            </h4>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 font-display">
                  Team ID (e.g. HT001)
                </label>
                <input
                  type="text"
                  value={newTeamId}
                  onChange={(e) => setNewTeamId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs font-mono-numbers focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 font-display">
                  Team Name
                </label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Enter team name..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 font-display">
                  Track / Category
                </label>
                <input
                  type="text"
                  list="dynamic-track-suggestions"
                  value={newTrack}
                  onChange={(e) => setNewTrack(e.target.value)}
                  placeholder="Type track name (e.g. AI, Web3, FinTech)..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 font-display">
                  Members (comma-separated • 1st member = Team Leader)
                </label>
                <input
                  type="text"
                  value={newMembers}
                  onChange={(e) => setNewMembers(e.target.value)}
                  placeholder="e.g. Alex Rivera (Leader), Bob Smith, Charlie Lee, Dana Ray"
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 font-sans"
                />
                <p className="text-[11px] text-amber-400/90 mt-1 font-sans">
                  👑 Note: The 1st member listed will be displayed as the <strong>Team Leader</strong> on the leaderboard card.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 font-display">
                    Initial Score
                  </label>
                  <input
                    type="number"
                    value={newScore}
                    onChange={(e) => setNewScore(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs font-mono-numbers"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 font-display">
                    Initial Points
                  </label>
                  <input
                    type="number"
                    value={newPoints}
                    onChange={(e) => setNewPoints(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs font-mono-numbers"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 font-display">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-extrabold text-xs uppercase shadow-md"
                >
                  {isSaving ? "Saving..." : "Register Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TEAM MODAL */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl cyber-card border border-slate-800 p-6 sm:p-7 shadow-2xl">
            <button
              onClick={() => setEditingTeam(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <i className="bi bi-x-lg text-sm" />
            </button>

            <h4 className="text-lg font-black text-white uppercase tracking-wide mb-4 font-display">
              Edit Team: {editingTeam.teamName}
            </h4>

            <form onSubmit={handleUpdateTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 font-display">
                  Team Name
                </label>
                <input
                  type="text"
                  value={editingTeam.teamName}
                  onChange={(e) =>
                    setEditingTeam({ ...editingTeam, teamName: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 font-display">
                  Track / Category
                </label>
                <input
                  type="text"
                  list="dynamic-track-suggestions"
                  value={editingTeam.track || ""}
                  onChange={(e) =>
                    setEditingTeam({ ...editingTeam, track: e.target.value })
                  }
                  placeholder="Set track name..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 font-display">
                  Members (comma-separated • 1st member = Team Leader)
                </label>
                <input
                  type="text"
                  value={editingTeam.members?.join(", ") || ""}
                  onChange={(e) =>
                    setEditingTeam({
                      ...editingTeam,
                      members: e.target.value.split(",").map((m) => m.trim()),
                    })
                  }
                  placeholder="e.g. Alex Rivera (Leader), Bob Smith, Charlie Lee, Dana Ray"
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs font-sans"
                />
                <p className="text-[11px] text-amber-400/90 mt-1 font-sans">
                  👑 Note: The 1st member listed will be displayed as the <strong>Team Leader</strong> on the leaderboard card.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 font-display">
                <button
                  type="button"
                  onClick={() => setEditingTeam(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-rose-500 text-white font-extrabold text-xs uppercase shadow-md"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
