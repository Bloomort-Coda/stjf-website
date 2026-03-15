import React, { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext";

export default function ManageEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const { token } = useAuth();

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchEvents = () => {
    fetch("/api/events")
      .then((r) => r.json())
      .then(setEvents);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, event_date: date, location, description }),
      });
      if (!res.ok) throw new Error("Failed to create event");
      
      setName("");
      setDate("");
      setLocation("");
      setDescription("");
      fetchEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const confirmDelete = async () => {
    if (deletingId === null) return;
    await fetch(`/api/events/${deletingId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeletingId(null);
    fetchEvents();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-sans font-bold mb-2">
          Manage Events
        </h1>
        <p className="text-gray-500">
          Add and organize upcoming parish events.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] mb-10 shadow-sm space-y-6"
      >
        <h2 className="text-2xl font-sans font-bold mb-2">
          Create New Event
        </h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Event Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              placeholder="e.g. Sunday Mass"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Location
          </label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
            placeholder="e.g. Main Church"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
            placeholder="Brief description of the event..."
          ></textarea>
        </div>
        <div className="pt-2">
          <button
            type="submit"
            className="bg-[var(--primary)] text-[var(--primary-foreground)] px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Add Event
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div>
              <h3 className="font-sans font-bold text-xl mb-1">
                {event.name}
              </h3>
              <p className="text-sm text-gray-500 font-medium">
                {new Date(event.event_date).toLocaleString()} &bull;{" "}
                {event.location}
              </p>
            </div>
            <div className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity w-full md:w-auto flex justify-end">
              <button
                onClick={() => setDeletingId(event.id)}
                className="text-red-500 hover:bg-red-500 hover:text-white border border-transparent hover:border-red-500 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {deletingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] p-6 rounded-2xl max-w-sm w-full border border-[var(--border)]">
            <h3 className="text-xl font-bold mb-4">Delete Event?</h3>
            <p className="mb-6 opacity-80">
              Are you sure you want to delete this event? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-lg font-medium hover:bg-[var(--background)]"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
