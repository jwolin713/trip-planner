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
  priceRange: "BUDGET" | "MODERATE" | "EXPENSIVE" | "LUXURY" | null;
  isAllInclusive: boolean | null;
  distanceFromHoustonMiles: number | null;
  flightDurationHours: number | null;
  distanceFromBostonMiles: number | null;
  flightDurationFromBostonHours: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  voteCount: number;
  commentCount: number;
  hasVoted: boolean;
  createdAt: string;
  updatedAt: string;
};

type Comment = {
  id: string;
  destinationId: string;
  content: string;
  authorName: string;
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
  priceRange: string;
  isAllInclusive: string;
  distanceFromHoustonMiles: string;
  flightDurationHours: string;
  distanceFromBostonMiles: string;
  flightDurationFromBostonHours: string;
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
  priceRange: "",
  isAllInclusive: "",
  distanceFromHoustonMiles: "",
  flightDurationHours: "",
  distanceFromBostonMiles: "",
  flightDurationFromBostonHours: ""
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
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState<boolean>(false);
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | null>(null);

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
      priceRange: destination.priceRange || "",
      isAllInclusive: destination.isAllInclusive === null ? "" : destination.isAllInclusive ? "true" : "false",
      distanceFromHoustonMiles: destination.distanceFromHoustonMiles?.toString() || "",
      flightDurationHours: destination.flightDurationHours?.toString() || "",
      distanceFromBostonMiles: destination.distanceFromBostonMiles?.toString() || "",
      flightDurationFromBostonHours: destination.flightDurationFromBostonHours?.toString() || ""
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

      // Convert isAllInclusive from string to boolean
      const payload = {
        ...form,
        isAllInclusive: form.isAllInclusive === "true" ? true : form.isAllInclusive === "false" ? false : null
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
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

  function handleOpenComments(destinationId: string) {
    setSelectedDestinationId(destinationId);
    setIsCommentsModalOpen(true);
  }

  function handleCloseComments() {
    setIsCommentsModalOpen(false);
    setSelectedDestinationId(null);
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
          Add ideas, see them as cards, and compare tradeoffs side by side for the event of the year.
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

              <div className="form-field">
                <label>Price Range *</label>
                <select
                  value={form.priceRange}
                  onChange={(e) =>
                    handleChange("priceRange", e.target.value)
                  }
                  required
                >
                  <option value="">Select price tier...</option>
                  <option value="BUDGET">$ - Budget (Under $100/person/night)</option>
                  <option value="MODERATE">$$ - Moderate ($100-200/person/night)</option>
                  <option value="EXPENSIVE">$$$ - Expensive ($200-350/person/night)</option>
                  <option value="LUXURY">$$$$ - Luxury (Over $350/person/night)</option>
                </select>
              </div>

              <div className="form-field">
                <label>All-Inclusive?</label>
                <select
                  value={form.isAllInclusive}
                  onChange={(e) =>
                    handleChange("isAllInclusive", e.target.value)
                  }
                >
                  <option value="">Select...</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
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
                    onOpenComments={handleOpenComments}
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
              <ComparisonTable destinations={sortedDestinations} onVote={handleVote} onOpenComments={handleOpenComments} />
            </div>
          )}
      </section>

      {/* Comments Modal */}
      {isCommentsModalOpen && selectedDestinationId && (
        <CommentsModal
          destinationId={selectedDestinationId}
          destinationName={destinations.find(d => d.id === selectedDestinationId)?.name || ""}
          onClose={handleCloseComments}
          onCommentAdded={fetchDestinations}
        />
      )}
    </div>
  );
}

function DestinationCard({
  destination,
  onEdit,
  onDelete,
  onVote,
  onOpenComments
}: {
  destination: Destination;
  onEdit: (destination: Destination) => void;
  onDelete: (id: string) => void;
  onVote: (id: string) => void;
  onOpenComments: (id: string) => void;
}) {
  const {
    name,
    type,
    imageUrl,
    propertyUrl,
    flightDurationHours,
    flightDurationFromBostonHours,
    priceRange,
    isAllInclusive,
    airportCode,
    distanceFromAirportMiles,
    driveTimeFromAirportMin,
    voteCount,
    commentCount,
    hasVoted
  } = destination;

  // Helper function to display price tier
  const getPriceDisplay = (range: string | null) => {
    switch (range) {
      case "BUDGET": return "$";
      case "MODERATE": return "$$";
      case "EXPENSIVE": return "$$$";
      case "LUXURY": return "$$$$";
      default: return null;
    }
  };

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

        {/* Comments button */}
        <div style={{ marginBottom: 8 }}>
          <button
            onClick={() => onOpenComments(destination.id)}
            style={{
              padding: "6px 12px",
              fontSize: "0.85rem",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              background: "white",
              color: "#6b7280",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>💬</span>
            <span>{commentCount} {commentCount === 1 ? "comment" : "comments"}</span>
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
          {(distanceFromAirportMiles != null || driveTimeFromAirportMin != null) && (
            <span className="badge">
              {distanceFromAirportMiles != null && `${distanceFromAirportMiles.toFixed(0)} mi`}
              {distanceFromAirportMiles != null && driveTimeFromAirportMin != null && " · "}
              {driveTimeFromAirportMin != null && `${driveTimeFromAirportMin} min from airport`}
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
          {priceRange && (
            <span className="badge">
              {getPriceDisplay(priceRange)}
            </span>
          )}
          {isAllInclusive === true && (
            <span className="badge">
              All-Inclusive
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

function ComparisonTable({ destinations, onVote, onOpenComments }: { destinations: Destination[], onVote: (id: string) => void, onOpenComments: (id: string) => void }) {
  // Helper function to display price tier
  const getPriceDisplay = (range: string | null) => {
    switch (range) {
      case "BUDGET": return "$";
      case "MODERATE": return "$$";
      case "EXPENSIVE": return "$$$";
      case "LUXURY": return "$$$$";
      default: return null;
    }
  };

  return (
    <div className="table-wrapper">
      <table className="comparison-table">
        <thead>
          <tr>
            <th>Votes</th>
            <th>Comments</th>
            <th>Destination</th>
            <th>Notes</th>
            <th>Type</th>
            <th>Airport / Distance</th>
            <th>Weather</th>
            <th>Price</th>
            <th>All-Inclusive</th>
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
              <td>
                <button
                  onClick={() => onOpenComments(d.id)}
                  style={{
                    padding: "4px 10px",
                    fontSize: "0.8rem",
                    borderRadius: "4px",
                    border: "1px solid #d1d5db",
                    background: "white",
                    color: "#6b7280",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  💬 {d.commentCount}
                </button>
              </td>
              <td>{d.name}</td>
              <td>
                {d.notes ? (
                  <span style={{ color: "#374151" }}>{d.notes}</span>
                ) : (
                  <span style={{ color: "#9ca3af" }}>—</span>
                )}
              </td>
              <td>{d.type === "RESORT" ? "Resort" : "Vacation rental"}</td>
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
                {d.priceRange ? (
                  <div style={{ fontSize: "1.2rem", fontWeight: "600" }}>
                    {getPriceDisplay(d.priceRange)}
                  </div>
                ) : (
                  <span style={{ color: "#9ca3af" }}>—</span>
                )}
              </td>
              <td>
                {d.isAllInclusive === true ? (
                  <div>Yes</div>
                ) : d.isAllInclusive === false ? (
                  <div>No</div>
                ) : (
                  <span style={{ color: "#9ca3af" }}>—</span>
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

function CommentsModal({
  destinationId,
  destinationName,
  onClose,
  onCommentAdded
}: {
  destinationId: string;
  destinationName: string;
  onClose: () => void;
  onCommentAdded: () => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newCommentContent, setNewCommentContent] = useState<string>("");
  const [authorName, setAuthorName] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");

  useEffect(() => {
    // Load author name from localStorage
    const savedName = localStorage.getItem("commenterName");
    if (savedName) {
      setAuthorName(savedName);
    }

    // Fetch comments
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchComments() {
    setLoading(true);
    try {
      const res = await fetch(`/api/destinations/${destinationId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitComment(e: FormEvent) {
    e.preventDefault();

    if (!newCommentContent.trim() || !authorName.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/destinations/${destinationId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newCommentContent.trim(),
          authorName: authorName.trim()
        })
      });

      if (res.ok) {
        // Save author name to localStorage
        localStorage.setItem("commenterName", authorName.trim());

        // Refresh comments
        await fetchComments();
        setNewCommentContent("");

        // Notify parent to refresh destination counts
        onCommentAdded();
      } else {
        console.error("Failed to post comment");
      }
    } catch (err) {
      console.error("Error posting comment:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditComment(commentId: string) {
    if (!editContent.trim()) return;

    try {
      const res = await fetch(`/api/destinations/${destinationId}/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: editContent.trim(),
          authorName
        })
      });

      if (res.ok) {
        await fetchComments();
        setEditingCommentId(null);
        setEditContent("");
      } else {
        console.error("Failed to edit comment");
      }
    } catch (err) {
      console.error("Error editing comment:", err);
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const res = await fetch(
        `/api/destinations/${destinationId}/comments/${commentId}?authorName=${encodeURIComponent(authorName)}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        await fetchComments();
        onCommentAdded(); // Refresh counts
      } else {
        console.error("Failed to delete comment");
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px"
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          maxWidth: "600px",
          width: "100%",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.25rem" }}>
            Comments: {destinationName}
          </h2>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#6b7280"
            }}
          >
            ×
          </button>
        </div>

        {/* Comments list */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px"
          }}
        >
          {loading ? (
            <p style={{ color: "#6b7280" }}>Loading comments...</p>
          ) : comments.length === 0 ? (
            <p style={{ color: "#6b7280" }}>No comments yet. Be the first to comment!</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    padding: "12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px"
                    }}
                  >
                    <strong style={{ fontSize: "0.9rem" }}>{comment.authorName}</strong>
                    <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {editingCommentId === comment.id ? (
                    <div>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          resize: "vertical",
                          minHeight: "60px",
                          marginBottom: "8px"
                        }}
                      />
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handleEditComment(comment.id)}
                          style={{
                            padding: "4px 12px",
                            fontSize: "0.8rem",
                            borderRadius: "4px",
                            border: "1px solid #2563eb",
                            background: "#2563eb",
                            color: "white",
                            cursor: "pointer"
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditContent("");
                          }}
                          style={{
                            padding: "4px 12px",
                            fontSize: "0.8rem",
                            borderRadius: "4px",
                            border: "1px solid #d1d5db",
                            background: "white",
                            color: "#6b7280",
                            cursor: "pointer"
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p style={{ margin: "0 0 8px 0", fontSize: "0.9rem" }}>
                        {comment.content}
                      </p>
                      {comment.authorName === authorName && (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditContent(comment.content);
                            }}
                            style={{
                              padding: "2px 8px",
                              fontSize: "0.75rem",
                              borderRadius: "4px",
                              border: "1px solid #d1d5db",
                              background: "white",
                              color: "#6b7280",
                              cursor: "pointer"
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            style={{
                              padding: "2px 8px",
                              fontSize: "0.75rem",
                              borderRadius: "4px",
                              border: "1px solid #dc2626",
                              background: "white",
                              color: "#dc2626",
                              cursor: "pointer"
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New comment form */}
        <div
          style={{
            padding: "20px",
            borderTop: "1px solid #e5e7eb"
          }}
        >
          <form onSubmit={handleSubmitComment}>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "0.9rem", fontWeight: "500" }}>
                Your Name
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                required
                placeholder="Enter your name"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px"
                }}
              />
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "0.9rem", fontWeight: "500" }}>
                Comment
              </label>
              <textarea
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                required
                placeholder="Write your comment..."
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  resize: "vertical",
                  minHeight: "80px"
                }}
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !newCommentContent.trim() || !authorName.trim()}
              style={{
                padding: "8px 16px",
                fontSize: "0.9rem",
                borderRadius: "6px",
                border: "none",
                background: submitting || !newCommentContent.trim() || !authorName.trim() ? "#d1d5db" : "#2563eb",
                color: "white",
                cursor: submitting || !newCommentContent.trim() || !authorName.trim() ? "not-allowed" : "pointer"
              }}
            >
              {submitting ? "Posting..." : "Post Comment"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
