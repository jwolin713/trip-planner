"use client";

import { useEffect, useState, FormEvent } from "react";

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
  bedrooms: number | null;
  bathrooms: number | null;
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

  async function fetchDestinations() {
    setLoading(true);
    const res = await fetch("/api/destinations");
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
    fetchDestinations();
  }, []);

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
          flightDurationHours: data.flightDurationHours?.toString() || prev.flightDurationHours
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
                <label>Flight duration (hours)</label>
                <input
                  value={form.flightDurationHours}
                  onChange={(e) =>
                    handleChange("flightDurationHours", e.target.value)
                  }
                  placeholder="e.g. 2.5"
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
                {destinations.map((d) => (
                  <DestinationCard
                    key={d.id}
                    destination={d}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
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
              <ComparisonTable destinations={destinations} />
            </div>
          )}
      </section>
    </div>
  );
}

function DestinationCard({
  destination,
  onEdit,
  onDelete
}: {
  destination: Destination;
  onEdit: (destination: Destination) => void;
  onDelete: (id: string) => void;
}) {
  const {
    name,
    type,
    imageUrl,
    propertyUrl,
    notes,
    distanceFromHoustonMiles,
    nightlyCostTotalUsd,
    airportCode,
    bedrooms,
    bathrooms
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
          {distanceFromHoustonMiles != null && (
            <span className="badge">
              {distanceFromHoustonMiles.toFixed(0)} mi from Houston
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

function ComparisonTable({ destinations }: { destinations: Destination[] }) {
  return (
    <div className="table-wrapper">
      <table className="comparison-table">
        <thead>
          <tr>
            <th>Destination</th>
            <th>Type</th>
            <th>Capacity</th>
            <th>Airport / Distance</th>
            <th>Weather</th>
            <th>Cost (nightly)</th>
            <th>From Houston</th>
          </tr>
        </thead>
        <tbody>
          {destinations.map((d) => (
            <tr key={d.id}>
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
                {d.distanceFromHoustonMiles != null && (
                  <div>{d.distanceFromHoustonMiles.toFixed(0)} mi</div>
                )}
                {d.flightDurationHours != null && d.flightDurationHours > 0 && (
                  <div style={{ color: "#6b7280" }}>
                    ~{d.flightDurationHours.toFixed(1)} h flight
                  </div>
                )}
                {d.flightDurationHours === 0 && (
                  <div style={{ color: "#6b7280" }}>Drive from Houston</div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
