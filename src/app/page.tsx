"use client";

import { useEffect, useState, FormEvent } from "react";
import { getOrCreateVoterId } from "@/lib/voter";

type Destination = {
  id: string;
  name: string;
  type: string;
  imageUrl: string | null;
  propertyUrl: string | null;
  notes: string | null;
  airportCode: string | null;
  distanceFromAirportMiles: number | null;
  driveTimeFromAirportMin: number | null;
  avgHighTempF: number | null;
  avgLowTempF: number | null;
  weatherSummary: string | null;
  nightlyCostTotalUsd: number | null;
  nightlyCostPerPersonUsd: number | null;
  distanceFromHoustonMiles: number | null;
  flightDurationHours: number | null;
  distanceFromBostonMiles: number | null;
  flightDurationFromBostonHours: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  voteCount: number;
  hasVoted: boolean;
  createdAt: string;
  updatedAt: string;
};

type FormState = {
  name: string;
  type: string;
  address: string;
  imageUrl: string;
  propertyUrl: string;
  notes: string;
  airportCode: string;
  distanceFromAirportMiles: string;
  driveTimeFromAirportMin: string;
  avgHighTempF: string;
  avgLowTempF: string;
  weatherSummary: string;
  nightlyCostTotalUsd: string;
  nightlyCostPerPersonUsd: string;
  distanceFromHoustonMiles: string;
  flightDurationHours: string;
  distanceFromBostonMiles: string;
  flightDurationFromBostonHours: string;
  bedrooms: string;
  bathrooms: string;
};

const defaultFormState: FormState = {
  name: "",
  type: "RESORT",
  address: "",
  imageUrl: "",
  propertyUrl: "",
  notes: "",
  airportCode: "",
  distanceFromAirportMiles: "",
  driveTimeFromAirportMin: "",
  avgHighTempF: "",
  avgLowTempF: "",
  weatherSummary: "",
  nightlyCostTotalUsd: "",
  nightlyCostPerPersonUsd: "",
  distanceFromHoustonMiles: "",
  flightDurationHours: "",
  distanceFromBostonMiles: "",
  flightDurationFromBostonHours: "",
  bedrooms: "",
  bathrooms: ""
};

export default function HomePage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [lookingUp, setLookingUp] = useState<boolean>(false);
  const [form, setForm] = useState<FormState>(defaultFormState);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [voterId, setVoterId] = useState<string>("");
  const [sortBy, setSortBy] = useState<"recent" | "votes" | "name">("recent");

  async function fetchDestinations() {
    setLoading(true);
    const voterIdParam = voterId ? `?voterId=${voterId}` : "";
    const res = await fetch(`/api/destinations${voterIdParam}`);
    if (!res.ok) {
      setError("Failed to load destinations.");
      setLoading(false);
      return;
    }
    const data = (await res.json()) as Destination[];
    setDestinations(data);
    setLoading(false);
  }

  useEffect(() => {
    // Initialize voter ID
    const id = getOrCreateVoterId();
    setVoterId(id);
  }, []);

  useEffect(() => {
    if (voterId) {
      fetchDestinations();
    }
  }, [voterId]);

  function handleChange(
    field: keyof FormState,
    value: string
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleEdit(destination: Destination) {
    setForm({
      name: destination.name,
      type: destination.type,
      address: "",
      imageUrl: destination.imageUrl || "",
      propertyUrl: destination.propertyUrl || "",
      notes: destination.notes || "",
      airportCode: destination.airportCode || "",
      distanceFromAirportMiles: destination.distanceFromAirportMiles?.toString() || "",
      driveTimeFromAirportMin: destination.driveTimeFromAirportMin?.toString() || "",
      avgHighTempF: destination.avgHighTempF?.toString() || "",
      avgLowTempF: destination.avgLowTempF?.toString() || "",
      weatherSummary: destination.weatherSummary || "",
      nightlyCostTotalUsd: destination.nightlyCostTotalUsd?.toString() || "",
      nightlyCostPerPersonUsd: destination.nightlyCostPerPersonUsd?.toString() || "",
      distanceFromHoustonMiles: destination.distanceFromHoustonMiles?.toString() || "",
      flightDurationHours: destination.flightDurationHours?.toString() || "",
      distanceFromBostonMiles: destination.distanceFromBostonMiles?.toString() || "",
      flightDurationFromBostonHours: destination.flightDurationFromBostonHours?.toString() || "",
      bedrooms: destination.bedrooms?.toString() || "",
      bathrooms: destination.bathrooms?.toString() || "",
    });
    setEditingId(destination.id);
    setIsModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this destination?")) {
      return;
    }

    try {
      const res = await fetch(`/api/destinations/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.error || "Failed to delete destination.");
        return;
      }

      // Refresh the destinations list
      await fetchDestinations();
    } catch (err) {
      console.error(err);
      alert("Unexpected error while deleting destination.");
    }
  }

  async function handleLookup() {
    if (!form.address.trim()) {
      setError("Please enter an address first.");
      return;
    }

    setLookingUp(true);
    setError(null);

    try {
      const res = await fetch("/api/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ address: form.address })
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Failed to lookup location details.");
      } else {
        const data = await res.json();
        setForm((prev) => ({
          ...prev,
          airportCode: data.airportCode || prev.airportCode,
          distanceFromAirportMiles: data.distanceFromAirportMiles?.toString() || prev.distanceFromAirportMiles,
          driveTimeFromAirportMin: data.driveTimeFromAirportMin?.toString() || prev.driveTimeFromAirportMin,
          avgHighTempF: data.avgHighTempF?.toString() || prev.avgHighTempF,
          avgLowTempF: data.avgLowTempF?.toString() || prev.avgLowTempF,
          weatherSummary: data.weatherSummary || prev.weatherSummary,
          distanceFromHoustonMiles: data.distanceFromHoustonMiles?.toString() || prev.distanceFromHoustonMiles,
          flightDurationHours: data.flightDurationHours?.toString() || prev.flightDurationHours,
          distanceFromBostonMiles: data.distanceFromBostonMiles?.toString() || prev.distanceFromBostonMiles,
          flightDurationFromBostonHours: data.flightDurationFromBostonHours?.toString() || prev.flightDurationFromBostonHours
        }));
      }
    } catch (err) {
      console.error(err);
      setError("Unexpected error while looking up location.");
    } finally {
      setLookingUp(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("Destination name is required.");
      return;
    }

    setSaving(true);
    try {
      const url = editingId
        ? `/api/destinations/${editingId}`
        : "/api/destinations";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || `Failed to ${editingId ? 'update' : 'add'} destination.`);
      } else {
        setForm(defaultFormState);
        setError(null);
        setIsModalOpen(false);
        setEditingId(null);
        await fetchDestinations();
      }
    } catch (err) {
      console.error(err);
      setError("Unexpected error while saving.");
    } finally {
      setSaving(false);
    }
  }

  async function handleVote(destinationId: string) {
    if (!voterId) return;

    try {
      // Optimistic update
      setDestinations((prev) =>
        prev.map((d) => {
          if (d.id === destinationId) {
            return {
              ...d,
              hasVoted: !d.hasVoted,
              voteCount: d.hasVoted ? d.voteCount - 1 : d.voteCount + 1,
            };
          }
          return d;
        })
      );

      const res = await fetch(`/api/destinations/${destinationId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voterId }),
      });

      if (!res.ok) {
        // Revert optimistic update on error
        await fetchDestinations();
        console.error("Failed to vote");
      } else {
        const data = await res.json();
        // Update with server response
        setDestinations((prev) =>
          prev.map((d) => {
            if (d.id === destinationId) {
              return {
                ...d,
                hasVoted: data.hasVoted,
                voteCount: data.voteCount,
              };
            }
            return d;
          })
        );
      }
    } catch (err) {
      console.error(err);
      // Revert optimistic update on error
      await fetchDestinations();
    }
  }

  // Sort destinations based on selected option
  const sortedDestinations = [...destinations].sort((a, b) => {
    if (sortBy === "votes") return b.voteCount - a.voteCount;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Coalition Con 2026 Destinations</h1>
        <p>
          Add ideas, see them as cards, and compare tradeoffs side by side for our group of 15.
        </p>
      </header>

      {/* Add destination button */}
      <div style={{ marginBottom: 16 }}>
        <button
          className="button-primary"
          onClick={() => {
            setForm(defaultFormState);
            setEditingId(null);
            setIsModalOpen(true);
          }}
        >
          + Add destination
        </button>
      </div>

      {/* Modal overlay */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => {
          setIsModalOpen(false);
          setEditingId(null);
          setForm(defaultFormState);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit destination' : 'Add destination'}</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingId(null);
                  setForm(defaultFormState);
                }}
                type="button"
              >
                ×
              </button>
            </div>
            <p style={{ color: "#6b7280", fontSize: "0.8rem", marginBottom: 16 }}>
              Enter rough estimates; we can refine later.
            </p>
            {error && (
              <p style={{ color: "#dc2626", fontSize: "0.8rem", marginBottom: 8 }}>
                {error}
              </p>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
              <div className="form-field">
                <label>Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Tulum beachfront villa"
                  required
                />
              </div>

              <div className="form-field">
                <label>Type *</label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    handleChange("type", e.target.value)
                  }
                >
                  <option value="RESORT">Resort</option>
                  <option value="VACATION_RENTAL">Airbnb / Vacation Rental</option>
                </select>
              </div>

              <div className="form-field" style={{ gridColumn: "1 / -1" }}>
                <label>Address or Location</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    value={form.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="e.g. Cancun, Mexico or 123 Beach Rd, Tulum"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleLookup}
                    disabled={lookingUp || !form.address.trim()}
                    className="button-primary"
                    style={{ marginTop: 0, whiteSpace: "nowrap" }}
                  >
                    {lookingUp ? "Looking up..." : "Auto-fill details"}
                  </button>
                </div>
                <p style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: 4, marginBottom: 0 }}>
                  Enter a location and click "Auto-fill" to populate airport, weather, and distance info
                </p>
              </div>

              <div className="form-field">
                <label>Property URL</label>
                <input
                  value={form.propertyUrl}
                  onChange={(e) => handleChange("propertyUrl", e.target.value)}
                  placeholder="Airbnb or resort link"
                />
              </div>

              <div className="form-field">
                <label>Image URL</label>
                <input
                  value={form.imageUrl}
                  onChange={(e) => handleChange("imageUrl", e.target.value)}
                  placeholder="Optional photo URL"
                />
              </div>

              <div className="form-field" style={{ gridColumn: "1 / -1" }}>
                <label>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Short description or why this is interesting."
                />
              </div>

              <div className="form-field">
                <label>Nearest airport code</label>
                <input
                  value={form.airportCode}
                  onChange={(e) => handleChange("airportCode", e.target.value)}
                  placeholder="e.g. CUN, AUS"
                />
              </div>

              <div className="form-field">
                <label>Distance from airport (miles)</label>
                <input
                  value={form.distanceFromAirportMiles}
                  onChange={(e) =>
                    handleChange("distanceFromAirportMiles", e.target.value)
                  }
                  placeholder="e.g. 25"
                />
              </div>

              <div className="form-field">
                <label>Drive time from airport (min)</label>
                <input
                  value={form.driveTimeFromAirportMin}
                  onChange={(e) =>
                    handleChange("driveTimeFromAirportMin", e.target.value)
                  }
                  placeholder="e.g. 45"
                />
              </div>

              <div className="form-field">
                <label>Avg high (°F)</label>
                <input
                  value={form.avgHighTempF}
                  onChange={(e) =>
                    handleChange("avgHighTempF", e.target.value)
                  }
                  placeholder="e.g. 85"
                />
              </div>

              <div className="form-field">
                <label>Avg low (°F)</label>
                <input
                  value={form.avgLowTempF}
                  onChange={(e) =>
                    handleChange("avgLowTempF", e.target.value)
                  }
                  placeholder="e.g. 72"
                />
              </div>

              <div className="form-field" style={{ gridColumn: "1 / -1" }}>
                <label>Weather summary</label>
                <input
                  value={form.weatherSummary}
                  onChange={(e) =>
                    handleChange("weatherSummary", e.target.value)
                  }
                  placeholder="Warm, humid, chance of afternoon storms."
                />
              </div>

              <div className="form-field">
                <label>Nightly cost total (USD)</label>
                <input
                  value={form.nightlyCostTotalUsd}
                  onChange={(e) =>
                    handleChange("nightlyCostTotalUsd", e.target.value)
                  }
                  placeholder="e.g. 2000"
                />
              </div>

              <div className="form-field">
                <label>Nightly cost per person (USD)</label>
                <input
                  value={form.nightlyCostPerPersonUsd}
                  onChange={(e) =>
                    handleChange("nightlyCostPerPersonUsd", e.target.value)
                  }
                  placeholder="e.g. 130"
                />
              </div>

              <div className="form-field">
                <label>Bedrooms</label>
                <input
                  type="number"
                  value={form.bedrooms}
                  onChange={(e) =>
                    handleChange("bedrooms", e.target.value)
                  }
                  placeholder="e.g. 5"
                />
              </div>

              <div className="form-field">
                <label>Bathrooms</label>
                <input
                  type="number"
                  value={form.bathrooms}
                  onChange={(e) =>
                    handleChange("bathrooms", e.target.value)
                  }
                  placeholder="e.g. 3"
                />
              </div>

              <div className="form-field">
                <label>Distance from Houston (miles)</label>
                <input
                  value={form.distanceFromHoustonMiles}
                  onChange={(e) =>
                    handleChange("distanceFromHoustonMiles", e.target.value)
                  }
                  placeholder="e.g. 800"
                />
              </div>

              <div className="form-field">
                <label>Flight duration from Houston (hours)</label>
                <input
                  value={form.flightDurationHours}
                  onChange={(e) =>
                    handleChange("flightDurationHours", e.target.value)
                  }
                  placeholder="e.g. 2.5"
                />
              </div>

              <div className="form-field">
                <label>Distance from Boston (miles)</label>
                <input
                  value={form.distanceFromBostonMiles}
                  onChange={(e) =>
                    handleChange("distanceFromBostonMiles", e.target.value)
                  }
                  placeholder="e.g. 1500"
                />
              </div>

              <div className="form-field">
                <label>Flight duration from Boston (hours)</label>
                <input
                  value={form.flightDurationFromBostonHours}
                  onChange={(e) =>
                    handleChange("flightDurationFromBostonHours", e.target.value)
                  }
                  placeholder="e.g. 4.5"
                />
              </div>
              </div>

              <button
                type="submit"
                className="button-primary"
                disabled={saving}
              >
                {saving ? "Saving..." : editingId ? "Update destination" : "Add destination"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main content */}
      <section>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <h2>Destinations</h2>
              <span>
                Cards for vibe, table for side-by-side tradeoffs.
              </span>
            </div>

            {/* Sort dropdown */}
            {destinations.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="sort-select" style={{ marginRight: 8, fontSize: "0.9rem", color: "#6b7280" }}>
                  Sort by:
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "recent" | "votes" | "name")}
                  style={{
                    padding: "4px 8px",
                    fontSize: "0.9rem",
                    borderRadius: "4px",
                    border: "1px solid #d1d5db",
                  }}
                >
                  <option value="votes">Most votes</option>
                  <option value="recent">Most recent</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            )}

            {loading ? (
              <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                Loading destinations...
              </p>
            ) : destinations.length === 0 ? (
              <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                No destinations yet. Click "Add destination" to get started.
              </p>
            ) : (
              <div className="cards-grid">
                {sortedDestinations.map((d) => (
                  <DestinationCard
                    key={d.id}
                    destination={d}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onVote={handleVote}
                  />
                ))}
              </div>
            )}
          </div>

          {destinations.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2>Tradeoff comparison</h2>
                <span>
                  Scan costs, distance, and weather for all options.
                </span>
              </div>
              <ComparisonTable destinations={sortedDestinations} onVote={handleVote} />
            </div>
          )}
      </section>
    </div>
  );
}

function DestinationCard({
  destination,
  onEdit,
  onDelete,
  onVote
}: {
  destination: Destination;
  onEdit: (destination: Destination) => void;
  onDelete: (id: string) => void;
  onVote: (id: string) => void;
}) {
  const {
    name,
    type,
    imageUrl,
    propertyUrl,
    notes,
    flightDurationHours,
    flightDurationFromBostonHours,
    nightlyCostTotalUsd,
    airportCode,
    bedrooms,
    bathrooms,
    voteCount,
    hasVoted
  } = destination;

  const typeLabel = type === "RESORT" ? "Resort" : "Airbnb / Vacation Rental";

  return (
    <article className="destination-card">
      <div className="destination-image">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={name} />
        ) : null}
        <div className="destination-tag">{typeLabel}</div>
      </div>
      <div className="destination-content">
        <div className="destination-title-row">
          <div className="destination-title">{name}</div>
          {propertyUrl && (
            <a
              href={propertyUrl}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: "0.7rem" }}
            >
              View link
            </a>
          )}
        </div>
        {notes && <p className="destination-notes">{notes}</p>}

        {/* Vote button */}
        <div style={{ marginTop: 8, marginBottom: 8 }}>
          <button
            onClick={() => onVote(destination.id)}
            style={{
              padding: "6px 12px",
              fontSize: "0.85rem",
              borderRadius: "6px",
              border: hasVoted ? "2px solid #2563eb" : "2px solid #d1d5db",
              background: hasVoted ? "#eff6ff" : "white",
              color: hasVoted ? "#2563eb" : "#6b7280",
              cursor: "pointer",
              fontWeight: hasVoted ? "600" : "normal",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            aria-label={hasVoted ? "Remove vote" : "Vote for this destination"}
          >
            <span style={{ fontSize: "1rem" }}>⬆</span>
            <span>{voteCount} {voteCount === 1 ? "vote" : "votes"}</span>
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px", marginTop: 8 }}>
          <button
            onClick={() => onEdit(destination)}
            style={{
              flex: 1,
              padding: "4px 8px",
              fontSize: "0.7rem",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              background: "transparent",
              color: "#6b7280",
              cursor: "pointer"
            }}
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(destination.id)}
            style={{
              flex: 1,
              padding: "4px 8px",
              fontSize: "0.7rem",
              borderRadius: "4px",
              border: "1px solid #dc2626",
              background: "transparent",
              color: "#dc2626",
              cursor: "pointer"
            }}
          >
            Delete
          </button>
        </div>
        <div className="badges-row">
          {(bedrooms != null || bathrooms != null) && (
            <span className="badge">
              {bedrooms != null && `${bedrooms} bed`}
              {bedrooms != null && bathrooms != null && " · "}
              {bathrooms != null && `${bathrooms} bath`}
            </span>
          )}
          {flightDurationHours != null && flightDurationHours > 0 && (
            <span className="badge">
              {flightDurationHours.toFixed(1)}h from Houston
            </span>
          )}
          {flightDurationFromBostonHours != null && flightDurationFromBostonHours > 0 && (
            <span className="badge">
              {flightDurationFromBostonHours.toFixed(1)}h from Boston
            </span>
          )}
          {nightlyCostTotalUsd != null && (
            <span className="badge">
              ${nightlyCostTotalUsd.toFixed(0)}/night total
            </span>
          )}
          {airportCode && (
            <span className="badge">
              Airport: {airportCode.toUpperCase()}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function ComparisonTable({ destinations, onVote }: { destinations: Destination[], onVote: (id: string) => void }) {
  return (
    <div className="table-wrapper">
      <table className="comparison-table">
        <thead>
          <tr>
            <th>Votes</th>
            <th>Destination</th>
            <th>Type</th>
            <th>Capacity</th>
            <th>Airport / Distance</th>
            <th>Weather</th>
            <th>Cost (nightly)</th>
            <th>Travel Time</th>
          </tr>
        </thead>
        <tbody>
          {destinations.map((d) => (
            <tr key={d.id}>
              <td>
                <button
                  onClick={() => onVote(d.id)}
                  style={{
                    padding: "4px 10px",
                    fontSize: "0.8rem",
                    borderRadius: "4px",
                    border: d.hasVoted ? "2px solid #2563eb" : "2px solid #d1d5db",
                    background: d.hasVoted ? "#eff6ff" : "white",
                    color: d.hasVoted ? "#2563eb" : "#6b7280",
                    cursor: "pointer",
                    fontWeight: d.hasVoted ? "600" : "normal",
                    whiteSpace: "nowrap",
                  }}
                  aria-label={d.hasVoted ? "Remove vote" : "Vote for this destination"}
                >
                  ⬆ {d.voteCount}
                </button>
              </td>
              <td>{d.name}</td>
              <td>{d.type === "RESORT" ? "Resort" : "Vacation rental"}</td>
              <td>
                {(d.bedrooms != null || d.bathrooms != null) ? (
                  <>
                    {d.bedrooms != null && `${d.bedrooms} bed`}
                    {d.bedrooms != null && d.bathrooms != null && " · "}
                    {d.bathrooms != null && `${d.bathrooms} bath`}
                  </>
                ) : (
                  <span style={{ color: "#9ca3af" }}>—</span>
                )}
              </td>
              <td>
                {d.airportCode && <div>{d.airportCode.toUpperCase()}</div>}
                {(d.distanceFromAirportMiles != null ||
                  d.driveTimeFromAirportMin != null) && (
                  <div style={{ color: "#6b7280" }}>
                    {d.distanceFromAirportMiles != null &&
                      `${d.distanceFromAirportMiles.toFixed(0)} mi`}
                    {d.distanceFromAirportMiles != null &&
                      d.driveTimeFromAirportMin != null &&
                      " · "}
                    {d.driveTimeFromAirportMin != null &&
                      `${d.driveTimeFromAirportMin} min`}
                  </div>
                )}
              </td>
              <td>
                {(d.avgHighTempF != null || d.avgLowTempF != null) && (
                  <div>
                    {d.avgHighTempF != null &&
                      `High ${d.avgHighTempF.toFixed(0)}°F`}
                    {d.avgHighTempF != null && d.avgLowTempF != null && " / "}
                    {d.avgLowTempF != null &&
                      `Low ${d.avgLowTempF.toFixed(0)}°F`}
                  </div>
                )}
                {d.weatherSummary && (
                  <div style={{ color: "#6b7280" }}>{d.weatherSummary}</div>
                )}
              </td>
              <td>
                {d.nightlyCostTotalUsd != null && (
                  <div>
                    Total ${d.nightlyCostTotalUsd.toFixed(0)}
                  </div>
                )}
                {d.nightlyCostPerPersonUsd != null && (
                  <div style={{ color: "#6b7280" }}>
                    ${d.nightlyCostPerPersonUsd.toFixed(0)} / person
                  </div>
                )}
              </td>
              <td>
                {d.flightDurationHours != null && d.flightDurationHours > 0 && (
                  <div>
                    {d.flightDurationHours.toFixed(1)}h from Houston
                  </div>
                )}
                {d.flightDurationHours === 0 && (
                  <div>Drive from Houston</div>
                )}
                {d.flightDurationFromBostonHours != null && d.flightDurationFromBostonHours > 0 && (
                  <div style={{ color: "#6b7280" }}>
                    {d.flightDurationFromBostonHours.toFixed(1)}h from Boston
                  </div>
                )}
                {d.flightDurationFromBostonHours === 0 && (
                  <div style={{ color: "#6b7280" }}>Drive from Boston</div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
